 const fs = require("fs");
 const path = require("path");
 const crypto = require("crypto");
 const sha1 = require("sha1");


 function commit(message){
    const gitPath = path.join(".mygit");
    const indexPath = path.join(gitPath, "index")
    const objectsPath = path.join(gitPath, "objects");
    const commitsPath = path.join(gitPath, "commits");

    // Check if .mygit repo exists
    if(!fs.existsSync(gitPath)){
        console.error("! Not a .mygit repository. Please run init first.");
        return;
    }
    
    // Check if index exists or if there is something to commit
    if(!fs.existsSync(indexPath)){
        console.error("! Nothing to commit. Add files using 'add' first.");
        return;
    }

    // Create "commits" directory if it doesn't exists
    if(!fs.existsSync(commitsPath)){
        fs.mkdirSync(commitsPath);
    }
    const indexContent = fs.readFileSync(indexPath, "utf8").trim();
    if(indexContent === ""){
        console.error("! Nothing to commit. Index is empty");
        return;
    }

    // Create commit content
    const timeStamp = new Date().toISOString();
    const commitContent = `Date: ${timeStamp}\n\nMessage: ${message}\n\n${indexContent}`;

    // Generate commit hash
    const commitHash = sha1(commitContent);

    // Save commit to .mygit/commits/<hash>
    const commitFilePath = path.join(commitsPath, commitHash);
    fs.writeFileSync(commitFilePath, commitContent, "utf8");

    // Clear the index file after commit
    fs.writeFileSync(indexPath, "", "utf8");

    console.log(`Commit successful!\nCommit id: ${commitHash}`);
 }

 module.exports = { commit };
