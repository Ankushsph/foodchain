# 🔄 Git Workflow Guide for FoodChain

This guide will help you work professionally with Git and earn GitHub achievements!

## 🎯 Quick Start for New Contributors

### Step 1: Fork & Clone
```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/foodchain.git
cd foodchain
git remote add upstream https://github.com/Ankushsph/foodchain.git
```

### Step 2: Create Your Feature Branch
```bash
git checkout -b feature/my-awesome-feature
```

### Step 3: Make Your Changes
- Edit files
- Test locally
- Commit frequently with clear messages

### Step 4: Push & Create PR
```bash
git push origin feature/my-awesome-feature
```
Then create a Pull Request on GitHub!

## 🏆 Earning GitHub Achievements

### Available Achievements:

1. **Pull Shark** 🦈
   - Open pull requests that get merged
   - Keep PRs focused and well-documented

2. **Quickdraw** ⚡
   - Close issues/PRs within 5 minutes of opening
   - Be responsive to feedback

3. **Pair Extraordinaire** 👥
   - Co-author commits with teammates
   - Use: `git commit -m "message" --co-author="Name <email>"`

4. **YOLO** 🎲
   - Merge PRs without review (not recommended for main!)
   - Use for personal branches only

5. **Galaxy Brain** 🧠
   - Get discussions answered
   - Participate in project discussions

6. **Starstruck** ⭐
   - Get stars on your repositories
   - Share your work!

## 📝 Professional Git Workflow

### Daily Workflow

```bash
# 1. Start your day - sync with main
git checkout main
git pull upstream main
git push origin main

# 2. Create feature branch
git checkout -b feature/new-sensor-integration

# 3. Work on your feature
# ... make changes ...
git add .
git commit -m "feat: add pH sensor to water analysis"

# 4. Keep your branch updated
git fetch upstream
git rebase upstream/main

# 5. Push your changes
git push origin feature/new-sensor-integration

# 6. Create Pull Request on GitHub
```

### Commit Message Best Practices

```bash
# Good commits:
git commit -m "feat: add temperature monitoring to processing stage"
git commit -m "fix: correct TDS calculation for milk products"
git commit -m "docs: update API documentation for /analyze endpoint"
git commit -m "refactor: optimize distributor scoring algorithm"

# Bad commits (avoid these):
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "asdfasdf"
```

### Working with Multiple Contributors

```bash
# Co-authoring commits (for pair programming)
git commit -m "feat: implement blockchain verification

Co-authored-by: Teammate Name <teammate@example.com>"

# Reviewing teammate's PR locally
git fetch upstream pull/ID/head:pr-ID
git checkout pr-ID
# Test the changes
# Leave review comments on GitHub
```

## 🔀 Branch Strategy

```
main (protected)
  ├── feature/add-temperature-sensor
  ├── feature/improve-ui-dashboard
  ├── fix/distributor-score-bug
  └── docs/api-documentation
```

### Branch Types:
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation
- `refactor/*` - Code improvements
- `test/*` - Test additions

## 🚀 Pull Request Process

### Before Creating PR:
1. ✅ Test your changes locally
2. ✅ Update documentation
3. ✅ Rebase on latest main
4. ✅ Write clear PR description
5. ✅ Fill out PR template completely

### After Creating PR:
1. 👀 Wait for automated checks to pass
2. 💬 Respond to review comments
3. 🔄 Make requested changes
4. ✅ Get approval from maintainer
5. 🎉 PR gets merged!

## 🛡️ Branch Protection Rules (for Maintainers)

Recommended settings for `main` branch:
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require conversation resolution
- ❌ Allow force pushes (disabled)
- ❌ Allow deletions (disabled)

## 🎓 Git Tips & Tricks

### Undo Last Commit (not pushed)
```bash
git reset --soft HEAD~1
```

### Update Your Branch with Main
```bash
git checkout feature/my-feature
git rebase main
```

### Squash Multiple Commits
```bash
git rebase -i HEAD~3  # Squash last 3 commits
```

### Cherry-pick a Commit
```bash
git cherry-pick <commit-hash>
```

### Stash Changes Temporarily
```bash
git stash
git checkout other-branch
git checkout my-branch
git stash pop
```

## 🐛 Common Issues & Solutions

### Merge Conflicts
```bash
# Update your branch
git fetch upstream
git rebase upstream/main

# Resolve conflicts in your editor
# Then:
git add .
git rebase --continue
git push origin feature/my-feature --force
```

### Accidentally Committed to Main
```bash
git checkout main
git reset --hard upstream/main
git checkout -b feature/my-feature
git cherry-pick <commit-hash>
```

### Need to Update PR
```bash
# Make changes
git add .
git commit -m "address review feedback"
git push origin feature/my-feature
# PR updates automatically!
```

## 📊 Tracking Your Contributions

View your contributions:
- GitHub Profile → Contributions graph
- Repository → Insights → Contributors
- Your PRs: `is:pr author:@me`

## 🎯 Next Steps

1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Check open issues for "good first issue" label
3. Join project discussions
4. Create your first PR!

---

Need help? Open a discussion or ask in PR comments! 🚀
