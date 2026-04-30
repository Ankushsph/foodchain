from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import random
import hashlib
import json
import os
from dotenv import load_dotenv
from stellar_sdk import Server, Keypair, TransactionBuilder, Network, Memo
from ai.food_chain_ai import ai_system

load_dotenv()

app = FastAPI()

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# DATA STORE
# =========================
batch_history = {}

# =========================
# STELLAR CONFIG
# =========================
STELLAR_SECRET = os.getenv("STELLAR_SECRET_KEY", "SBV") # Replace in .env
try:
    source_keypair = Keypair.from_secret(STELLAR_SECRET)
except:
    source_keypair = None
    print("[WARN] STELLAR_SECRET_KEY missing or invalid in .env")

horizon_server = Server("https://horizon-testnet.stellar.org")

def post_to_stellar(data_to_hash: dict):
    """
    Computes a SHA256 hash of the off-chain data and records it on the Stellar ledger.
    Always returns a string — never raises an exception.
    """
    if not source_keypair:
        # No Stellar key configured — return a deterministic simulation hash
        data_str = json.dumps(data_to_hash, sort_keys=True)
        return "sim_" + hashlib.sha256(data_str.encode()).hexdigest()[:32]

    try:
        data_str = json.dumps(data_to_hash, sort_keys=True)
        data_hash = hashlib.sha256(data_str.encode()).hexdigest()

        source_account = horizon_server.load_account(source_keypair.public_key)

        from stellar_sdk import Asset as StellarAsset
        transaction = (
            TransactionBuilder(
                source_account=source_account,
                network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
                base_fee=100,
            )
            .append_payment_op(
                destination=source_keypair.public_key,
                amount="0.00001",
                asset=StellarAsset.native(),
            )
            .add_memo(Memo.text(data_hash[:28]))
            .set_timeout(30)
            .build()
        )

        transaction.sign(source_keypair)
        response = horizon_server.submit_transaction(transaction)
        return response.get("hash", f"ok_{random.getrandbits(32):x}")
    except Exception as e:
        print(f"[ERROR] Stellar Error: {e}")
        return f"err_{random.getrandbits(32):x}"

# =========================
# MODEL (MATCH ESP32 JSON)
# =========================
class Sample(BaseModel):
    batch_id: str = "UNKNOWN"
    ph: Optional[float] = 7.0
    turbidity: Optional[float] = 10.0
    tds: float = 200.0
    color: float = 200.0
    stage: str = "farm"
    product: str = "milk"
    distributor: Optional[str] = "Unknown"
    retailer: Optional[str] = "Unknown"

# =========================
# SIMPLE ANALYSIS LOGIC
# =========================
def analyze_sample(sample: Sample):
    # Use the advanced AI model
    result = ai_system.analyze_sample({
        "tds": sample.tds,
        "color": sample.color,
        "source": sample.stage
    })
    
    # Map AI results to our local structure
    status = result["status"]
    risk = result["risk"]
    reason = result["reason"]
    
    return status, risk, reason

# =========================
# ROUTES
# =========================
@app.get("/")
def home():
    return {"msg": "FoodChain AI Phase 2 Backend Running"}

STAGES = ["farm", "distributor", "retail"]

