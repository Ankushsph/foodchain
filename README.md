# 🍽️ FoodChain AI - Blockchain-Powered Supply Chain Tracking

> **Hackathon Project:** AI-driven food safety monitoring with blockchain verification

A comprehensive food supply chain tracking system that uses **AI analysis**, **IoT sensors (ESP32)**, and **Stellar blockchain** to ensure food safety and transparency from farm to retail. Real-time quality monitoring with immutable blockchain records for complete supply chain visibility.

---

## 🎯 Project Overview

FoodChain AI tracks products (Water, Milk, Juice) through the entire supply chain with real-time quality analysis and immutable blockchain records.

### Key Features

- 🤖 **Product-Specific AI Models** - Custom quality standards for Water, Milk, and Juice
- ⛓️ **Stellar Blockchain Integration** - Immutable transaction records on testnet
- 📱 **ESP32 IoT Integration** - Real-time sensor data streaming (TDS & Color)
- 🔍 **QR Code Scanner** - Instant batch verification for consumers
- 📊 **Live Analytics Dashboard** - Real-time monitoring and insights
- 🏭 **Multi-Stage Tracking** - Farm → Distributor → Retail
- 🔐 **Actor Reputation System** - Supplier scoring and blacklisting
- 📈 **Predictive Intelligence** - Trend analysis and risk prediction

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   ESP32     │────▶│   Backend    │────▶│  Stellar    │
│  Sensors    │     │   FastAPI    │     │ Blockchain  │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Frontend   │
                    │  React+Vite  │
                    └──────────────┘
```

**Tech Stack:**
- **Backend:** FastAPI (Python), SQLite, Stellar SDK
- **Frontend:** React, Vite, Zustand, TailwindCSS
- **AI/ML:** Scikit-learn (Isolation Forest)
- **Blockchain:** Stellar Testnet
- **IoT:** ESP32, TDS Sensor, Color Sensor

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Altaria-hackathon-teams/blockchain-foodchaincoders.git
cd blockchain-foodchaincoders/foodchain
```

2. **Backend Setup**
```bash
cd backend
pip install fastapi uvicorn stellar-sdk scikit-learn numpy pandas
```

Create `requirements.txt` if needed:
```txt
fastapi==0.104.1
uvicorn==0.24.0
stellar-sdk==9.1.0
scikit-learn==1.3.2
numpy==1.26.2
pandas==2.1.3
python-multipart==0.0.6
```

3. **Configure Stellar (Optional)**
Create `backend/.env`:
```env
STELLAR_SECRET_KEY=YOUR_STELLAR_SECRET_KEY
STELLAR_PUBLIC_KEY=YOUR_STELLAR_PUBLIC_KEY
```

Generate Stellar keys:
```bash
python generate_stellar_account.py
```

4. **Frontend Setup**
```bash
cd frontend
npm install
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access:**
- 🌐 Frontend: http://localhost:5173
- 📚 API Docs: http://localhost:8000/docs

---

## 📊 Product Quality Standards

### 💧 Mineral Water
- **Safe TDS:** 50-200 ppm
- **Max TDS:** 300 ppm
- **Color:** 150-255 (crystal clear)

### 🥛 Fresh Milk
- **Safe TDS:** 200-280 ppm
- **Max TDS:** 350 ppm
- **Color:** 160-255 (white/creamy)

### 🧃 Fruit Juice
- **Safe TDS:** 150-400 ppm
- **Max TDS:** 600 ppm
- **Color:** 120-255 (natural fruit color)

---

## 🔬 ESP32 IoT Setup

### Hardware Requirements
- ESP32 Development Board
- TDS Sensor (GPIO 34)
- Color Sensor (GPIO 35)
- WiFi Connection

### Configuration

1. Open `esp32_code.ino` in Arduino IDE
2. Update WiFi credentials:
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
```
3. Update server IP:
```cpp
const char* serverUrl = "http://YOUR_LAPTOP_IP:8000/esp32/telemetry";
```
4. Upload to ESP32

---

## 📱 Features

### Dashboard
- Real-time ESP32 sensor data streaming
- Batch analysis with AI predictions
- Product-specific quality checks
- Identity verification protocol

### Supply Chain Tracking
- Multi-stage pipeline visualization
- Real-time status updates
- Root cause detection
- Automated decision engine (ALLOW/BLOCK_BATCH/STOP_SUPPLY)

### QR Scanner
- Instant batch verification
- Blockchain audit trail
- Supply chain trace
- Consumer safety verification

### Blockchain Audit
- View all blockchain transactions
- Verify data integrity
- Immutable record keeping
- Stellar testnet integration

### Analytics
- Historical trends
- Supplier performance
- Risk predictions
- Pattern detection

---

## 🤖 AI Models

### Product-Specific Analysis
Each product type has a dedicated Isolation Forest model trained on specific quality parameters:

- **Water Model:** Detects contamination, coffee, or other substances
- **Milk Model:** Identifies dilution and adulteration
- **Juice Model:** Monitors freshness and composition

### Intelligence Features
- Anomaly detection
- Trend analysis
- Predictive risk assessment
- Supplier reputation scoring
- Pattern recognition

---

## ⛓️ Blockchain Integration

