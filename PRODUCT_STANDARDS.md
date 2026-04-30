# 🧪 Product-Specific Quality Standards

The FoodChain AI system now analyzes each product type with specific quality parameters.

## 📊 Quality Standards by Product

### 💧 Mineral Water
- **TDS (Total Dissolved Solids)**
  - ✅ Safe: 50-200 ppm (pure water)
  - ⚠️ Acceptable: 200-300 ppm (elevated but drinkable)
  - ❌ Unsafe: >300 ppm
- **Color Index**
  - ✅ Safe: 150-255 (crystal clear)
  - ⚠️ Warning: 120-150 (slight cloudiness)
  - ❌ Unsafe: <120 (poor clarity)

**Analysis Focus:** Very strict purity standards - detects contamination, coffee, or other non-water substances

---

### 🥛 Fresh Milk
- **TDS (Total Dissolved Solids)**
  - ✅ Safe: 200-280 ppm
  - ⚠️ Acceptable: 280-350 ppm
  - ❌ Unsafe: >350 ppm or <200 ppm (dilution/adulteration)
- **Color Index**
  - ✅ Safe: 160-255 (white/creamy)
  - ⚠️ Warning: 140-160
  - ❌ Unsafe: <140 (discoloration)

**Analysis Focus:** Detects water adulteration and dilution

---

### 🧃 Fruit Juice
- **TDS (Total Dissolved Solids)**
  - ✅ Safe: 150-400 ppm
  - ⚠️ Acceptable: 400-600 ppm
  - ❌ Unsafe: >600 ppm
- **Color Index**
  - ✅ Safe: 120-255 (natural fruit color)
  - ⚠️ Warning: 100-120
  - ❌ Unsafe: <100 (severe deviation)

**Analysis Focus:** Natural composition and freshness indicators

---

### ☕ Coffee
- **TDS (Total Dissolved Solids)**
  - ✅ Safe: 400-800 ppm (proper extraction)
  - ⚠️ Acceptable: 800-1200 ppm
  - ❌ Unsafe: >1200 ppm (over-extracted) or <400 ppm (under-extracted/diluted)
- **Color Index**
  - ✅ Safe: 80-200 (rich brown)
  - ⚠️ Warning: 50-80
  - ❌ Unsafe: <50 (abnormal color)

**Analysis Focus:** Extraction quality and concentration

---

## 🤖 AI Model Features

### Product-Specific Models
Each product has its own trained Isolation Forest model with:
- Custom training data ranges
- Product-specific anomaly detection
- Tailored reasoning messages

### Intelligent Analysis
- **Status Detection:** Safe/Unsafe classification
- **Risk Assessment:** LOW/MEDIUM/HIGH risk levels
- **Trend Analysis:** Historical pattern detection
- **Supplier Scoring:** Track quality by source
- **Predictive Intelligence:** Forecast next batch risk

## 🔬 How It Works

1. **Select Product Type** - Choose Water, Milk, or Juice
2. **Input Sensor Data** - TDS and Color readings
3. **AI Analysis** - Product-specific model evaluates
4. **Get Results** - Status, risk level, and detailed reasoning

## 📝 Example Results

### Water (TDS=100, Color=150)
```json
{
  "status": "safe",
  "risk": "LOW",
  "reason": "All parameters within safe Mineral Water standards",
  "product_type": "Mineral Water"
}
```

### Milk (TDS=250, Color=180)
```json
{
  "status": "safe",
  "risk": "LOW",
  "reason": "All parameters within safe Fresh Milk standards",
  "product_type": "Fresh Milk"
}
```

### Juice (TDS=300, Color=140)
```json
{
  "status": "safe",
  "risk": "LOW",
  "reason": "All parameters within safe Fruit Juice standards",
  "product_type": "Fruit Juice"
}
```

---

## 🚀 Testing

Try different combinations:

**Safe Water:** TDS=150, Color=200
**Contaminated Water:** TDS=600, Color=50

**Safe Milk:** TDS=250, Color=180
**Diluted Milk:** TDS=150, Color=130

**Safe Juice:** TDS=300, Color=150
**Bad Juice:** TDS=700, Color=80

---

*Last Updated: May 1, 2026*
