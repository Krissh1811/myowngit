const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { 
    isInitialized, 
    getCurrentBranch, 
    getBranchHash, 
    getCommitData, 
    branchExists, 
    updateBranch, 
    readObject, 
    getIndex 
} = require("./utils");

function findCommonAncestor(hash1, hash2) {
    if (!hash1 || !hash2) return null;
    
    const ancestors1 = new Set();
    let current = hash1;
    
    while (current) {
        ancestors1.add(current);
        const commitData = getCommitData(current);
        current = commitData ? commitData.parent : null;
    }
    
    current = hash2;
    while (current) {
        if (ancestors1.has(current)) {
            return current;
        }
        const commitData = getCommitData(current);
        current = commitData ? commitData.parent : null;
    }
    
    return null;
}

function getFileContent(commitHash, filename) {
    if (!commitHash) return null;
    
    const commitData = getCommitData(commitHash);
    if (!commitData || !commitData.files || !commitData.files[filename]) {
        return null;
    }
    
    const fileHash = commitData.files[filename];
    return readObject(fileHash);
}

function mergeFiles(filename, baseContent, currentContent, incomingContent) {

    if (baseContent === currentContent && baseContent !== incomingContent) {
        return { content: incomingContent, hasConflict: false };
    }
    
    if (baseContent !== currentContent && baseContent === incomingContent) {
        return { content: currentContent, hasConflict: false };
    }
    
    if (currentContent === incomingContent) {
        return { content: currentContent, hasConflict: false };
    }
    
    const conflictContent = `<<<<<<< HEAD (${getCurrentBranch()})
${currentContent || ""}
=======
${incomingContent || ""}
>>>>>>> ${filename}
`;
    
    return { content: conflictContent, hasConflict: true };
}

function mergeBranches(branchName) {
    if (!isInitialized()) {
        console.error("! Repository not initialized. Run init first.");
        return;
    }

    if (!branchName) {
        console.error("! Please provide a branch name to merge.");
        return;
    }

    if (!branchExists(branchName)) {
        console.error(`! Branch '${branchName}' does not exist.`);
        return;
    }

    const currentBranch = getCurrentBranch();
    
    if (currentBranch === branchName) {
        console.error(`! Cannot merge branch '${branchName}' into itself.`);
        return;
    }

    const index = getIndex();
    if (Object.keys(index).length > 0) {
        console.error("! Please commit or stash your changes before merging.");
        return;
    }

    const currentHash = getBranchHash(currentBranch);
    const incomingHash = getBranchHash(branchName);

    if (!currentHash) {
        console.error(`! Current branch '${currentBranch}' has no commits.`);
        return;
    }

    if (!incomingHash) {
        console.error(`! Branch '${branchName}' has no commits.`);
        return;
    }

    if (currentHash === incomingHash) {
        console.log("✅ Already up to date.");
        return;
    }

    const commonAncestor = findCommonAncestor(currentHash, incomingHash);
    
    if (!commonAncestor) {
        console.error("! No common ancestor found. Cannot merge unrelated histories.");
        return;
    }

    if (commonAncestor === currentHash) {
        updateBranch(currentBranch, incomingHash);
        console.log(`✅ Fast-forward merge completed.`);
        console.log(`📍 ${currentBranch} now points to ${incomingHash}`);
        return;
    }

    const baseCommit = getCommitData(commonAncestor);
    const currentCommit = getCommitData(currentHash);
    const incomingCommit = getCommitData(incomingHash);

    const baseFiles = baseCommit ? baseCommit.files || {} : {};
    const currentFiles = currentCommit ? currentCommit.files || {} : {};
    const incomingFiles = incomingCommit ? incomingCommit.files || {} : {};

    const allFiles = new Set([
        ...Object.keys(baseFiles),
        ...Object.keys(currentFiles),
        ...Object.keys(incomingFiles)
    ]);

    const mergedFiles = {};
    const conflicts = [];
    const sha1 = require("sha1");

    console.log(`🔄 Merging ${branchName} into ${currentBranch}...`);

    for (const filename of allFiles) {
        const baseContent = getFileContent(commonAncestor, filename);
        const currentContent = getFileContent(currentHash, filename);
        const incomingContent = getFileContent(incomingHash, filename);

        if (!currentContent && !incomingContent) {
            continue;
        }

        if (!currentContent) {
            if (baseContent === incomingContent) {
                continue;
            } else {
                console.log(`📝 Restoring ${filename} (deleted locally, modified in ${branchName})`);
                const hash = sha1(incomingContent);
                mergedFiles[filename] = hash;
                
                const objectPath = path.join(".mygit", "objects", hash);
                fs.writeFileSync(objectPath, incomingContent);
            }
            continue;
        }

        if (!incomingContent) {
            if (baseContent === currentContent) {
                continue;
            } else {
                console.log(`📝 Keeping ${filename} (modified locally, deleted in ${branchName})`);
                mergedFiles[filename] = currentFiles[filename];
            }
            continue;
        }

        const mergeResult = mergeFiles(filename, baseContent, currentContent, incomingContent);
        
        if (mergeResult.hasConflict) {
            conflicts.push(filename);
            console.log(`❌ Conflict in ${filename}`);
        } else {
            console.log(`✅ Merged ${filename}`);
        }

        const hash = sha1(mergeResult.content);
        mergedFiles[filename] = hash;
        
        const objectPath = path.join(".mygit", "objects", hash);
        fs.writeFileSync(objectPath, mergeResult.content);

        if (mergeResult.hasConflict) {
            fs.writeFileSync(filename, mergeResult.content);
        }
    }

    if (conflicts.length > 0) {
        console.log(`\n❌ Merge completed with conflicts in ${conflicts.length} file(s):`);
        conflicts.forEach(file => console.log(`   - ${file}`));
        console.log("\n💡 Please resolve conflicts and commit the merge.");
        
        const indexPath = path.join(".mygit", "index.json");
        fs.writeFileSync(indexPath, JSON.stringify(mergedFiles, null, 2));
        
        return;
    }

    const timestamp = new Date().toISOString();
    const mergeCommitData = {
        parent: currentHash,
        mergeParent: incomingHash,
        message: `Merge branch '${branchName}' into ${currentBranch}`,
        timestamp,
        files: mergedFiles,
        branch: currentBranch,
        isMerge: true
    };

    const content = JSON.stringify(mergeCommitData, null, 2);
    const mergeHash = crypto.createHash("sha1").update(content).digest("hex");

    const commitPath = path.join(".mygit", "commits", mergeHash + ".json");
    fs.writeFileSync(commitPath, content);
    
    updateBranch(currentBranch, mergeHash);

    console.log(`\n✅ Merge completed successfully!`);
    console.log(`📍 Created merge commit: ${mergeHash}`);
    console.log(`🌿 ${currentBranch} now includes changes from ${branchName}`);
}

function abortMerge() {
    if (!isInitialized()) {
        console.error("! Repository not initialized.");
        return;
    }

    const indexPath = path.join(".mygit", "index.json");
    fs.writeFileSync(indexPath, JSON.stringify({}));
    
    console.log("✅ Merge aborted. Index cleared.");
    console.log("💡 Note: You may need to manually clean up conflicted files.");
}

module.exports = {
    mergeBranches,
    abortMerge,
};