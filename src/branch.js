const fs = require("fs");
const path = require("path");
const { getGitDir, getHead, isInitialized } = require("./utils");

function listBranches() {
    if (!isInitialized()) {
        console.error("! Repository not initialized. Run init first.");
        return;
    }

    const branchesDir = path.join(getGitDir(), "refs", "heads");
    const branchFiles = fs.readdirSync(branchesDir);
    const headRef = fs.readFileSync(path.join(getGitDir(), "HEAD"), "utf8").trim();
    const currentBranch = headRef.startsWith("ref: ") ? headRef.split("/").pop() : null;

    console.log("Branches:\n");
    for (const branch of branchFiles) {
        if (branch === currentBranch) {
            console.log(`* ${branch}`);
        } else {
            console.log(`  ${branch}`);
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

    const branchesDir = path.join(getGitDir(), "refs", "heads");
    const branchPath = path.join(branchesDir, branchName);

    if (fs.existsSync(branchPath)) {
        console.error(`! Branch '${branchName}' already exists.`);
        return;
    }

    const headHash = getHead();
    fs.writeFileSync(branchPath, headHash, "utf8");
    console.log(` Branch '${branchName}' created at ${headHash}`);
}

module.exports = {
    listBranches,
    createBranch,
};
