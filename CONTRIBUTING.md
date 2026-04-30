# Contributing to FoodChain

Thank you for your interest in contributing! 🎉

## 🌟 How to Contribute

### 1. Setting Up Your Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/foodchain.git
cd foodchain

# Add upstream remote
git remote add upstream https://github.com/Ankushsph/foodchain.git
```

### 2. Creating a Feature Branch

Always create a new branch for your work:

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

**Branch Naming Convention:**
- `feature/` - New features (e.g., `feature/add-temperature-sensor`)
- `fix/` - Bug fixes (e.g., `fix/distributor-score-calculation`)
- `docs/` - Documentation updates (e.g., `docs/update-api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/optimize-ai-logic`)

### 3. Making Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Test your changes thoroughly

### 4. Committing Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add temperature monitoring to processing stage"
```

**Commit Message Format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### 5. Pushing and Creating a Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name
```

Then go to GitHub and create a Pull Request:
1. Navigate to the original repository
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template
5. Submit for review

### 6. Code Review Process

- Address reviewer feedback promptly
- Keep discussions professional and constructive
- Update your PR based on feedback
- Once approved, a maintainer will merge your PR

## 📋 Pull Request Guidelines

- **One feature per PR** - Keep PRs focused and manageable
- **Update documentation** - If you change functionality, update docs
- **Add tests** - If applicable, add tests for new features
- **No merge conflicts** - Rebase on main before submitting
- **Fill out the template** - Use the PR template completely

## 🧪 Testing

Before submitting:

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 🐛 Reporting Bugs

Use GitHub Issues with the bug template:
- Clear title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details

## 💡 Suggesting Features

Use GitHub Issues with the feature template:
- Clear description
- Use case explanation
- Proposed implementation (optional)

## 🏆 Recognition

Contributors will be:
- Listed in the README
- Eligible for GitHub achievement badges
- Recognized in release notes

## ❓ Questions?

Feel free to open a discussion or reach out to the maintainers!

---

Happy coding! 🚀
