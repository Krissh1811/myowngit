const fs = require("fs");
const path = require("path");
const sha1 = require("sha1");

function commit(message) {
    const gitPath = path.join(__dirname, "..", ".mygit");
    const indexPath = path.join(gitPath, "index.json");
    const commitsPath = path.join(gitPath, "commits");
    const headPath = path.join(gitPath, "HEAD");

    if (!fs.existsSync(indexPath)) {
        console.error("❌ No staged files. Use 'add' to stage files.");
        return;
    }

    const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    if (Object.keys(index).length === 0) {
        console.error("❌ Nothing to commit. Staging area is empty.");
        return;
    }

    const headRef = fs.readFileSync(headPath, "utf8").trim();
    const branchName = headRef.split("ref: refs/heads/")[1];
    const branchPath = path.join(gitPath, "branches", branchName);

    const parentHash = fs.existsSync(branchPath)
        ? fs.readFileSync(branchPath, "utf8").trim()
        : null;

    const timeStamp = new Date().toISOString();

    const commitData = {
        parent: parentHash || null,
        date: timeStamp,
        message,
        files: index,
    };

    const commitContent = JSON.stringify(commitData, null, 2);
    const commitHash = sha1(commitContent);

    fs.writeFileSync(path.join(commitsPath, commitHash), commitContent);
    fs.writeFileSync(branchPath, commitHash);

    // Clear index after commit
    fs.writeFileSync(indexPath, JSON.stringify({}));

    console.log(`✅ Commit successful! Hash: ${commitHash}`);
}

module.exports = { commit };