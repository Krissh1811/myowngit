const fs = require("fs");
const path = require("path");
const { getGitDir } = require("./utils");

function showLog() {
  const gitPath = getGitDir();
  const headPath = path.join(gitPath, "head");
  const headRef = fs.readFileSync(headPath, "utf-8").trim();
  const branchName = headRef.split("/").pop();
  const branchPath = path.join(gitPath, "refs", "heads", branchName);

  if (!fs.existsSync(branchPath)) {
    console.error("❌ Branch not found:", branchName);
    return;
  }

  let currentHash = fs.readFileSync(branchPath, "utf-8").trim();

  while (currentHash) {
    const commitPath = path.join(gitPath, "commits", currentHash);
    if (!fs.existsSync(commitPath)) break;

    const commitData = JSON.parse(fs.readFileSync(commitPath, "utf-8"));

    console.log("🔸 Commit:", currentHash);
    console.log("📅 Date:", commitData.date || "N/A");
    console.log("📝 Message:", commitData.message || "N/A");
    console.log();

    currentHash = commitData.parent;
  }
}

module.exports = { showLog };
