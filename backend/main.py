from fastapi import FastAPI
from pydantic import BaseModel, Field, validator
from stellar_sdk import Server, Keypair, TransactionBuilder, Network, Asset
import hashlib, json
from datetime import datetime

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 🌐 CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔐 SECRET KEY
SECRET_KEY = "SABVQGPVN6QTCWYHU5ZKYBZ2IQIWLTPGZDM6I77USIUHF5T7CT4IQCN4"
source_keypair = Keypair.from_secret(SECRET_KEY)

# 🌐 Stellar Testnet
server = Server("https://horizon-testnet.stellar.org")

# ====================================
# GLOBAL CONSTANTS — fixed stage order
# ====================================
STAGES = ["farm", "processing", "distributor", "retail"]

# Actor labels per stage
STAGE_ACTORS = {
    "farm": "Farm A",
    "processing": "Processing Unit",
    "distributor": "Distributor Node",
    "retail": "Retail Store"
}

# 🏭 DISTRIBUTORS (A–E per product)
distributors = {
    product: {f"Distributor {c}": {"score": 80} for c in ["A", "B", "C", "D", "E"]}
    for product in ["milk", "water", "juice"]
}

# 📦 IN-MEMORY BATCH HISTORY STORE
# Structure: { "MILK-001": [ { stage, status, risk, reason, timestamp, actor } ] }
batch_history: dict[str, list[dict]] = {}


# ====================================
# INPUT MODEL
# ====================================
class Sample(BaseModel):
    batch_id: str = Field(..., min_length=1)
    stage: str
    tds: float = Field(..., gt=0)
    color: float = Field(..., gt=0)
    product: str
    distributor: str

    @validator("stage")
    def validate_stage(cls, v):
        if v.lower() not in STAGES:
            raise ValueError(f"Stage must be one of: {', '.join(STAGES)}")
        return v.lower()

    @validator("product")
    def validate_product(cls, v):
        if v.lower() not in ["milk", "water", "juice"]:
            raise ValueError("Product must be milk, water, or juice")
        return v.lower()

    @validator("distributor")
    def validate_distributor(cls, v):
        # Allow any string for now, specifically for early stages
        return v


# ====================================
# AI LOGIC (unchanged)
# ====================================
def analyze_sample(product, tds, color):
    # 💧 WATER
    if product == "water":
        if tds > 500:
            return {"status": "unsafe", "risk": "HIGH", "reason": "High TDS in water"}
        elif tds > 300:
            return {"status": "unsafe", "risk": "MEDIUM", "reason": "Moderate TDS"}
        else:
            return {"status": "safe", "risk": "LOW", "reason": "Safe drinking water"}

    # 🥛 MILK
    elif product == "milk":
        if tds > 400 or color < 140:
            return {"status": "unsafe", "risk": "HIGH", "reason": "Milk adulteration suspected"}
        elif tds > 250 or color < 160:
            return {"status": "unsafe", "risk": "MEDIUM", "reason": "Possible dilution"}
        else:
            return {"status": "safe", "risk": "LOW", "reason": "Milk is pure"}

    # 🧃 JUICE
    elif product == "juice":
        if color < 100:
            return {"status": "unsafe", "risk": "HIGH", "reason": "Severe color deviation"}
        elif color < 150:
            return {"status": "unsafe", "risk": "MEDIUM", "reason": "Color inconsistency"}
        else:
            return {"status": "safe", "risk": "LOW", "reason": "Juice looks fresh"}

    # 🛡️ FALLBACK
    return {"status": "safe", "risk": "LOW", "reason": "Parameters within acceptable range"}


# ====================================
# DISTRIBUTOR SCORE UPDATE (unchanged)
# ====================================
def update_score(product, distributor, status):
    # Skip score update if distributor is not in the scoring map (e.g. 'Pending')
    if product not in distributors or distributor not in distributors[product]:
        return 0, "N/A"

    score = distributors[product][distributor]["score"]
    if status == "safe":
        score += 5
    else:
        score -= 10

    score = max(0, min(100, score))
    distributors[product][distributor]["score"] = score

    if score < 30:
        label = "BLACKLISTED"
    elif score < 60:
        label = "RISKY"
    else:
        label = "TRUSTED"

    return score, label


# ====================================
# HASH FUNCTION (unchanged)
# ====================================
def generate_hash(data):
    return hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()


# ====================================
# STELLAR STORE (unchanged)
# ====================================
def store_on_stellar(hash_value):
    try:
        account = server.load_account(source_keypair.public_key)

        tx = (
            TransactionBuilder(
                source_account=account,
                network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
                base_fee=100
            )
            .append_payment_op(
                destination=source_keypair.public_key,
                asset=Asset.native(),
                amount="0.00001"
            )
            .add_text_memo(hash_value[:28])
            .build()
        )

        tx.sign(source_keypair)
        response = server.submit_transaction(tx)
        return response["hash"]

    except Exception as e:
        return f"Blockchain Error: {str(e)}"


