const fs = require("fs");
const path = require("path");
const sha1 = require("sha1");

function addFile(filename) {
    const gitPath = path.join(".mygit");
    const objectsPath = path.join(gitPath, "objects");
    const indexPath = path.join(gitPath, "index.json");

    if (!fs.existsSync(gitPath)) {
        console.error(" ! Not a .mygit repository. Please run init first.");
        return;
    }

    if (!fs.existsSync(filename)) {
        console.error(` ! File ${filename} does not exist.`);
        return;
    }

    const content = fs.readFileSync(filename, "utf8");
    const hash = sha1(content);
    fs.writeFileSync(path.join(objectsPath, hash), content);

    // Read index.json
    let index = {};
    if (fs.existsSync(indexPath)) {
        index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    }

    index[filename] = hash;
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

    console.log(`✔️ File '${filename}' added to index with hash ${hash}`);
}

module.exports = { addFile };