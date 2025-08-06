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
    
    // Get all ancestors of first branch
    const ancestors1 = new Set();
    let current = hash1;
    
    while (current) {
        ancestors1.add(current);
        const commitData = getCommitData(current);
        current = commitData ? commitData.parent : null;
    }
    
    // Find first common ancestor in second branch
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
    // Simple merge strategy:
    // 1. If base == current and base != incoming -> take incoming (they changed it)
    // 2. If base != current and base == incoming -> take current (we changed it)
    // 3. If base != current and base != incoming:
    //    - If current == incoming -> no conflict
    //    - If current != incoming -> conflict!

    if (baseContent === currentContent && baseContent !== incomingContent) {
        // They changed it, we didn't
        return { content: incomingContent, hasConflict: false };
    }
    
    if (baseContent !== currentContent && baseContent === incomingContent) {
        // We changed it, they didn't
        return { content: currentContent, hasConflict: false };
    }
    
    if (currentContent === incomingContent) {
        // Same changes
        return { content: currentContent, hasConflict: false };
    }
    
    // Conflict! Create conflict markers
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

    // Check if working directory is clean
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

    // Check if already up to date
    if (currentHash === incomingHash) {
        console.log("✅ Already up to date.");
        return;
    }

    // Find common ancestor
    const commonAncestor = findCommonAncestor(currentHash, incomingHash);
    
    if (!commonAncestor) {
        console.error("! No common ancestor found. Cannot merge unrelated histories.");
        return;
    }

    // Check if fast-forward merge is possible
    if (commonAncestor === currentHash) {
        // Fast-forward merge
        updateBranch(currentBranch, incomingHash);
        console.log(`✅ Fast-forward merge completed.`);
        console.log(`📍 ${currentBranch} now points to ${incomingHash}`);
        return;
    }

    // Get file lists from all three commits
    const baseCommit = getCommitData(commonAncestor);
    const currentCommit = getCommitData(currentHash);
    const incomingCommit = getCommitData(incomingHash);

    const baseFiles = baseCommit ? baseCommit.files || {} : {};
    const currentFiles = currentCommit ? currentCommit.files || {} : {};
    const incomingFiles = incomingCommit ? incomingCommit.files || {} : {};

    // Get all unique filenames
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
            // File was deleted in both branches, skip it
            continue;
        }

        if (!currentContent) {
            // File was deleted in current branch but exists in incoming
            if (baseContent === incomingContent) {
                // They didn't change it, we deleted it - keep deleted
                continue;
            } else {
                // They changed it, we deleted it - conflict or restore their version
                console.log(`📝 Restoring ${filename} (deleted locally, modified in ${branchName})`);
                const hash = sha1(incomingContent);
                mergedFiles[filename] = hash;
                
                // Write to objects
                const objectPath = path.join(".mygit", "objects", hash);
                fs.writeFileSync(objectPath, incomingContent);
            }
            continue;
        }

        if (!incomingContent) {
            // File exists in current but was deleted in incoming
            if (baseContent === currentContent) {
                // We didn't change it, they deleted it - delete it
                continue;
            } else {
                // We changed it, they deleted it - keep our version
                console.log(`📝 Keeping ${filename} (modified locally, deleted in ${branchName})`);
                mergedFiles[filename] = currentFiles[filename];
            }
            continue;
        }

        // Both branches have the file, attempt merge
        const mergeResult = mergeFiles(filename, baseContent, currentContent, incomingContent);
        
        if (mergeResult.hasConflict) {
            conflicts.push(filename);
            console.log(`❌ Conflict in ${filename}`);
        } else {
            console.log(`✅ Merged ${filename}`);
        }

        // Store merged content
        const hash = sha1(mergeResult.content);
        mergedFiles[filename] = hash;
        
        // Write to objects
        const objectPath = path.join(".mygit", "objects", hash);
        fs.writeFileSync(objectPath, mergeResult.content);

        // If there's a conflict, also write the conflicted file to working directory
        if (mergeResult.hasConflict) {
            fs.writeFileSync(filename, mergeResult.content);
        }
    }

    if (conflicts.length > 0) {
        console.log(`\n❌ Merge completed with conflicts in ${conflicts.length} file(s):`);
        conflicts.forEach(file => console.log(`   - ${file}`));
        console.log("\n💡 Please resolve conflicts and commit the merge.");
        
        // Update index with merged files (including conflicts)
        const indexPath = path.join(".mygit", "index.json");
        fs.writeFileSync(indexPath, JSON.stringify(mergedFiles, null, 2));
        
        return;
    }

    // No conflicts, create merge commit
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

    // Save merge commit
    const commitPath = path.join(".mygit", "commits", mergeHash + ".json");
    fs.writeFileSync(commitPath, content);
    
    // Update current branch
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

    // Simple abort - just clear the index
    const indexPath = path.join(".mygit", "index.json");
    fs.writeFileSync(indexPath, JSON.stringify({}));
    
    console.log("✅ Merge aborted. Index cleared.");
    console.log("💡 Note: You may need to manually clean up conflicted files.");
}

module.exports = {
    mergeBranches,
    abortMerge,
};