# ====================================
# ROOT CAUSE DETECTION
# ====================================
def get_root_cause(history: list[dict]) -> str | None:
    """
    Find the FIRST stage (in STAGES order) where status == 'unsafe'.
    Returns the stage name or None if all stages are safe.
    """
    stage_map = {entry["stage"]: entry for entry in history}
    for stage in STAGES:
        if stage in stage_map and stage_map[stage]["status"] == "unsafe":
            return stage
    return None


# ====================================
# DECISION ENGINE
# ====================================
def get_decision(history: list[dict]) -> str:
    """
    Rules (BLOCK_BATCH has highest priority):
      - All safe → ALLOW
      - Unsafe at farm or processing → BLOCK_BATCH
      - Unsafe at distributor or retail → STOP_SUPPLY
    """
    stage_map = {entry["stage"]: entry for entry in history}

    # Check early stages first (highest priority)
    for early_stage in ["farm", "processing"]:
        if early_stage in stage_map and stage_map[early_stage]["status"] == "unsafe":
            return "BLOCK_BATCH"

    # Check later stages
    for late_stage in ["distributor", "retail"]:
        if late_stage in stage_map and stage_map[late_stage]["status"] == "unsafe":
            return "STOP_SUPPLY"

    return "ALLOW"


# ====================================
# SORT HISTORY BY STAGES ORDER
# ====================================
def sort_history(history: list[dict]) -> list[dict]:
    """Sort batch history entries according to fixed STAGES order."""
    stage_index = {s: i for i, s in enumerate(STAGES)}
    return sorted(history, key=lambda x: stage_index.get(x["stage"], 999))


# ====================================
# UPSERT STAGE INTO BATCH
# ====================================
def upsert_stage(batch_id: str, stage_entry: dict):
    """
    Add or replace a stage entry in batch_history.
    Only one entry per stage per batch_id is allowed.
    """
    if batch_id not in batch_history:
        batch_history[batch_id] = []

    # Remove existing entry for this stage if it exists
    batch_history[batch_id] = [
        e for e in batch_history[batch_id]
        if e["stage"] != stage_entry["stage"]
    ]

    # Append the new entry
    batch_history[batch_id].append(stage_entry)

    # Always keep sorted by STAGES order
    batch_history[batch_id] = sort_history(batch_history[batch_id])


# ====================================
# HOME ROUTE
# ====================================
@app.get("/")
def home():
    return {"message": "FoodChain AI Backend Running 🚀 — Phase 1: Batch Tracking Active"}


# ====================================
# GET BATCH HISTORY
# ====================================
@app.get("/batch/{batch_id}")
def get_batch(batch_id: str):
    history = batch_history.get(batch_id, [])
    root_cause = get_root_cause(history)
    decision = get_decision(history)
    return {
        "batch_id": batch_id,
        "batch_history": history,
        "root_cause": root_cause,
        "decision": decision
    }


# ====================================
# MAIN ANALYZE API
# ====================================
@app.post("/analyze")
def analyze(sample: Sample):

    # 🤖 Run AI for current stage
    ai_result = analyze_sample(sample.product, sample.tds, sample.color)

    # 📊 Update distributor score
    score, dist_status = update_score(
        sample.product,
        sample.distributor,
        ai_result["status"]
    )

    # 🏷️ Build stage entry
    stage_entry = {
        "stage": sample.stage,
        "status": ai_result["status"],
        "risk": ai_result["risk"],
        "reason": ai_result["reason"],
        "actor": STAGE_ACTORS.get(sample.stage, sample.stage.capitalize()),
        "product": sample.product,
        "distributor": sample.distributor,
        "tds": sample.tds,
        "color": sample.color,
        "timestamp": datetime.now().isoformat()
    }

    # 📝 Upsert into batch history (replace if same stage submitted again)
    upsert_stage(sample.batch_id, stage_entry)

    # Retrieve full updated history for this batch
    history = batch_history[sample.batch_id]

    # 🔍 Root cause detection
    root_cause = get_root_cause(history)

    # ⚖️ Decision engine
    decision = get_decision(history)

    # 📦 Build hash payload
    hash_payload = {
        "batch_id": sample.batch_id,
        "stage": sample.stage,
        "product": sample.product,
        "distributor": sample.distributor,
        "tds": sample.tds,
        "color": sample.color,
        "ai_result": ai_result,
        "timestamp": stage_entry["timestamp"]
    }

    # 🔐 Hash + Blockchain
    batch_hash = generate_hash(hash_payload)
    tx_hash = store_on_stellar(batch_hash)

    return {
        "batch_id": sample.batch_id,
        "current_stage_result": {
            "stage": sample.stage,
            "status": ai_result["status"],
            "risk": ai_result["risk"],
            "reason": ai_result["reason"],
            "actor": stage_entry["actor"]
        },
        "batch_history": history,
        "root_cause": root_cause,
        "decision": decision,
        "distributor_score": score,
        "distributor_status": dist_status,
        "blockchain_hash": tx_hash,
        "batch_hash": batch_hash
    }