 const fs = require("fs");
const path = require("path");
const { isInitialized, getCurrentBranch, getBranchHash, getCommitData } = require("./utils");

function addRemote(remoteName, remotePath) {
    if (!isInitialized()) {
        console.error("! Repository not initialized. Run init first.");
        return;
    }

    if (!remoteName || !remotePath) {
        console.error("! Please provide remote name and path.");
        return;
    }

    const configPath = path.join(".mygit", "config.json");
    let config = { remotes: {} };
    
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }

    if (!config.remotes) config.remotes = {};

    // Resolve relative paths
    const resolvedPath = path.resolve(remotePath);
    config.remotes[remoteName] = resolvedPath;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Remote '${remoteName}' added: ${resolvedPath}`);
}

function listRemotes() {
    if (!isInitialized()) {
        console.error("! Repository not initialized. Run init first.");
        return;
    }

    const configPath = path.join(".mygit", "config.json");
    if (!fs.existsSync(configPath)) {
        console.log("📭 No remotes configured.");
        return;
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const remotes = config.remotes || {};

    if (Object.keys(remotes).length === 0) {
        console.log("📭 No remotes configured.");
        return;
    }

    console.log("🌐 Configured remotes:\n");
    for (const [name, path] of Object.entries(remotes)) {
        console.log(`  ${name} -> ${path}`);
    }
}

function pushToRemote(remoteName, branchName) {
    if (!isInitialized()) {
        console.error("! Repository not initialized. Run init first.");
        return;
    }

    // Default to current branch if not specified
    if (!branchName) {
        branchName = getCurrentBranch();
    }

    // Default to 'origin' if remote not specified
    if (!remoteName) {
        remoteName = 'origin';
    }

    const configPath = path.join(".mygit", "config.json");
    if (!fs.existsSync(configPath)) {
        console.error("! No remotes configured. Add a remote first.");
        return;
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const remotes = config.remotes || {};

    if (!remotes[remoteName]) {
        console.error(`! Remote '${remoteName}' not found.`);
        return;
    }

    const remotePath = remotes[remoteName];
    const currentHash = getBranchHash(branchName);

    if (!currentHash) {
        console.error(`! Branch '${branchName}' has no commits to push.`);
        return;
    }

    try {
        // Create remote directory structure if it doesn't exist
        if (!fs.existsSync(remotePath)) {
            fs.mkdirSync(remotePath, { recursive: true });
            fs.mkdirSync(path.join(remotePath, "commits"));
            fs.mkdirSync(path.join(remotePath, "objects"));
            fs.mkdirSync(path.join(remotePath, "refs", "heads"), { recursive: true });
        }

        // Copy all commits in the branch history
        const commitsToCopy = [];
        let hash = currentHash;
        
        while (hash) {
            commitsToCopy.push(hash);
            const commitData = getCommitData(hash);
            if (!commitData) break;
            hash = commitData.parent;
        }

        // Copy commits and objects
        for (const commitHash of commitsToCopy.reverse()) {
            // Copy commit file
            const localCommitPath = path.join(".mygit", "commits", commitHash + ".json");
            const remoteCommitPath = path.join(remotePath, "commits", commitHash + ".json");
            
            if (fs.existsSync(localCommitPath) && !fs.existsSync(remoteCommitPath)) {
                fs.copyFileSync(localCommitPath, remoteCommitPath);
                
                // Copy associated objects (files)
                const commitData = getCommitData(commitHash);
                if (commitData && commitData.files) {
                    for (const fileHash of Object.values(commitData.files)) {
                        const localObjectPath = path.join(".mygit", "objects", fileHash);
                        const remoteObjectPath = path.join(remotePath, "objects", fileHash);
                        
                        if (fs.existsSync(localObjectPath) && !fs.existsSync(remoteObjectPath)) {
                            fs.copyFileSync(localObjectPath, remoteObjectPath);
                        }
                    }
                }
            }
        }

        // Update remote branch reference
        const remoteBranchPath = path.join(remotePath, "refs", "heads", branchName);
        fs.writeFileSync(remoteBranchPath, currentHash);

        console.log(`✅ Successfully pushed to ${remoteName}/${branchName}`);
        console.log(`📍 Remote now at: ${currentHash}`);
        console.log(`🌐 Remote path: ${remotePath}`);
        
    } catch (error) {
        console.error(`! Error pushing to remote: ${error.message}`);
    }
}

module.exports = {
    addRemote,
    listRemotes,
    pushToRemote,
};
