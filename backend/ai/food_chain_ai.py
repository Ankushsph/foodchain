import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import json
import warnings
from datetime import datetime, timedelta
import random

# Suppress specific sklearn warnings about feature names
warnings.filterwarnings("ignore", category=UserWarning)

class FoodChainAI:
    def __init__(self):
        # Configuration
        self.max_history = 100
        self.history = []
        self.sources = ["Farm A", "Distributor A", "Retail A", "Storage Unit 4"]
        
        # Product-specific quality standards
        self.product_standards = {
            "water": {
                "name": "Mineral Water",
                "tds_safe_max": 200,  # Stricter: pure water should be <200
                "tds_acceptable_max": 300,  # Reduced from 500
                "color_min": 150,  # Stricter: water should be very clear
                "color_warning": 120,
                "training_tds": (50, 200),  # Narrower training range
                "training_color": (150, 255)  # Higher color values only
            },
            "milk": {
                "name": "Fresh Milk",
                "tds_safe_max": 280,
                "tds_acceptable_max": 350,
                "color_min": 160,
                "color_warning": 140,
                "training_tds": (200, 300),
                "training_color": (160, 255)
            },
            "juice": {
                "name": "Fruit Juice",
                "tds_safe_max": 400,
                "tds_acceptable_max": 600,
                "color_min": 120,
                "color_warning": 100,
                "training_tds": (150, 450),
                "training_color": (120, 255)
            }
        }
        
        # Initialize Models for each product type
        self.models = {}
        for product_type, standards in self.product_standards.items():
            training_data = self._generate_training_data(
                standards["training_tds"],
                standards["training_color"]
            )
            self.models[product_type] = self._train_model(training_data)
        
        # Pre-seed history with mock data for testing
        self._seed_history(50)

    def _generate_training_data(self, tds_range, color_range, n_samples=300):
        """Generates synthetic 'normal' data for specific product type."""
        np.random.seed(42)
        tds = np.random.uniform(tds_range[0], tds_range[1], n_samples)
        color = np.random.uniform(color_range[0], color_range[1], n_samples)
        return pd.DataFrame({'tds': tds, 'color': color})

    def _train_model(self, data):
        """Trains Isolation Forest model."""
        model = IsolationForest(contamination=0.1, random_state=42)
        model.fit(data)
        return model

    def _seed_history(self, n):
        """Pre-seeds the history with simulated safe and unsafe data."""
        product_types = list(self.product_standards.keys())
        
        for i in range(n):
            product_type = random.choice(product_types)
            standards = self.product_standards[product_type]
            
            # 80% safe, 20% unsafe
            is_anomaly = random.random() < 0.2
            if is_anomaly:
                # Unsafe: exceed limits
                tds = random.uniform(standards["tds_acceptable_max"], standards["tds_acceptable_max"] + 200)
                color = random.uniform(30, standards["color_warning"])
            else:
                # Safe: within normal range
                tds = random.uniform(standards["training_tds"][0], standards["tds_safe_max"])
                color = random.uniform(standards["color_min"], standards["training_color"][1])
            
            # Predict status using product-specific model
            sample_df = pd.DataFrame([[tds, color]], columns=['tds', 'color'])
            prediction = self.models[product_type].predict(sample_df)[0]
            status = "safe" if prediction == 1 else "unsafe"
            
            self.history.append({
                "tds": round(tds, 2),
                "color": round(color, 2),
                "status": status,
                "product_type": product_type,
                "source": random.choice(self.sources),
                "timestamp": (datetime.now() - timedelta(hours=n-i)).isoformat()
            })

    def analyze_trends(self):
        """Analyzes historical status trends."""
        if len(self.history) < 10:
            return {"trend": "stable", "message": "Insufficient historical data for trend analysis"}
        
        recent = self.history[-10:]
        previous = self.history[-20:-10] if len(self.history) >= 20 else self.history[:len(self.history)-10]
        
        recent_unsafe = sum(1 for x in recent if x['status'] == 'unsafe')
        prev_unsafe = sum(1 for x in previous if x['status'] == 'unsafe')
        
        if recent_unsafe > prev_unsafe:
            trend = "increasing"
            msg = f"Unsafe samples increased by {recent_unsafe - prev_unsafe} in recent batches"
        elif recent_unsafe < prev_unsafe:
            trend = "decreasing"
            msg = f"Safety improved: Unsafe samples decreased by {prev_unsafe - recent_unsafe}"
        else:
            trend = "stable"
            msg = "Contamination levels remain consistent with previous records"
            
        return {"trend": trend, "message": msg}

    def predict_next_risk(self):
        """Predicts risk of next batch based on recent history."""
        if len(self.history) < 5:
            return {"prediction": "Unknown", "risk_level": "LOW"}
            
        last_5 = self.history[-5:]
        unsafe_count = sum(1 for x in last_5 if x['status'] == 'unsafe')
        
        if unsafe_count >= 3:
            return {"prediction": "High chance of contamination in next batch", "risk_level": "HIGH"}
        elif unsafe_count >= 1:
            return {"prediction": "Moderate risk of contamination detected", "risk_level": "MEDIUM"}
        else:
            return {"prediction": "Low risk for next batch based on recent performance", "risk_level": "LOW"}

    def calculate_supplier_risk(self, source):
        """Calculates risk score for a specific supplier/node."""
        supplier_data = [x for x in self.history if x['source'] == source]
        if not supplier_data:
            return {"supplier": source, "risk_score": 0, "status": "LOW RISK (NO DATA)"}
            
        unsafe_perc = (sum(1 for x in supplier_data if x['status'] == 'unsafe') / len(supplier_data)) * 100
        
        # Score is 100 - (unsafe_perc * 2) capped at 0-100
        score = max(0, 100 - int(unsafe_perc))
        
        if unsafe_perc > 50:
            status = "HIGH RISK"
        elif unsafe_perc > 20:
            status = "MEDIUM RISK"
        else:
            status = "LOW RISK"
            
        return {"supplier": source, "risk_score": score, "status": status}

    def detect_patterns(self):
        """Detects recurring patterns of contamination."""
        if len(self.history) < 5:
            return {"pattern": "None", "insight": "No recurring patterns detected yet"}
            
        last_sources = [x['source'] for x in self.history[-5:] if x['status'] == 'unsafe']
        
        if not last_sources:
             return {"pattern": "Clean Operation", "insight": "No contamination patterns detected in recent history"}
             
        from collections import Counter
        counts = Counter(last_sources)
        most_common, count = counts.most_common(1)[0]
        
        if count >= 2:
            return {
                "pattern": f"Repeated contamination from {most_common}",
                "insight": f"Detected {count} anomalies from this source recently. Possible systemic issue."
            }
            
        return {"pattern": "Random Anomalies", "insight": "No clear recurring source for recent issues"}

    def analyze_sample(self, data):
        """Phase 2 Analysis: Detection + Intelligence with product-specific standards."""
        tds = data.get('tds', 0)
        color = data.get('color', 0)
        source = data.get('source', random.choice(self.sources))
        product_type = data.get('product_type', 'water')  # Default to water
        
        # Normalize product type
        product_type = product_type.lower()
        if product_type not in self.product_standards:
            product_type = 'water'  # Fallback
        
        standards = self.product_standards[product_type]
        model = self.models[product_type]
        
        sample_df = pd.DataFrame([[tds, color]], columns=['tds', 'color'])
        
        # 1. Core Detection using product-specific model
        prediction = model.predict(sample_df)[0]
        status = "safe" if prediction == 1 else "unsafe"
        
        # 2. Product-specific Reasoning
        reasons = []
        
        if product_type == "water":
            if tds > standards["tds_acceptable_max"]:
                reasons.append(f"High TDS ({tds} ppm, limit: {standards['tds_acceptable_max']})")
            elif tds > standards["tds_safe_max"]:
                reasons.append(f"Elevated TDS ({tds} ppm, pure water should be <{standards['tds_safe_max']})")
            if color < standards["color_min"]:
                reasons.append(f"Poor water clarity (color={color}, expected: >{standards['color_min']})")
            elif color < standards["color_warning"]:
                reasons.append(f"Water clarity warning (color={color})")
                
        elif product_type == "milk":
            if tds > standards["tds_acceptable_max"]:
                reasons.append(f"Possible water adulteration (TDS={tds} ppm, normal: <{standards['tds_safe_max']})")
            elif tds < 200:
                reasons.append(f"Possible dilution (TDS={tds} ppm too low)")
            if color < standards["color_warning"]:
                reasons.append(f"Abnormal milk color (value={color}, expected: >{standards['color_min']})")
                
        elif product_type == "juice":
            if tds > standards["tds_acceptable_max"]:
                reasons.append(f"Excessive dissolved solids (TDS={tds} ppm, max: {standards['tds_acceptable_max']})")
            if color < standards["color_warning"]:
                reasons.append(f"Color deviation detected (value={color}, expected: >{standards['color_min']})")
        
        if not reasons and status == "unsafe":
            reasons.append(f"Anomalous sensor pattern detected by AI model for {standards['name']}")
        
        reason = " and ".join(reasons) if reasons else f"All parameters within safe {standards['name']} standards"
        
        # 3. Confidence
        raw_score = model.decision_function(sample_df)[0]
        confidence = 0.5 + min(0.49, abs(raw_score) * 5)
        
        # 4. Save to History
        self.history.append({
            "tds": tds,
            "color": color,
            "status": status,
            "product_type": product_type,
            "source": source,
            "timestamp": datetime.now().isoformat()
        })
        if len(self.history) > self.max_history:
            self.history.pop(0)
            
        # 5. Phase 2 Intelligence
        trend = self.analyze_trends()
        prediction_risk = self.predict_next_risk()
        supplier_risk = self.calculate_supplier_risk(source)
        pattern = self.detect_patterns()
        
        return {
            "status": status,
            "confidence": round(float(confidence), 2),
            "risk": prediction_risk['risk_level'],
            "reason": reason,
            "source": source,
            "product_type": standards['name'],
            "interpretation": f"Possible contamination detected in {standards['name']}" if status == "unsafe" else f"{standards['name']} is safe for consumption",
            
            # Phase 2 Fields
            "trend": trend['message'],
            "prediction": prediction_risk['prediction'],
            "supplier_risk": f"{supplier_risk['risk_score']}/100 ({supplier_risk['status']})",
            "pattern": pattern['insight']
        }

