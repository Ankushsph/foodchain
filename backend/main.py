from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import random
import hashlib
import json
import os
import sqlite3
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
# DATABASE SETUP
# =========================
DB_PATH = "foodchain.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS batch_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            batch_id TEXT,
            stage TEXT,
            data TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS actor_reputation (
            name TEXT PRIMARY KEY,
            type TEXT,
            score INTEGER,
            status TEXT,
            wallet_id TEXT
        )
    ''')
    conn.commit()
    conn.close()

def seed_demo_data():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Check if MILK-001 already exists
    cursor.execute('SELECT COUNT(*) FROM batch_history WHERE batch_id = "MILK-001"')
    if cursor.fetchone()[0] == 0:
        # Create a perfect safe batch history
        stages = [
            ("farm", "Agricultural Source", "safe", "High quality fresh milk collected", 98),
            ("distributor", "Logistics Node", "safe", "Maintained constant 4°C during transit", 95),
            ("retail", "Retail Center", "safe", "Verified safe for shelf display", 92)
        ]
        
        for stage, actor, status, reason, score in stages:
            # Seed actor reputation if needed
            cursor.execute('INSERT OR IGNORE INTO actor_reputation (name, type, score, status, wallet_id) VALUES (?, ?, ?, ?, ?)',
                          (actor, stage, score, 'TRUSTED', f"G{hashlib.sha256(actor.encode()).hexdigest()[:24].upper()}"))
            
            entry = {
                "stage": stage,
                "actor": actor,
                "status": status,
                "risk": "LOW",
                "reason": reason,
                "tds": 220,
                "color": 210,
                "batch_id": "MILK-001",
                "timestamp": datetime.now().isoformat(),
                "blockchain_hash": f"stellar_tx_{random.getrandbits(64):016x}",
                "product": "Premium Whole Milk"
            }
            cursor.execute('INSERT INTO batch_history (batch_id, stage, data) VALUES (?, ?, ?)', 
                          ("MILK-001", stage, json.dumps(entry)))
        conn.commit()
    conn.close()

init_db()
seed_demo_data()

def update_actor_score(name, actor_type, delta):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    clean_name = name.strip().lower()
    cursor.execute('SELECT score, wallet_id FROM actor_reputation WHERE name = ?', (clean_name,))
    row = cursor.fetchone()
    
    if row:
        old_score, wallet_id = row
        new_score = max(0, min(100, old_score + delta))
        status = 'TRUSTED' if new_score >= 70 else 'WARNING' if new_score >= 30 else 'BLACKLISTED'
        cursor.execute('UPDATE actor_reputation SET score = ?, status = ? WHERE name = ?', 
                       (new_score, status, clean_name))
    else:
        new_score = max(0, min(100, 75 + delta))
        wallet_id = f"G{hashlib.sha256(clean_name.encode()).hexdigest()[:24].upper()}"
        cursor.execute('INSERT INTO actor_reputation (name, type, score, status, wallet_id) VALUES (?, ?, ?, ?, ?)',
                       (clean_name, actor_type, new_score, 'TRUSTED', wallet_id))
    conn.commit()
    conn.close()

def get_actor_status(name):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT status, score, wallet_id FROM actor_reputation WHERE name = ?', (name,))
    row = cursor.fetchone()
    conn.close()
    return row if row else ("TRUSTED", 75, None)

def verify_actor_identity(name, provided_key, actor_type):
    clean_name = name.strip().lower()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT wallet_id FROM actor_reputation WHERE name = ?', (clean_name,))
    row = cursor.fetchone()
    
    if row:
        registered_key = row[0]
        conn.close()
        if str(registered_key) == str(provided_key):
            return True, registered_key, ""
        else:
            return False, registered_key, f"❌ Identity Mismatch: Please use the original wallet key for '{name}'."
    else:
        wallet_id = provided_key if (provided_key and provided_key != "") else f"S{hashlib.sha256((clean_name + str(random.random())).encode()).hexdigest()[:48].upper()}"
        cursor.execute('INSERT INTO actor_reputation (name, type, score, status, wallet_id) VALUES (?, ?, ?, ?, ?)',
                       (clean_name, actor_type, 75, 'TRUSTED', wallet_id))
        conn.commit()
        conn.close()
        return True, wallet_id, ""

def get_recall_batches(distributor_name):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT batch_id FROM batch_history 
        WHERE stage = 'distributor' 
        AND data LIKE ?
        AND timestamp > date('now', 'start of day')
    ''', (f'%"{distributor_name}"%',))
    rows = cursor.fetchall()
    conn.close()
    return [row[0] for row in rows]

