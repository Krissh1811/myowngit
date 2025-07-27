const { initRepo } = require("./src/init");
const { addFile } = require("./src/add");
const { commit } = require("./src/commit");
const { showLog } = require("./src/log");
const { showStatus } = require("./src/status");
const { listBranches, createBranch } = require("./src/branch");

function main() {
    const command = process.argv[2];
    const args = process.argv.slice(3);

    if (command === "init") {
        initRepo();

    } else if (command === "add") {
        const fileName = args[0];
        if (!fileName) {
            console.error("! Please provide a file to add.");
            return;
        }
        addFile(fileName);

    } else if (command === "commit") {
        const message = args[0];
        if (!message) {
            console.error("! Please provide a commit message.");
            return;
        }
        commit(message);

    } else if (command === "log") {
        showLog();

    } else if (command === "status") {
        showStatus();

    } else if (command === "branch") {
        const subcommand = args[0];

        if (!subcommand) {
            listBranches();
        } else if (subcommand === "create") {
            const branchName = args[1];
            if (!branchName) {
                console.error("! Please provide a branch name.");
                return;
            }
            createBranch(branchName);
        } else {
            console.error(`! Unknown branch subcommand: ${subcommand}`);
        }

    } else {
        console.error("! Unknown command: ", command);
    }
}

main();