# Global Instance
ai_system = FoodChainAI()

def run_phase2_demo():
    print("\n" + "="*70)
    print("🚀 FOODCHAIN AI - PHASE 2: PREDICTIVE INTELLIGENCE DEMO")
    print("="*70)
    
    # Test cases
    test_cases = [
        {"tds": 220, "color": 210, "source": "Farm A"},
        {"tds": 480, "color": 120, "source": "Distributor A"},
        {"tds": 490, "color": 115, "source": "Distributor A"} # Repeated from same source
    ]
    
    for i, case in enumerate(test_cases):
        print(f"\n[SAMPLE {i+1}] Input: {case}")
        result = ai_system.analyze_sample(case)
        print(json.dumps(result, indent=4))
        print("-" * 50)

if __name__ == "__main__":
    run_phase2_demo()
    
    # Manual loop
    print("\n\n🧠 ENTER MANUAL TESTING MODE (Type 'exit' to quit)")
    while True:
        try:
            val = input("\nEnter TDS value (or 'exit'): ")
            if val.lower() == 'exit': break
            tds = float(val)
            color = float(input("Enter Color value: "))
            
            res = ai_system.analyze_sample({"tds": tds, "color": color})
            print("\n✨ PHASE 2 ANALYSIS:")
            print(json.dumps(res, indent=4))
        except ValueError:
            print("Invalid input.")