### Stellar Testnet
- Immutable transaction records
- SHA256 hash storage in memos
- Minimal transaction fees (0.00001 XLM)
- Public verification

### Transaction Flow
1. Sensor data collected
2. AI analysis performed
3. Data hash generated (SHA256)
4. Hash stored on Stellar blockchain
5. Transaction hash returned as proof

**Verify transactions:** https://stellar.expert/explorer/testnet

---

## 📁 Project Structure

```
foodchain/
├── backend/
│   ├── ai/
│   │   └── food_chain_ai.py      # AI models & analysis engine
│   ├── main.py                    # FastAPI application & routes
│   ├── server.py                  # Server configuration
│   ├── debug_db.py               # Database debugging utilities
│   ├── foodchain.db              # SQLite database
│   ├── .env                       # Stellar configuration (create this)
│   └── requirements.txt           # Python dependencies (create this)
├── frontend/
│   ├── src/
│   │   ├── pages/                # React pages (Dashboard, Scanner, etc.)
│   │   ├── components/           # UI components (Button, Badge, etc.)
│   │   ├── store/                # Zustand state management
│   │   └── api/                  # API client configuration
│   ├── public/                   # Static assets
│   ├── package.json              # Node dependencies
│   └── vite.config.js            # Vite configuration
├── esp32_code.ino                # ESP32 firmware for IoT sensors
├── generate_stellar_account.py   # Stellar account generator
└── README.md                      # This file
```

---

## 🎮 Demo

### Test Batch
A demo batch is pre-loaded for testing:

**Batch ID:** `MILK-001`
- **Product:** Premium Whole Milk
- **Status:** ✅ SAFE
- **Stages:** Farm → Distributor → Retail
- **Blockchain:** Verified

**To test:**
1. Go to Scanner page
2. Click "SIMULATE DEMO SCAN"
3. View complete supply chain trace

---

## 🔐 Security Features

- Actor identity verification
- Wallet-based authentication
- Blockchain immutability
- Supplier blacklisting
- Duplicate batch detection
- Sequential stage validation

---

## 📊 API Endpoints

### Core Endpoints
- `POST /analyze` - Analyze batch with AI
- `GET /verify/{batch_id}` - Verify batch on blockchain
- `POST /esp32/telemetry` - Receive ESP32 sensor data
- `GET /live` - Get live ESP32 stream
- `GET /analytics` - Get analytics data
- `POST /reset` - Reset system state

**Full API Documentation:** http://localhost:8000/docs

---

## 🏆 Hackathon Highlights

### Innovation
- ✅ Product-specific AI models (not one-size-fits-all)
- ✅ Real-time IoT integration with ESP32
- ✅ Blockchain verification for consumers
- ✅ Predictive intelligence and trend analysis
- ✅ Complete supply chain visibility

### Technical Excellence
- ✅ Clean, modular architecture
- ✅ Real-time data streaming
- ✅ Responsive UI with smooth animations
- ✅ Comprehensive error handling
- ✅ Production-ready code quality

### Impact
- 🌍 Food safety assurance
- 🔍 Consumer transparency
- 📈 Supplier accountability
- 🚫 Contamination prevention
- ⛓️ Immutable audit trail

---

## 🛠️ Development

### Database Management
```bash
# View database contents
cd backend
python debug_db.py
```

### Debugging
- Backend logs: `backend/debug.log`, `backend/api_debug.log`
- Frontend: Browser DevTools Console
- ESP32: Arduino Serial Monitor (115200 baud)

### Code Quality
```bash
# Frontend linting
cd frontend
npm run lint
```

---

## � Troubleshooting

### Backend Issues
- **Port 8000 in use:** Change port with `--port 8001`
- **Stellar errors:** Verify `.env` configuration or run without blockchain
- **Database locked:** Close other connections to `foodchain.db`

### Frontend Issues
- **Port 5173 in use:** Vite will auto-assign another port
- **API connection failed:** Ensure backend is running on port 8000
- **CORS errors:** Check `vite.config.js` proxy settings

### ESP32 Issues
- **Connection failed:** Verify WiFi credentials and server IP
- **Sensor readings incorrect:** Check GPIO pin connections (TDS=34, Color=35)
- **Upload failed:** Select correct board (ESP32 Dev Module) and COM port

---

## 👥 Team

**FoodChain Coders**
- Blockchain Integration
- AI/ML Development
- IoT Hardware Integration
- Full-Stack Development

---

## 📄 License

This project is developed for the Altaria Hackathon.

---

## 🙏 Acknowledgments

- Stellar Development Foundation for blockchain infrastructure
- FastAPI for the excellent Python framework
- React and Vite teams for frontend tools
- Arduino community for ESP32 support

---

## 🚀 Future Enhancements

- [ ] Mobile app for consumers
- [ ] More product types (vegetables, meat, etc.)
- [ ] GPS tracking integration
- [ ] Temperature and humidity sensors
- [ ] Machine learning model improvements
- [ ] Multi-language support
- [ ] Production deployment on mainnet

---

**Built with ❤️ for food safety and transparency**

🌐 **Live Demo:** http://localhost:5173  
📚 **API Docs:** http://localhost:8000/docs  
⛓️ **Blockchain:** Stellar Testnet
