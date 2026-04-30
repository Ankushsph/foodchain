# ⚡ Quick Start Guide

## For New Team Members

### 1️⃣ First Time Setup (5 minutes)

```bash
# Clone the repository
git clone https://github.com/Ankushsph/foodchain.git
cd foodchain

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install
```

### 2️⃣ Running the Project

**Terminal 1 - Backend:**
```bash
cd backend
python server.py
# Backend runs on http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### 3️⃣ Making Your First Contribution

```bash
# Create a feature branch
git checkout -b feature/my-first-feature

# Make your changes
# ... edit files ...

# Commit and push
git add .
git commit -m "feat: describe your changes"
git push origin feature/my-first-feature

# Go to GitHub and create a Pull Request!
```

## 🎯 Common Tasks

### Add a New Feature
```bash
git checkout -b feature/feature-name
# ... make changes ...
git commit -m "feat: add feature description"
git push origin feature/feature-name
```

### Fix a Bug
```bash
git checkout -b fix/bug-description
# ... fix the bug ...
git commit -m "fix: describe the fix"
git push origin fix/bug-description
```

### Update Documentation
```bash
git checkout -b docs/what-you-updated
# ... update docs ...
git commit -m "docs: describe documentation changes"
git push origin docs/what-you-updated
```

## 📚 Important Files

- `README.md` - Project overview
- `CONTRIBUTING.md` - How to contribute
- `WORKFLOW_GUIDE.md` - Detailed Git workflow
- `.github/PULL_REQUEST_TEMPLATE.md` - PR template
- `.github/ISSUE_TEMPLATE/` - Issue templates

## 🆘 Need Help?

- Check [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) for detailed instructions
- Open an issue with questions
- Ask in PR comments

## 🏆 Earning Achievements

- Create quality PRs → Pull Shark 🦈
- Review code quickly → Quickdraw ⚡
- Collaborate with teammates → Pair Extraordinaire 👥

See [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) for more achievement tips!
