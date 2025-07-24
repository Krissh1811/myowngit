const fs = require("fs");
const path = require("path");

function initRepo() {
    const basePath = path.join(__dirname, "..");
    const gitPath = path.join(basePath, ".mygit");

    // Check if repository is already initialized
    if (fs.existsSync(gitPath)) {
        console.log(" !  Repository already initialized.");
        return;
    }

    // Create .mygit directory and subfolders
    fs.mkdirSync(gitPath);
    fs.mkdirSync(path.join(gitPath, "objects"));
    fs.mkdirSync(path.join(gitPath, "commits"));
    fs.mkdirSync(path.join(gitPath, "branches"));

    // Create empty index file (staging area)
    fs.writeFileSync(path.join(gitPath, "index"), "");

    // Create HEAD file pointing to 'main' branch
    fs.writeFileSync(path.join(gitPath, "HEAD"), "ref: refs/heads/main");

    // Create the default 'main' branch file pointing to nothing yet
    const branchesPath = path.join(gitPath, "branches");
    fs.writeFileSync(path.join(branchesPath, "main"), "");

    console.log("✅ Initialized empty MyOwnGit repository in .mygit/");
}

module.exports = { initRepo };
