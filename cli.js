const { initRepo } = require("./src/init");
const { addFile } = require("./src/add");
const { commit } = require("./src/commit");
const { showLog } = require("./src/log");
const { showStatus } = require("./src/status");

function main(){
    const command = process.argv[2];
    const args = process.argv.slice(3);

    if (command === "init"){
        initRepo();
    } else if (command === "add"){
        const fileName = args[0];
        if(!fileName){
            console.error("! Please provide a file to add.");
            return;
        }
        addFile(fileName);
    } else if (command === "commit"){
        const message = args[0];
        if(!message){
            console.error("! Please provide a commit message.");
            return;
        }
        commit(message);
    } else if(command === "log"){
        showLog();
    } else if(command === "status"){
        showStatus();
    } else {
        console.error("! Unknown command: ", command);
    }
}

main();
