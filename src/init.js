const fs = require("fs");
const path = require("path");

function initRepo() {
    const gitPath = ".mygit";

    if (fs.existsSync(gitPath)) {
        console.log(" ! Repository already initialized.");
        return;
    }

    // Create directory structure
    fs.mkdirSync(gitPath);
    fs.mkdirSync(path.join(gitPath, "objects"));
    fs.mkdirSync(path.join(gitPath, "commits"));
    fs.mkdirSync(path.join(gitPath, "refs", "heads"), { recursive: true });
    fs.mkdirSync(path.join(gitPath, "refs", "remotes"), { recursive: true });

    // Initialize HEAD to point to main branch
    fs.writeFileSync(path.join(gitPath, "HEAD"), "ref: refs/heads/main");

    // Initialize empty index
    fs.writeFileSync(path.join(gitPath, "index.json"), JSON.stringify({}));

    // Create main branch (empty initially)
    fs.writeFileSync(path.join(gitPath, "refs", "heads", "main"), "");

    // Create config file for remotes
    const config = {
        remotes: {}
    };
    fs.writeFileSync(path.join(gitPath, "config.json"), JSON.stringify(config, null, 2));

    console.log(" ✅ Initialized empty MyOwnGit repository in .mygit/");
}

module.exports = { initRepo };