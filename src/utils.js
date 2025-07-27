const fs = require("fs");
const path = require("path");

// Path helpers
const MYGIT_DIR = ".mygit";
const INDEX_PATH = path.join(MYGIT_DIR, "index.json");
const HEAD_PATH = path.join(MYGIT_DIR, "HEAD");
const OBJECTS_DIR = path.join(MYGIT_DIR, "objects");

// Get current HEAD commit hash
function getHeadCommitHash() {
    if (!fs.existsSync(HEAD_PATH)) return null;
    const ref = fs.readFileSync(HEAD_PATH, "utf-8").trim();
    const refPath = path.join(MYGIT_DIR, ref.replace("refs/", ""));
    if (!fs.existsSync(refPath)) return null;
    return fs.readFileSync(refPath, "utf-8").trim();
}

// Load index
function getIndex() {
    if (!fs.existsSync(INDEX_PATH)) return {};
    return JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
}

// Load commit data from object file
function getCommitData(hash) {
    const objectPath = path.join(OBJECTS_DIR, hash);
    if (!fs.existsSync(objectPath)) return null;
    return JSON.parse(fs.readFileSync(objectPath, "utf-8"));
}

module.exports = {
    getHeadCommitHash,
    getIndex,
    getCommitData,
};
