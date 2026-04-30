# 🔧 GitHub Repository Setup Guide

This guide is for repository maintainers to set up professional workflows.

## 🛡️ Step 1: Enable Branch Protection

1. Go to your repository on GitHub
2. Click **Settings** → **Branches**
3. Click **Add rule** under "Branch protection rules"
4. Configure the following:

### Branch name pattern
```
main
```

### Protection Settings (Recommended)

✅ **Require a pull request before merging**
- ✅ Require approvals: 1
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from Code Owners (optional)

✅ **Require status checks to pass before merging**
- ✅ Require branches to be up to date before merging
- Add status checks: `Backend Tests`, `Frontend Tests` (after first workflow run)

✅ **Require conversation resolution before merging**

✅ **Require signed commits** (optional, for extra security)

✅ **Require linear history** (optional, keeps history clean)

❌ **Do not allow bypassing the above settings**

✅ **Restrict who can push to matching branches**
- Add yourself and trusted maintainers

❌ **Allow force pushes** (disabled)
❌ **Allow deletions** (disabled)

4. Click **Create** or **Save changes**

## 🏷️ Step 2: Set Up Labels

Go to **Issues** → **Labels** and create:

| Label | Color | Description |
|-------|-------|-------------|
| `bug` | `#d73a4a` | Something isn't working |
| `enhancement` | `#a2eeef` | New feature or request |
| `documentation` | `#0075ca` | Documentation improvements |
| `good first issue` | `#7057ff` | Good for newcomers |
| `help wanted` | `#008672` | Extra attention needed |
| `priority: high` | `#d93f0b` | High priority |
| `priority: low` | `#0e8a16` | Low priority |
| `wontfix` | `#ffffff` | This will not be worked on |

## 🤖 Step 3: Enable GitHub Actions

1. Go to **Settings** → **Actions** → **General**
2. Under "Actions permissions":
   - ✅ Allow all actions and reusable workflows
3. Under "Workflow permissions":
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests

## 📋 Step 4: Set Up Project Board (Optional)

1. Go to **Projects** → **New project**
2. Choose **Board** template
3. Create columns:
   - 📥 Backlog
   - 🔄 In Progress
   - 👀 In Review
   - ✅ Done

## 🎯 Step 5: Configure Repository Settings

### General Settings
- ✅ Allow merge commits
- ✅ Allow squash merging (recommended)
- ❌ Allow rebase merging (optional)
- ✅ Automatically delete head branches

### Pull Requests
- ✅ Allow auto-merge
- ✅ Automatically delete head branches

### Discussions (Optional)
- ✅ Enable Discussions for Q&A and community

## 👥 Step 6: Add Collaborators

1. Go to **Settings** → **Collaborators**
2. Click **Add people**
3. Set appropriate permissions:
   - **Admin**: Full access (you)
   - **Write**: Can push and merge (trusted teammates)
   - **Read**: Can view and clone (external contributors)

## 🔐 Step 7: Security Settings

1. Go to **Settings** → **Security**
2. Enable:
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Secret scanning (if available)

## 📊 Step 8: Insights & Analytics

1. Go to **Insights** → **Community**
2. Complete the community profile:
   - ✅ Description
   - ✅ README
   - ✅ Code of conduct (optional)
   - ✅ Contributing guidelines
   - ✅ License
   - ✅ Issue templates
   - ✅ Pull request template

## 🎉 Step 9: Announce to Team

Create a pinned issue or discussion:

```markdown
# 🎉 New Professional Workflow!

We've set up a professional Git workflow with:

✅ Branch protection on `main`
✅ PR templates and review process
✅ Automated CI/CD checks
✅ Contributing guidelines
✅ Issue templates

## How to Contribute

1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Check [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)
3. Create a feature branch
4. Submit a PR using the template
5. Earn achievements! 🏆

Questions? Ask here!
```

## 🏆 Step 10: Achievement Tracking

Encourage your team to:
- Create quality PRs (Pull Shark 🦈)
- Review code quickly (Quickdraw ⚡)
- Co-author commits (Pair Extraordinaire 👥)
- Participate in discussions (Galaxy Brain 🧠)

## ✅ Verification Checklist

After setup, verify:
- [ ] Branch protection is active on `main`
- [ ] PR template appears when creating PRs
- [ ] Issue templates appear when creating issues
- [ ] GitHub Actions workflow runs on PRs
- [ ] Labels are created
- [ ] Collaborators have correct permissions
- [ ] README is complete and professional
- [ ] Contributing guide is clear

## 🔄 Maintenance

Regular tasks:
- Review and merge PRs promptly
- Keep dependencies updated
- Monitor GitHub Actions for failures
- Respond to issues and discussions
- Update documentation as project evolves

---

Your repository is now professionally configured! 🚀
