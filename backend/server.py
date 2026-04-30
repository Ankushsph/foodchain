from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Ensure we can import from the ai directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ai.food_chain_ai import ai_system

app = Flask(__name__)
CORS(app)  # Allow requests from your React frontend (localhost:5173)

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """
    Endpoint to analyze sensor data using the FoodChain AI model.
    Expects JSON: {"tds": value, "color": value}
    """
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Ensure we have the required keys, or default to some values
        sensor_input = {
            "tds": data.get("tds", 200),
            "color": data.get("color", 200)
        }
        
        # Call the Phase 2 AI module
        result = ai_system.analyze_sample(sensor_input)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy", 
        "service": "FoodChain AI Phase 2 Backend",
        "model": "Isolation Forest + Predictive Intel"
    })

if __name__ == '__main__':
    print("="*50)
    print("--- FOODCHAIN AI BACKEND SERVER STARTING ---")
    print("Listening on: http://localhost:8000")
    print("="*50)
    app.run(host='0.0.0.0', port=8000, debug=True)
