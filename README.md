# 🍽️ FoodChain - AI-Powered Supply Chain Tracking

A blockchain-based food supply chain tracking system that uses AI to analyze food quality at each stage and stores immutable records on the Stellar blockchain.

## 🎯 Project Overview

FoodChain tracks products (milk, water, juice) through four stages:
- **Farm** → **Processing** → **Distributor** → **Retail**

Each stage analyzes quality parameters (TDS, color) and makes decisions to ensure food safety.

## 🏗️ Architecture

- **Frontend**: React + Vite
- **Backend**: FastAPI (Python)
- **Blockchain**: Stellar Testnet
- **AI**: Custom quality analysis algorithms

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python 3.8+
- Git

### Installation

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python server.py
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and commit with clear messages
4. **Push to your fork**: `git push origin feature/your-feature-name`
5. **Open a Pull Request** against the `main` branch

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📋 Features

- ✅ Multi-stage quality tracking
- ✅ AI-powered quality analysis
- ✅ Blockchain immutability via Stellar
- ✅ Distributor scoring system
- ✅ Root cause detection
- ✅ Automated decision engine (ALLOW/STOP_SUPPLY/BLOCK_BATCH)

## 🔐 Security

- Never commit sensitive keys or secrets
- Use environment variables for configuration
- The current SECRET_KEY in code is for testnet only

## 📝 License

[Add your license here]

## 👥 Team

- [Add team members here]

## 🏆 Achievements

Track your contributions and earn badges! See our [GitHub Achievements Guide](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile/viewing-contributions-on-your-profile).
