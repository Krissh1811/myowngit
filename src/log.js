const fs = require("fs");
const path = require("path");

function showLog() {
  const gitPath = path.join(__dirname, "..", ".mygit");
  const headPath = path.join(gitPath, "HEAD");

  const headRef = fs.readFileSync(headPath, "utf8").trim();
  const branchName = headRef.split("ref: refs/heads/")[1];
  const branchPath = path.join(gitPath, "branches", branchName);

  if (!fs.existsSync(branchPath)) {
    console.log("No commits yet.");
    return;
  }

  const commitsPath = path.join(gitPath, "commits");
  let currentHash = fs.readFileSync(branchPath, "utf8").trim();

  while (currentHash && currentHash !== "null") {
    const commitPath = path.join(commitsPath, currentHash);

    if (!fs.existsSync(commitPath)) break;

    const content = fs.readFileSync(commitPath, "utf8").trim();
    const lines = content.split("\n");

    const parentLine = lines.find((line) => line.startsWith("parent: "));
    const dateLine = lines.find((line) => line.startsWith("Date: "));
    const messageLine = lines.find((line) => line.startsWith("Message: "));

    const parent = parentLine ? parentLine.replace("parent: ", "").trim() : null;
    const date = dateLine ? dateLine.replace("Date: ", "").trim() : "";
    const message = messageLine ? messageLine.replace("Message: ", "").trim() : "";

    console.log(`\n🔹 Commit: ${currentHash}`);
    console.log(`🕒 Date: ${date}`);
    console.log(`📝 Message: ${message}`);

    currentHash = parent;
  }
}

module.exports = { showLog };