const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getIndex, getHeadCommitHash, getCurrentBranch, updateBranch } = require("./utils");

const INDEX_PATH = path.join(".mygit", "index.json");
const COMMITS_DIR = path.join(".mygit", "commits");

function commit(message) {
    if (!message) {
        console.error("! Please provide a commit message.");
        return;
    }

    const index = getIndex();
    if (Object.keys(index).length === 0) {
        console.log("! No changes to commit.");
        return;
    }

    const parent = getHeadCommitHash();
    const timestamp = new Date().toISOString();
    const currentBranch = getCurrentBranch();
    const files = { ...index }; // Copy index files

    const commitData = {
        parent: parent || null,
        message,
        timestamp,
        files,
        branch: currentBranch
    };

    const content = JSON.stringify(commitData, null, 2);
    const hash = crypto.createHash("sha1").update(content).digest("hex");

    const commitPath = path.join(COMMITS_DIR, hash + ".json");
    fs.writeFileSync(commitPath, content);
    
    updateBranch(currentBranch, hash);

    fs.writeFileSync(INDEX_PATH, JSON.stringify({}));

    console.log(`✅ Committed with hash ${hash}`);
    console.log(`📝 Message: ${message}`);
    console.log(`🌿 Branch: ${currentBranch}`);
}

module.exports = { commit };