def save_event_to_db(batch_id, stage, data):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM batch_history WHERE batch_id = ? AND stage = ?', (batch_id, stage))
    cursor.execute('INSERT INTO batch_history (batch_id, stage, data) VALUES (?, ?, ?)', 
                   (batch_id, stage, json.dumps(data)))
    conn.commit()
    conn.close()

def load_batch_from_db(batch_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT data FROM batch_history WHERE batch_id = ?', (batch_id,))
    rows = cursor.fetchall()
    conn.close()
    return [json.loads(row[0]) for row in rows]

batch_history = {}

# =========================
# STELLAR CONFIG
# =========================
STELLAR_SECRET = os.getenv("STELLAR_SECRET_KEY", "SBV")
try:
    source_keypair = Keypair.from_secret(STELLAR_SECRET)
except:
    source_keypair = None

horizon_server = Server("https://horizon-testnet.stellar.org")

def post_to_stellar(data_to_hash: dict):
    if not source_keypair:
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
        return f"stellar_tx_{response.get('hash')}"
    except Exception as e:
        return f"stellar_err_{random.getrandbits(32):x}"

# =========================
# MODEL
# =========================
class Sample(BaseModel):
    batch_id: str = "UNKNOWN"
    ph: Optional[float] = 7.0
    turbidity: Optional[float] = 10.0
    tds: float = 200.0
    color: float = 200.0
    stage: str = "farm"
    product: str = "milk"
    farmer_name: Optional[str] = "Unknown"
    distributor: Optional[str] = "Unknown"
    retailer: Optional[str] = "Unknown"
    wallet_key: Optional[str] = ""

def analyze_sample(sample: Sample):
    result = ai_system.analyze_sample({"tds": sample.tds, "color": sample.color, "source": sample.stage})
    return result["status"], result["risk"], result["reason"]

# =========================
# ROUTES
# =========================
STAGES = ["farm", "distributor", "retail"]
latest_esp32_data = {"tds": 0, "color": 0, "connected": False}
latest_analysis_result = None

@app.get("/")
def home(): return {"msg": "FoodChain AI Backend Running"}

@app.post("/analyze")
def analyze(sample: Sample):
    try:
        current_actor_name = sample.farmer_name if sample.stage == 'farm' else sample.distributor if sample.stage == 'distributor' else sample.retailer
        actor_type = "farmer" if sample.stage == "farm" else "distributor" if sample.stage == "distributor" else "retailer"
        
        success, key, err_msg = verify_actor_identity(current_actor_name, sample.wallet_key, actor_type)
        if not success:
            return {"status": "BLOCKED", "decision": "BLOCK_BATCH", "reason": err_msg, "registered_key": key}

        existing_events = load_batch_from_db(sample.batch_id)
        if sample.stage == 'farm' and len(existing_events) > 0:
            return {"status": "BLOCKED", "decision": "BLOCK_BATCH", "reason": "🛑 Duplicate ID"}
        elif sample.stage != 'farm' and len(existing_events) == 0:
            return {"status": "BLOCKED", "decision": "BLOCK_BATCH", "reason": "🛑 Invalid Sequence"}

        status, risk, reason = analyze_sample(sample)
        tx_hash = post_to_stellar({"batch_id": sample.batch_id, "stage": sample.stage})

        entry = {
            "stage": sample.stage,
            "actor": current_actor_name,
            "status": status,
            "risk": risk,
            "reason": reason,
            "tds": sample.tds,
            "color": sample.color,
            "batch_id": sample.batch_id,
            "timestamp": datetime.now().isoformat(),
            "blockchain_hash": tx_hash
        }

        save_event_to_db(sample.batch_id, sample.stage, entry)
        
        status_str, score, wallet = get_actor_status(current_actor_name.strip().lower())
        if status_str == 'BLACKLISTED':
            return {"status": "BLOCKED", "decision": "BLOCK_BATCH", "reason": f"🛑 BLACKLISTED: {current_actor_name}"}

        update_actor_score(current_actor_name, actor_type, 2 if status == 'safe' else -10)

        history = load_batch_from_db(sample.batch_id)
        first_failure = next((e for e in history if e["status"] == "unsafe"), None)
        decision = "BLOCK_BATCH" if first_failure else "APPROVED_FOR_SALE" if sample.stage == "retail" else "ALLOW"

        response = {
            "batch_id": sample.batch_id,
            "current_stage_result": entry,
            "batch_history": history,
            "root_cause": first_failure["stage"] if first_failure else None,
            "decision": decision,
            "blockchain_hash": tx_hash,
            "registered_key": key
        }
        
        global latest_analysis_result
        latest_analysis_result = response
        return response
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}

