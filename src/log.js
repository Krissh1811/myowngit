const fs = require("fs");
const path = require("path");
const { getGitDir, getCurrentBranch, getBranchHash, getCommitData } = require("./utils");

function showLog() {
    const gitPath = getGitDir();
    const currentBranch = getCurrentBranch();
    
    console.log(`📜 Log for branch: ${currentBranch}\n`);

    let currentHash = getBranchHash(currentBranch);

    if (!currentHash) {
        console.log("📭 No commits yet.");
        return;
    }

    let commitCount = 0;
    while (currentHash) {
        const commitData = getCommitData(currentHash);
        if (!commitData) break;

        commitCount++;
        console.log(`🔸 Commit: ${currentHash}`);
        console.log(`📅 Date: ${commitData.timestamp || "N/A"}`);
        console.log(`📝 Message: ${commitData.message || "N/A"}`);
        console.log(`🌿 Branch: ${commitData.branch || currentBranch}`);
        
        if (commitData.files) {
            const fileCount = Object.keys(commitData.files).length;
            console.log(`📁 Files: ${fileCount} file(s) changed`);
        }
        
        console.log();

        currentHash = commitData.parent;
    }

    console.log(`📊 Total commits: ${commitCount}`);
}

module.exports = { showLog };