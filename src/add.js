const fs = require("fs");
const path = require("path");
const sha1 = require("sha1");

function addFile(filename) {
  const gitPath = path.join(".mygit");
  const objectsPath = path.join(gitPath, "objects");
  const indexPath = path.join(gitPath, "index");

  // Check if repo is initialized
  if (!fs.existsSync(gitPath)) {
    console.error(" ! Not a .mygit repository. Please run init first.");
    return;
  }

  // Read file contents
  if (!fs.existsSync(filename)) {
    console.error(` ! File ${filename} does not exist.`);
    return;
  }
  const content = fs.readFileSync(filename, "utf8");

  // Create blob object and save it
  const hash = sha1(content);
  const objectPath = path.join(objectsPath, hash);
  fs.writeFileSync(objectPath, content);

  // If index file doesn't exist, create it
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, ""); // create an empty index
  }

  // Update index
  const indexContent = fs.readFileSync(indexPath, "utf8");
  const lines = indexContent.split("\n").filter(Boolean);
  const filtered = lines.filter((line) => !line.endsWith(` ${filename}`));
  filtered.push(`${hash} ${filename}`);
  fs.writeFileSync(indexPath, filtered.join("\n") + "\n");

  console.log(`✔️ File '${filename}' added to index with hash ${hash}`);
}

module.exports = { addFile };

