const fs = require("fs");
const path = require("path");
const { getGitDir, getCurrentBranch, isInitialized, getAllBranches, branchExists, getHeadCommitHash, updateBranch, updateHead } = require("./utils");

function listBranches() {
    if (!isInitialized()) {
        console.error("! Repository not initialized. Run init first.");
        return;
    }

    const branches = getAllBranches();
    const currentBranch = getCurrentBranch();

    if (branches.length === 0) {
        console.log("📭 No branches found.");
        return;
    }

    console.log("🌿 Branches:\n");
    for (const branch of branches) {
        if (branch === currentBranch) {
            console.log(`* 🌿 ${branch} (current)`);
        } else {
            console.log(`  🌿 ${branch}`);
        }
    }
}

function createBranch(branchName) {
    if (!isInitialized()) {
        console.error("! Repository not initialized. Run init first.");
        return;
    }

    if (!branchName) {
        console.error("! Please provide a branch name.");
        return;
    }

    if (branchExists(branchName)) {
        console.error(`! Branch '${branchName}' already exists.`);
        return;
    }

    const headHash = getHeadCommitHash();
    updateBranch(branchName, headHash || "");
    
    console.log(`✅ Branch '${branchName}' created`);
    if (headHash) {
        console.log(`📍 Points to commit: ${headHash}`);
    } else {
        console.log(`📍 Points to initial commit (will be set on first commit)`);
    }
}

function switchBranch(branchName) {
    if (!isInitialized()) {
        console.error("! Repository not initialized. Run init first.");
        return;
    }

    if (!branchName) {
        console.error("! Please provide a branch name.");
        return;
    }

    if (!branchExists(branchName)) {
        console.error(`! Branch '${branchName}' does not exist.`);
        return;
    }

    const currentBranch = getCurrentBranch();
    if (currentBranch === branchName) {
        console.log(`Already on branch '${branchName}'`);
        return;
    }

    updateHead(branchName);
    console.log(`✅ Switched to branch '${branchName}'`);
}

module.exports = {
    listBranches,
    createBranch,
    switchBranch,
};
