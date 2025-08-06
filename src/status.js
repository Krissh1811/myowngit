const { getHeadCommitHash, getIndex, getCommitData, getCurrentBranch } = require("./utils");

function showStatus() {
    const index = getIndex();
    const headHash = getHeadCommitHash();
    const currentBranch = getCurrentBranch();

    console.log(`📍 On branch ${currentBranch}`);

    if (Object.keys(index).length === 0) {
        console.log("✅ Nothing to commit, working tree clean.");
        return;
    }

    // First commit case or missing commit data
    if (!headHash) {
        console.log("\n📋 Changes to be committed:");
        for (const file in index) {
            console.log(`\t🆕 New file: ${file}`);
        }
        return;
    }

    const lastCommit = getCommitData(headHash);

    if (!lastCommit || !lastCommit.files) {
        console.log("\n📋 Changes to be committed:");
        for (const file in index) {
            console.log(`\t🆕 New file: ${file}`);
        }
        return;
    }

    const lastFiles = lastCommit.files;
    const toBeCommitted = [];

    for (const file in index) {
        const currentHash = index[file];
        const committedHash = lastFiles[file];
        if (!committedHash) {
            toBeCommitted.push({ file, type: "New file", emoji: "🆕" });
        } else if (committedHash !== currentHash) {
            toBeCommitted.push({ file, type: "Modified", emoji: "✏️" });
        }
    }

    if (toBeCommitted.length > 0) {
        console.log("\n📋 Changes to be committed:");
        for (const { file, type, emoji } of toBeCommitted) {
            console.log(`\t${emoji} ${type}: ${file}`);
        }
    } else {
        console.log("\n✅ Nothing to commit, working tree clean.");
    }
}

module.exports = { showStatus };