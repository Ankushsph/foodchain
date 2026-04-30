# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. ❌ "ERR_CONNECTION_REFUSED" in Browser

**Symptoms:** Frontend shows "This site can't be reached" or "Connection refused"

**Solutions:**

#### Check if Backend is Running
```bash
# Test backend
curl http://localhost:8000
# or
Invoke-RestMethod -Uri "http://localhost:8000/"
```

#### Restart Backend
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Check Port Conflicts
```bash
# Windows
netstat -ano | findstr :8000

# If port is in use, kill the process or use a different port
```

#### Clear Browser Cache
- Press `Ctrl + Shift + Delete`
- Clear cached images and files
- Reload the page with `Ctrl + F5`

---

### 2. ⚠️ "404 Not Found" for favicon.ico

**Status:** ✅ FIXED

The backend now returns 204 No Content for favicon requests instead of 404.

---

### 3. 🔐 Stellar Transaction Errors

**Symptoms:** `blockchain_hash` starts with `err_` or `sim_`

**Solutions:**

#### Check .env File
```bash
# backend/.env should contain:
STELLAR_SECRET_KEY=YOUR_SECRET_KEY_HERE
```

#### Verify Stellar Account
- Ensure account has testnet XLM
- Get free testnet XLM: https://laboratory.stellar.org/#account-creator

#### Check Logs
```bash
# Look for errors in backend logs
[ERROR] Stellar Error: ...
```

---

### 4. 🤖 AI Analysis Issues

**Symptoms:** Wrong product analysis or unexpected results

**Solutions:**

#### Verify Product Type
- Ensure correct product is selected (water/milk/juice)
- Check TDS and Color values are reasonable

#### Check Product Standards
See `PRODUCT_STANDARDS.md` for expected ranges:
- Water: TDS 50-500, Color 100-255
- Milk: TDS 200-350, Color 160-255
- Juice: TDS 150-600, Color 120-255

---

### 5. 📡 ESP32 Connection Issues

**Symptoms:** No live data from ESP32

**Solutions:**

#### Check ESP32 Configuration
```cpp
// In esp32_code.ino
const char* serverUrl = "http://YOUR_BACKEND_IP:8000/esp32/update";
```

#### Verify Network
- ESP32 and backend must be on same network
- Check WiFi credentials in ESP32 code

#### Test Endpoint
```bash
curl -X POST http://localhost:8000/esp32/update \
  -H "Content-Type: application/json" \
  -d '{"tds":100,"color":150}'
```

---

### 6. 🔄 Frontend Not Updating

**Symptoms:** Changes not reflected in browser

**Solutions:**

#### Hard Refresh
- `Ctrl + F5` (Windows/Linux)
- `Cmd + Shift + R` (Mac)

#### Restart Frontend Dev Server
```bash
cd frontend
npm run dev
```

#### Clear Node Modules
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

---

### 7. 🐍 Python Dependency Errors

**Symptoms:** Import errors or module not found

**Solutions:**

#### Reinstall Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Check Python Version
```bash
python --version
# Should be Python 3.8+
```

#### Use Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

---

## Quick Health Check

Run these commands to verify everything is working:

```bash
# 1. Backend Health
curl http://localhost:8000/

# 2. Frontend Health
curl http://localhost:5173/

# 3. Test Analysis
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"batch_id":"TEST","tds":100,"color":150,"stage":"farm","product":"water"}'

# 4. Check Processes
# Backend should be on port 8000
# Frontend should be on port 5173
```

---

## Getting Help

If issues persist:

1. Check server logs for error messages
2. Review `WORKFLOW_GUIDE.md` for setup instructions
3. Verify all dependencies are installed
4. Try restarting both servers
5. Check firewall/antivirus settings

---

## Useful Commands

```bash
# Stop all processes
# Press Ctrl+C in terminal windows

# Check if ports are in use
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# View backend logs
# Check terminal where uvicorn is running

# View frontend logs
# Check terminal where npm run dev is running

# Test Stellar connection
curl https://horizon-testnet.stellar.org/

# Clear Python cache
find . -type d -name __pycache__ -exec rm -rf {} +
```

---

*Last Updated: May 1, 2026*
