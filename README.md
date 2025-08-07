# MyOwnGit 🚀

A simple, educational implementation of Git's core functionality built with Node.js. This project demonstrates the fundamental concepts behind version control systems by recreating Git's essential features from scratch.

## ✨ Features

### Core Git Operations
- **Repository Initialization** - Create new repositories
- **File Staging** - Add files to the staging area
- **Commits** - Create snapshots of your project
- **Status Checking** - View working directory status
- **Commit History** - Browse project history

### Branch Management
- **Branch Creation** - Create new branches
- **Branch Switching** - Switch between branches
- **Branch Listing** - View all branches

### Advanced Features
- **Merging** - Merge branches with conflict detection
- **Remote Push** - Push to remote mirror folders
- **Conflict Resolution** - Handle merge conflicts with markers

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (version 12 or higher)
- npm (comes with Node.js)

### Clone and Install
```bash
# Clone the repository
git clone https://github.com/yourusername/myowngit.git

# Navigate to project directory
cd myowngit

# Install dependencies
npm install
```

## 🚀 Usage

### Initialize a Repository
```bash
node cli.js init
```

### Basic Workflow
```bash
# Add files to staging area
node cli.js add myfile.txt
node cli.js add another-file.js

# Check status
node cli.js status

# Commit changes
node cli.js commit "Initial commit"

# View commit history
node cli.js log
```

### Branch Operations
```bash
# List all branches
node cli.js branch

# Create a new branch
node cli.js branch feature-branch

# Switch to a branch
node cli.js checkout feature-branch

# Work on the branch
node cli.js add newfeature.txt
node cli.js commit "Add new feature"

# Switch back and merge
node cli.js checkout main
node cli.js merge feature-branch
```

### Remote Operations
```bash
# Add a remote repository
node cli.js remote add origin ../backup-repo

# List remotes
node cli.js remote

# Push to remote
node cli.js push origin main
```

### Handling Merge Conflicts
When merging branches with conflicting changes:
```bash
node cli.js merge feature-branch
# If conflicts occur, edit the conflicted files
# Conflicts are marked with:
# <<<<<<< HEAD (current-branch)
# Your changes
# =======
# Their changes
# >>>>>>> filename

# After resolving conflicts
node cli.js add conflicted-file.txt
node cli.js commit "Resolve merge conflicts"
```

## 📖 Commands Reference

| Command | Description | Example |
|---------|-------------|---------|
| `init` | Initialize a new repository | `node cli.js init` |
| `add <file>` | Add file to staging area | `node cli.js add index.js` |
| `commit "<message>"` | Create a new commit | `node cli.js commit "Fix bug"` |
| `status` | Show working tree status | `node cli.js status` |
| `log` | Show commit history | `node cli.js log` |
| `branch` | List all branches | `node cli.js branch` |
| `branch <name>` | Create a new branch | `node cli.js branch feature` |
| `checkout <branch>` | Switch to a branch | `node cli.js checkout main` |
| `merge <branch>` | Merge branch into current | `node cli.js merge feature` |
| `merge --abort` | Abort current merge | `node cli.js merge --abort` |
| `remote` | List remotes | `node cli.js remote` |
| `remote add <name> <path>` | Add remote | `node cli.js remote add origin ../repo` |
| `push [remote] [branch]` | Push to remote | `node cli.js push origin main` |
| `help` | Show help information | `node cli.js help` |

## 📁 Project Structure

```
myowngit/
├── src/                    # Source code
│   ├── add.js             # File staging functionality
│   ├── branch.js          # Branch management
│   ├── commit.js          # Commit creation
│   ├── init.js            # Repository initialization
│   ├── log.js             # Commit history
│   ├── merge.js           # Branch merging
│   ├── push.js            # Remote operations
│   ├── status.js          # Status checking
│   └── utils.js           # Utility functions
├── .mygit/                # Repository data (created after init)
│   ├── commits/           # Commit objects
│   ├── objects/           # File contents
│   ├── refs/heads/        # Branch references
│   ├── HEAD               # Current branch pointer
│   ├── index.json         # Staging area
│   └── config.json        # Repository configuration
├── cli.js                 # Command line interface
├── package.json           # Project configuration
└── README.md              # This file
```

## 🧠 How It Works

### Storage Model
- **Objects**: File contents are stored by SHA-1 hash in `.mygit/objects/`
- **Commits**: Commit metadata stored as JSON in `.mygit/commits/`
- **Index**: Staging area tracked in `.mygit/index.json`
- **Refs**: Branch pointers stored in `.mygit/refs/heads/`

### Key Concepts
1. **Content Addressing**: Files are stored by their SHA-1 hash
2. **Three-Way Merge**: Merging uses base, current, and incoming versions
3. **Branch References**: Branches are simply pointers to commit hashes
4. **Staging Area**: Changes are staged before committing

## 🙏 Acknowledgments

- Inspired by the original Git version control system
- Built for educational purposes to understand Git internals
- Thanks to the Node.js community for excellent tooling

## 🚨 Limitations

Please note that this is a simplified implementation and should not be used for production projects. Some limitations include:

- No support for binary files optimization
- Simplified merge algorithms
- No network protocols for remote operations
- No advanced Git features (rebase, cherry-pick, etc.)
- No file permission tracking
- No support for .gitignore files

For real projects, use the official Git implementation!
