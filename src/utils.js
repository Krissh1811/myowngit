const fs = require("fs");
const path = require("path");

// Paths
const MYGIT_DIR = ".mygit";
const INDEX_PATH = path.join(MYGIT_DIR, "index.json");
const HEAD_PATH = path.join(MYGIT_DIR, "HEAD");
const OBJECTS_DIR = path.join(MYGIT_DIR, "objects");

//  Check if repo is initialized
function isInitialized() {
    return fs.existsSync(MYGIT_DIR);
}

// Get .mygit directory path
function getGitDir() {
    return MYGIT_DIR;
}

//  Get current HEAD commit hash
function getHead() {
    if (!fs.existsSync(HEAD_PATH)) return null;

    const ref = fs.readFileSync(HEAD_PATH, "utf-8").trim();

    if (!ref.startsWith("ref: ")) return ref;

    const refPath = path.join(MYGIT_DIR, ref.replace("ref: ", ""));

    if (!fs.existsSync(refPath)) return null;

    return fs.readFileSync(refPath, "utf-8").trim();
}

//  Load current index (staging area)
function getIndex() {
    if (!fs.existsSync(INDEX_PATH)) return {};
    return JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
}

//  Get commit data (from .mygit/objects/<hash>)
function getCommitData(hash) {
    const objectPath = path.join(OBJECTS_DIR, hash);
    if (!fs.existsSync(objectPath)) return null;
    return JSON.parse(fs.readFileSync(objectPath, "utf-8"));
}

//  Get HEAD commit hash (alias for getHead)
function getHeadCommitHash() {
    return getHead();
}

module.exports = {
    isInitialized,
    getGitDir,
    getHead,
    getIndex,
    getCommitData,
    getHeadCommitHash,
};