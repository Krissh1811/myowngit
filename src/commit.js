const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getGitDir } = require("./utils");

function commit(message) {
  const gitPath = getGitDir();
  const indexPath = path.join(gitPath, "index.json");
  const headPath = path.join(gitPath, "head");

  if (!fs.existsSync(indexPath)) {
    console.error("❌ Staging area not found.");
    return;
  }

  const index = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
  if (Object.keys(index).length === 0) {
    console.error("❌ Nothing to commit. Staging area is empty.");
    return;
  }

  const tree = index;
  const commitContent = JSON.stringify(tree);
  const commitHash = crypto.createHash("sha1").update(commitContent + message).digest("hex");

  const headRef = fs.readFileSync(headPath, "utf-8").trim();
  const branchName = headRef.split("/").pop();
  const branchPath = path.join(gitPath, "refs", "heads", branchName);

  let parentHash = null;
  if (fs.existsSync(branchPath)) {
    parentHash = fs.readFileSync(branchPath, "utf-8").trim();
  }

  const commitObject = {
    message,
    date: new Date().toISOString(),
    parent: parentHash,
    tree
  };

  const commitDir = path.join(gitPath, "commits");
  const commitPath = path.join(commitDir, commitHash);
  fs.writeFileSync(commitPath, JSON.stringify(commitObject, null, 2));
  fs.writeFileSync(branchPath, commitHash);

  console.log(`✅ Committed with hash ${commitHash}`);
}

module.exports = { commit };
