const fs = require("fs");
const path = require("path");

// Paths
const MYGIT_DIR = ".mygit";
const INDEX_PATH = path.join(MYGIT_DIR, "index.json");
const HEAD_PATH = path.join(MYGIT_DIR, "HEAD");
const OBJECTS_DIR = path.join(MYGIT_DIR, "objects");
const COMMITS_DIR = path.join(MYGIT_DIR, "commits");

// Check if repo is initialized
function isInitialized() {
    return fs.existsSync(MYGIT_DIR);
}

// Get .mygit directory path
function getGitDir() {
    return MYGIT_DIR;
}

// Get current HEAD commit hash
function getHead() {
    if (!fs.existsSync(HEAD_PATH)) return null;

    const ref = fs.readFileSync(HEAD_PATH, "utf-8").trim();

    if (!ref.startsWith("ref: ")) return ref;

    const refPath = path.join(MYGIT_DIR, ref.replace("ref: ", ""));

    if (!fs.existsSync(refPath)) return null;

    const hash = fs.readFileSync(refPath, "utf-8").trim();
    return hash || null;
}

// Get current branch name
function getCurrentBranch() {
    if (!fs.existsSync(HEAD_PATH)) return "main";
    
    const ref = fs.readFileSync(HEAD_PATH, "utf-8").trim();
    
    if (ref.startsWith("ref: ")) {
        return ref.split("/").pop();
    }
    
    return "main";
}

// Load current index (staging area)
function getIndex() {
    if (!fs.existsSync(INDEX_PATH)) return {};
    const content = fs.readFileSync(INDEX_PATH, "utf-8").trim();
    if (!content) return {};
    return JSON.parse(content);
}

// Get commit data from commits directory
function getCommitData(hash) {
    if (!hash) return null;
    
    const commitPath = path.join(COMMITS_DIR, hash + ".json");
    if (!fs.existsSync(commitPath)) return null;
    
    try {
        return JSON.parse(fs.readFileSync(commitPath, "utf-8"));
    } catch (e) {
        return null;
    }
}

// Get HEAD commit hash (alias for getHead)
function getHeadCommitHash() {
    return getHead();
}

// Write object to objects directory
function writeObject(hash, content) {
    const objectPath = path.join(OBJECTS_DIR, hash);
    fs.writeFileSync(objectPath, content);
}

// Read object from objects directory
function readObject(hash) {
    const objectPath = path.join(OBJECTS_DIR, hash);
    if (!fs.existsSync(objectPath)) return null;
    return fs.readFileSync(objectPath, "utf-8");
}

// Update HEAD to point to a branch or commit
function updateHead(branchName) {
    fs.writeFileSync(HEAD_PATH, `ref: refs/heads/${branchName}`);
}

// Update branch reference
function updateBranch(branchName, commitHash) {
    const branchPath = path.join(MYGIT_DIR, "refs", "heads", branchName);
    fs.writeFileSync(branchPath, commitHash);
}

// Get all branches
function getAllBranches() {
    const branchesDir = path.join(MYGIT_DIR, "refs", "heads");
    if (!fs.existsSync(branchesDir)) return [];
    return fs.readdirSync(branchesDir);
}

// Check if branch exists
function branchExists(branchName) {
    const branchPath = path.join(MYGIT_DIR, "refs", "heads", branchName);
    return fs.existsSync(branchPath);
}

// Get branch commit hash
function getBranchHash(branchName) {
    const branchPath = path.join(MYGIT_DIR, "refs", "heads", branchName);
    if (!fs.existsSync(branchPath)) return null;
    
    const hash = fs.readFileSync(branchPath, "utf-8").trim();
    return hash || null;
}

module.exports = {
    isInitialized,
    getGitDir,
    getHead,
    getCurrentBranch,
    getIndex,
    getCommitData,
    getHeadCommitHash,
    writeObject,
    readObject,
    updateHead,
    updateBranch,
    getAllBranches,
    branchExists,
    getBranchHash,
};