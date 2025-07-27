const { getHeadCommitHash, getIndex, getCommitData } = require("./utils");

function showStatus() {
    const index = getIndex();
    const headHash = getHeadCommitHash();

    if (Object.keys(index).length === 0) {
        console.log(" Nothing to commit, working tree clean.");
        return;
    }

    // First commit case
    if (!headHash) {
        console.log("Changes to be committed:");
        for (const file in index) {
            console.log(`\tNew file: ${file}`);
        }
        return;
    }

    const lastCommit = getCommitData(headHash);
    const lastFiles = lastCommit.files || {};

    const toBeCommitted = [];

    for (const file in index) {
        const currentHash = index[file];
        const committedHash = lastFiles[file];
        if (!committedHash) {
            toBeCommitted.push({ file, type: "New file" });
        } else if (committedHash !== currentHash) {
            toBeCommitted.push({ file, type: "Modified" });
        }
    }

    if (toBeCommitted.length > 0) {
        console.log("Changes to be committed:");
        for (const { file, type } of toBeCommitted) {
            console.log(`\t${type}: ${file}`);
        }
    } else {
        console.log(" Nothing to commit, working tree clean.");
    }
}

module.exports = { showStatus };

