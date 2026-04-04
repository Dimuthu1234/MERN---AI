# Git & GitHub Cheat Sheet

## AcademyDSJ - Session 3

---

## 1. Git Setup (Git Setup කරමු)

```bash
# Git install වුණාද check කරන්න
git --version

# ඔබේ identity set කරන්න (පළමු වතාවට පමණි)
# Your name and email — this appears in every commit
git config --global user.name "Your Name"
git config --global user.email "you@email.com"

# Config check කරන්න
git config --list
```

---

## 2. Repository එකක් පටන් ගමු (Starting a Repository)

```bash
# නව project folder එකක Git repo එකක් පටන් ගන්න
# Creates a hidden .git folder that tracks everything
git init

# GitHub එකේ තියෙන repo එකක් ඔබේ computer එකට copy කරන්න
git clone https://github.com/username/repo-name.git
```

---

## 3. Basic Workflow (මූලික Workflow එක)

මේක හැම දවසම use කරන commands — මේවා මතක තියාගන්න!

```bash
# Step 1: ඔබේ files වල status බලන්න
# Shows which files are modified, staged, or untracked
git status

# Step 2: Files stage කරන්න (commit කරන්න ready කරන්න)
git add index.html          # එක file එකක් add කරන්න
git add index.html style.css # files කිහිපයක් add කරන්න
git add .                    # සියලුම files add කරන්න

# Step 3: Snapshot එකක් save කරන්න (commit කරන්න)
# -m flag එකෙන් message එක දෙන්න
git commit -m "Add homepage with navigation"

# Step 4: Commit history බලන්න
git log              # Full details
git log --oneline    # Short version — එක line එකට commit එකක්
```

### Workflow Diagram:

```
Working Directory  →  Staging Area  →  Repository
   (edit files)      (git add)       (git commit)
   ඔබ edit කරන      commit කරන්න     Save වුණු
   files              ready files      snapshots
```

---

## 4. GitHub එකට Connect කරමු (Remote Repository)

```bash
# GitHub එකේ repo එකක් හදලා (github.com > New Repository)
# ඊට පස්සේ local repo එක connect කරන්න:

# Remote repository එකක් add කරන්න
git remote add origin https://github.com/username/repo-name.git

# Remote repos බලන්න
git remote -v

# Code GitHub එකට upload කරන්න
git push -u origin main    # පළමු වතාවට (-u flag එක remember කරනවා)
git push                   # ඊට පස්සේ මේක පමණි

# GitHub එකේ latest changes download කරන්න
git pull
```

---

## 5. .gitignore File

Track කරන්න ඕනි නැති files specify කරන්න `.gitignore` file එකක් හදන්න.

```bash
# .gitignore file එකක් හදන්න (project root එකේ)
# Create a file called .gitignore and add these patterns:

# Node modules folder — ගොඩක් ලොකුයි, push කරන්න එපා
node_modules/

# Environment variables — passwords/secrets තියෙනවා
.env

# OS generated files
.DS_Store          # Mac
Thumbs.db          # Windows

# Build output
dist/
build/

# IDE settings
.vscode/
.idea/
```

> **Important:** `.gitignore` file එක repo එකේ root folder එකේ තියෙන්න ඕනි

---

## 6. වැදගත් Commands (Useful Commands)

```bash
# File එකක changes බලන්න (commit කරන්න කලින්)
git diff

# Last commit එක undo කරන්න (changes තියෙනවා)
git reset --soft HEAD~1

# Staged file එකක් unstage කරන්න
git restore --staged filename.txt

# File එකක changes discard කරන්න (ප්‍රවේසම් වෙන්න!)
git restore filename.txt
```

---

## 7. Common Workflows (සාමාන්‍ය Workflows)

### New Project එකක් GitHub එකට Push කරන්න:

```bash
mkdir my-project
cd my-project
git init
# ... files හදන්න ...
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/you/my-project.git
git push -u origin main
```

### දවසේ වැඩ (Daily Work):

```bash
git pull                           # Latest changes ගන්න
# ... code ලියන්න / edit කරන්න ...
git status                         # මොනවද change වුණේ බලන්න
git add .                          # සියල්ල stage කරන්න
git commit -m "Add login feature"  # Commit කරන්න
git push                           # GitHub එකට push කරන්න
```

---

## 8. Good Commit Messages ලියමු

```bash
# GOOD commit messages (මොකද කලේ කියන්න):
git commit -m "Add user login form with validation"
git commit -m "Fix navbar not showing on mobile"
git commit -m "Update homepage hero section design"

# BAD commit messages (මේවා ලියන්න එපා):
git commit -m "update"
git commit -m "fix stuff"
git commit -m "asdfgh"
```

### Commit Message Formula:

```
<action> + <what you did>

Add     — අලුත් feature එකක් add කලා
Fix     — Bug එකක් fix කලා
Update  — තියෙන feature එකක් improve කලා
Remove  — දෙයක් remove කලා
Refactor — Code structure වෙනස් කලා (behavior එක එකම)
```

---

## 9. VS Code Git Integration

| Action | How |
|--------|-----|
| Source Control panel | `Ctrl+Shift+G` (Windows) / `Cmd+Shift+G` (Mac) |
| Stage files | `+` icon click කරන්න |
| Commit | Message type කරලා `✓` click කරන්න |
| Push/Pull | Bottom status bar එකේ sync icon |
| See changes | Changed file එක click කරන්න |

> **Tip:** "GitLens" extension install කරන්න — extra features ගොඩක් දෙනවා!

---

## 10. Quick Reference Card

| Command | Description | සිංහල |
|---------|-------------|--------|
| `git init` | Initialize new repo | අලුත් repo පටන් ගන්න |
| `git status` | Check file status | Files වල status බලන්න |
| `git add .` | Stage all files | සියලුම files stage කරන්න |
| `git commit -m "msg"` | Save snapshot | Snapshot save කරන්න |
| `git log --oneline` | View history | History බලන්න |
| `git remote add origin URL` | Connect to GitHub | GitHub එකට connect කරන්න |
| `git push` | Upload to GitHub | GitHub එකට upload කරන්න |
| `git pull` | Download changes | Changes download කරන්න |
| `git clone URL` | Copy a repo | Repo එකක් copy කරන්න |
| `git diff` | See changes | Changes බලන්න |

---

**AcademyDSJ** | Session 3 | Git + React Basics
