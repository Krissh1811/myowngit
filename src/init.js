const fs = require("fs");
const path = require("path");

function initRepo() {
    const gitPath = ".mygit";

    if (fs.existsSync(gitPath)) {
        console.log(" ! Repository already initialized.");
        return;
    }

    fs.mkdirSync(gitPath);
    fs.mkdirSync(path.join(gitPath, "objects"));
    fs.mkdirSync(path.join(gitPath, "commits"));
    fs.mkdirSync(path.join(gitPath, "refs", "heads"), { recursive: true });
    fs.mkdirSync(path.join(gitPath, "refs", "remotes"), { recursive: true });

    fs.writeFileSync(path.join(gitPath, "HEAD"), "ref: refs/heads/main");

    fs.writeFileSync(path.join(gitPath, "index.json"), JSON.stringify({}));

    fs.writeFileSync(path.join(gitPath, "refs", "heads", "main"), "");

    const config = {
        remotes: {}
    };
    fs.writeFileSync(path.join(gitPath, "config.json"), JSON.stringify(config, null, 2));

    console.log(" ✅ Initialized empty MyOwnGit repository in .mygit/");
}

module.exports = { initRepo };