@app.get("/analytics")
def get_analytics():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT name, score, status, wallet_id FROM actor_reputation WHERE type = "farmer" ORDER BY score DESC LIMIT 3')
    farmers = [{"name": r[0], "score": r[1], "status": r[2], "wallet": r[3]} for r in cursor.fetchall()]

    cursor.execute('SELECT name, score, status, wallet_id FROM actor_reputation WHERE type = "distributor" ORDER BY score DESC LIMIT 3')
    distributors = [{"name": r[0], "score": r[1], "status": r[2], "wallet": r[3]} for r in cursor.fetchall()]
    
    cursor.execute('SELECT name, score, status, wallet_id FROM actor_reputation WHERE type = "retailer" ORDER BY score DESC LIMIT 3')
    retailers = [{"name": r[0], "score": r[1], "status": r[2], "wallet": r[3]} for r in cursor.fetchall()]
    
    cursor.execute('SELECT name, type, score, wallet_id FROM actor_reputation WHERE status = "BLACKLISTED"')
    blacklisted = [{"name": r[0], "type": r[1], "score": r[2], "wallet": r[3]} for r in cursor.fetchall()]

    cursor.execute('SELECT COUNT(DISTINCT batch_id) FROM batch_history')
    total_batches = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(DISTINCT batch_id) FROM batch_history WHERE data LIKE \'%"status": "unsafe"%\'')
    unsafe_count = cursor.fetchone()[0]
    
    cursor.execute('''
        SELECT batch_id, MAX(CASE WHEN data LIKE '%"status": "unsafe"%' THEN 1 ELSE 0 END) as is_unsafe
        FROM batch_history GROUP BY batch_id ORDER BY MAX(timestamp) DESC LIMIT 5
    ''')
    trends = [{"name": f"B-{r[0][-4:]}", "unsafe": r[1]} for r in reversed(cursor.fetchall())]
    
    conn.close()
    return {
        "stats": {"total": total_batches, "unsafe": unsafe_count, "risk_pct": round((unsafe_count/total_batches)*100, 2) if total_batches > 0 else 0, "current_status": "SAFE" if unsafe_count == 0 else "UNSAFE"},
        "farmers": farmers, "distributors": distributors, "retailers": retailers, "blacklisted": blacklisted, "trends": trends
    }

@app.post("/reset")
def reset_system():
    global latest_analysis_result, latest_esp32_data
    latest_analysis_result = None
    latest_esp32_data = {"tds": 0, "color": 0, "connected": latest_esp32_data.get("connected", False)}
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM batch_history')
    conn.commit()
    conn.close()
    seed_demo_data()
    return {"msg": "System reset complete"}

@app.get("/live")
def get_live():
    return {
        "connected": latest_esp32_data.get("connected", False),
        "tds": latest_esp32_data.get("tds", 0),
        "color": latest_esp32_data.get("color", 0),
        "status": latest_esp32_data.get("status", "IDLE"),
        "last_updated": latest_esp32_data.get("last_updated"),
        "analysis": latest_analysis_result
    }

@app.post("/esp32/telemetry")
async def update_esp32(data: dict):
    global latest_esp32_data
    latest_esp32_data = {"connected": True, "tds": data.get("tds", 0), "color": data.get("color", 0), "status": "STREAMING", "last_updated": datetime.now().isoformat()}
    return {"status": "success"}

@app.get("/verify/{batch_id}")
def verify_batch(batch_id: str):
    history = load_batch_from_db(batch_id)
    if not history:
        return {"error": "Batch not found", "status": "NOT_FOUND", "events": []}
    
    # Sort by stage order
    history.sort(key=lambda x: STAGES.index(x["stage"]))
    
    # Identify root cause and decision
    root_cause = None
    verdict = "Batch Fully Verified - No issues detected"
    responsible_actor = None
    product = history[0].get("product", "Food Product") if history else "Unknown"
    
    events_with_rep = []
    for e in history:
        status_str, score, wallet = get_actor_status(e["actor"])
        if e["status"] == "unsafe" and not root_cause:
            root_cause = e["stage"]
            responsible_actor = e["actor"]
            verdict = f"{responsible_actor} is responsible for contamination"
            
        events_with_rep.append({
            "stage": e["stage"],
            "actor": e["actor"],
            "status": e["status"],
            "timestamp": e["timestamp"],
            "event_hash": hashlib.sha256(f"{batch_id}{e['stage']}{e['status']}{e['timestamp']}".encode()).hexdigest(),
            "blockchain_hash": e.get("blockchain_hash"),
            "actor_score": score,
            "actor_status": status_str
        })
            
    decision = "NOT SAFE" if root_cause else "VERIFIED SAFE"

    return {
        "batch_id": batch_id,
        "product": product,
        "events": events_with_rep,
        "root_cause": root_cause,
        "responsible_actor": responsible_actor,
        "verdict": verdict,
        "total_checkpoints": len(history),
        "status": "UNSAFE" if root_cause else "SAFE",
        "decision": decision
    }