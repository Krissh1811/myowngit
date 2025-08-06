#!/usr/bin/env node

const { initRepo } = require("./src/init");
const { addFile } = require("./src/add");
const { commit } = require("./src/commit");
const { showStatus } = require("./src/status");
const { showLog } = require("./src/log");
const { listBranches, createBranch, switchBranch } = require("./src/branch");
const { addRemote, listRemotes, pushToRemote } = require("./src/push");
const { mergeBranches, abortMerge } = require("./src/merge");

const args = process.argv.slice(2);
const command = args[0];

function showHelp() {
    console.log(`
🚀 MyOwnGit - A Simple Git Implementation

Usage: node cli.js <command> [options]

Commands:
  init                          Initialize a new repository
  add <file>                   Add file to staging area
  commit "<message>"           Create a new commit
  status                       Show working tree status
  log                          Show commit history
  
Branch commands:
  branch                       List all branches
  branch <name>                Create a new branch
  checkout <branch>            Switch to a branch
  
Remote commands:
  remote                       List remotes
  remote add <name> <path>     Add a remote repository
  push [remote] [branch]       Push to remote (defaults: origin, current branch)
  
Merge commands:
  merge <branch>               Merge branch into current branch
  merge --abort                Abort current merge
  
Examples:
  node cli.js init
  node cli.js add myfile.txt
  node cli.js commit "Initial commit"
  node cli.js branch feature-branch
  node cli.js checkout feature-branch
  node cli.js merge main
  node cli.js remote add origin ../remote-repo
  node cli.js push origin main
`);
}

switch (command) {
    case "init":
        initRepo();
        break;

    case "add":
        if (!args[1]) {
            console.error("! Please specify a file to add.");
        } else {
            addFile(args[1]);
        }
        break;

    case "commit":
        if (!args[1]) {
            console.error("! Please provide a commit message.");
        } else {
            commit(args[1]);
        }
        break;

    case "status":
        showStatus();
        break;

    case "log":
        showLog();
        break;

    case "branch":
        if (!args[1]) {
            listBranches();
        } else {
            createBranch(args[1]);
        }
        break;

    case "checkout":
        if (!args[1]) {
            console.error("! Please specify a branch name.");
        } else {
            switchBranch(args[1]);
        }
        break;

    case "remote":
        if (args[1] === "add") {
            if (!args[2] || !args[3]) {
                console.error("! Usage: remote add <name> <path>");
            } else {
                addRemote(args[2], args[3]);
            }
        } else {
            listRemotes();
        }
        break;

    case "push":
        // push [remote] [branch]
        pushToRemote(args[1], args[2]);
        break;

    case "merge":
        if (args[1] === "--abort") {
            abortMerge();
        } else if (!args[1]) {
            console.error("! Please specify a branch to merge.");
        } else {
            mergeBranches(args[1]);
        }
        break;

    case "help":
    case "--help":
    case "-h":
        showHelp();
        break;

    default:
        console.error(`! Unknown command: ${command}`);
        console.log("Run 'node cli.js help' for usage information.");
        break;
}