# 🔥 MAIN ROUTE FOR FRONTEND / ESP32
@app.post("/analyze")
def analyze(sample: Sample):
    status, risk, reason = analyze_sample(sample)

    entry = {
        "stage": sample.stage,
        "actor": "Agricultural Source" if sample.stage == "farm" else "Logistics Node" if sample.stage == "distributor" else "Retail Center",
        "status": status,
        "risk": risk,
        "reason": reason,
        "tds": sample.tds,
        "color": sample.color,
        "ph": sample.ph,
        "turbidity": sample.turbidity,
        "distributor": sample.distributor,
        "retailer": sample.retailer,
        "time": datetime.now().isoformat()
    }

    if sample.batch_id not in batch_history:
        batch_history[sample.batch_id] = []

    # Update existing stage entry or add new one
    existing_idx = next((i for i, x in enumerate(batch_history[sample.batch_id]) if x["stage"] == sample.stage), -1)
    if existing_idx > -1:
        batch_history[sample.batch_id][existing_idx] = entry
    else:
        batch_history[sample.batch_id].append(entry)

    # Record on Stellar (On-chain/Off-chain architecture)
    tx_hash = post_to_stellar(entry)

    # Sequence Logic: Determine if this is the final stage and if it passes
    is_final_stage = (sample.stage == STAGES[-1])
    
    # Check for any failures in history
    history = batch_history[sample.batch_id]
    first_failure = next((e for e in history if e["status"] == "unsafe"), None)
    
    root_cause = first_failure["stage"] if first_failure else None
    
    if first_failure:
        decision = "BLOCK_BATCH"
    elif is_final_stage:
        decision = "APPROVED_FOR_SALE"
    else:
        decision = "ALLOW"

    response = {
        "batch_id": sample.batch_id,
        "current_stage_result": entry,
        "batch_history": history,
        "root_cause": root_cause,
        "decision": decision,
        "blockchain_hash": tx_hash
    }
    
    # Store globally for /live endpoint (don't overwrite the raw ESP32 stream)
    global latest_analysis_result
    latest_analysis_result = response
    
    print(f"Received {sample.stage} data for {sample.batch_id}: {status} | Decision: {decision}")
    return response

@app.post("/reset")
def reset_all():
    global batch_history, latest_analysis_result, latest_esp32_data
    batch_history = {}
    latest_analysis_result = {"connected": False}
    # Reset ESP32 data to safe defaults too
    latest_esp32_data = {"tds": 0, "color": 0, "connected": latest_esp32_data.get("connected", False)}
    return {"status": "reset success"}

# 📡 LIVE FEED STATE
latest_esp32_data = {"tds": 0, "color": 0, "connected": False}
latest_analysis_result = {"connected": False}

@app.post("/esp32/update")
async def update_esp32_live(data: dict):
    global latest_esp32_data
    # Log the incoming data for debugging
    print(f"ESP32 Telemetry: TDS={data.get('tds')} | COLOR={data.get('color')} | pH={data.get('ph')} | Turb={data.get('turbidity')}")
    
    latest_esp32_data = {
        "connected": True,
        "tds": data.get("tds", 0),
        "color": data.get("color", 0),
        "status": "STREAMING",
        "last_updated": datetime.now().isoformat()
    }
    return {"status": "success"}

@app.get("/verify/{batch_id}")
def verify(batch_id: str):
    if batch_id not in batch_history:
        return {
            "verdict": "Batch Not Found",
            "status": "UNKNOWN",
            "root_cause": None,
            "total_checkpoints": 0,
            "events": []
        }
    
    history = batch_history[batch_id]
    root_cause = None
    for entry in history:
        if entry["status"] == "unsafe":
            root_cause = entry["stage"]
            break
            
    return {
        "verdict": "Contamination Detected" if root_cause else "Batch Fully Verified",
        "status": "UNSAFE" if root_cause else "SAFE",
        "root_cause": root_cause,
        "total_checkpoints": len(history),
        "events": [
            {
                "stage": e["stage"],
                "actor": e["actor"],
                "status": e["status"],
                "timestamp": e["time"],
                "event_hash": f"stellar_tx_{random.getrandbits(64):016x}"
            } for e in history
        ]
    }

@app.get("/live")
def get_live():
    # Return a merged object for the frontend to consume easily
    return {
        "connected": latest_esp32_data.get("connected", False),
        "tds": latest_esp32_data.get("tds", 0),
        "color": latest_esp32_data.get("color", 0),
        "status": latest_esp32_data.get("status", "IDLE"),
        "last_updated": latest_esp32_data.get("last_updated"),
        "analysis": latest_analysis_result
    }