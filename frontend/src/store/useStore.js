import { create } from 'zustand';

// Fixed stage order — must match backend STAGES constant
export const STAGES = ["farm", "processing", "distributor", "retail"];

export const STAGE_LABELS = {
  farm: "Farm",
  processing: "Processing",
  distributor: "Distributor",
  retail: "Retail Store",
};

export const STAGE_ACTORS = {
  farm: "Farm A",
  processing: "Processing Unit",
  distributor: "Distributor Node",
  retail: "Retail Store",
};

// TDS / Color safety thresholds per product (for sensor card limit display)
export const PRODUCT_LIMITS = {
  milk:       { tds: 250, color: 160 },
  water:      { tds: 300, color: 200 },
  juice:      { tds: 300, color: 150 },
  default:    { tds: 300, color: 150 },
};

// Build default supplyChain with all 4 stages as PENDING
const defaultSupplyChain = STAGES.map((s) => ({
  id: s,
  name: STAGE_LABELS[s],
  actor: STAGE_ACTORS[s],
  status: "pending",
  risk: "NONE",
  reason: "",
  tds: 0,
  color: 0,
  isRootCause: false,
}));

const useStore = create((set, get) => ({
  // ── Dashboard Inputs ─────────────────────────────────────────
  hasData: false,
  isAnalyzing: false,
  batchId: "",
  selectedStage: "",
  selectedProduct: "",
  selectedDistributor: "",
  inputTds: "",
  inputColor: "",

  setInputs: (inputs) => set((state) => ({ ...state, ...inputs })),

  // ── Sensor Data ──────────────────────────────────────────────
  sensorData: {
    pH: 7.2,
    turbidity: 2.1,
    tds: 0,
    color: 0,
    status: "IDLE",
    lastUpdated: new Date().toISOString(),
  },

  // ── AI Analysis Results (current stage) ─────────────────────
  // status is always UPPERCASE ("SAFE" / "UNSAFE")
  aiResult: {
    status: "IDLE",
    risk: "NONE",
    reason: "",
    confidence: 0,
  },

  // ── Distributor Info ─────────────────────────────────────────
  distributorInfo: {
    name: "",
    score: 0,
    status: "",
  },

  // ── Batch Tracking State ─────────────────────────────────────
  batchHistory: [],        // array of stage entries from API (sorted farm→retail)
  rootCause: null,         // first unsafe stage name or null
  decision: null,          // "ALLOW" | "STOP_SUPPLY" | "BLOCK_BATCH" | null
  // Reason text belonging to the ROOT CAUSE stage (not the current stage)
  rootCauseReason: "",

  // ── Supply Chain (4 stages, always rendered) ─────────────────
  supplyChain: defaultSupplyChain,

  // ── Blockchain State ─────────────────────────────────────────
  blockchain: {
    isConnected: false,
    batchId: "N/A",
    txHash: "N/A",
    verified: false,
  },

  // ── Alerts ───────────────────────────────────────────────────
  alerts: [],
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),

  // ── Main API Call ─────────────────────────────────────────────
  fetchAiAnalysis: async (inputData) => {
    // Only mark isAnalyzing — do NOT reset hasData (keeps previous pipeline visible)
    set({ isAnalyzing: true });
    try {
      const response = await fetch("http://127.0.0.1:8001/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData),
      });
      const data = await response.json();

      if (data.current_stage_result) {
        // Always uppercase for consistent comparisons
        const rawStatus = data.current_stage_result.status || "safe";
        const aiStatus = rawStatus.toUpperCase(); // "SAFE" | "UNSAFE"

        const rootCause = data.root_cause || null;         // e.g. "distributor" or null
        const decision = data.decision || "ALLOW";
        const batchHistoryRaw = data.batch_history || [];

        // Build lookup map: stage → entry
        const historyMap = {};
        batchHistoryRaw.forEach((entry) => {
          historyMap[entry.stage] = entry;
        });

        const rootCauseIndex = rootCause ? STAGES.indexOf(rootCause) : -1;

        // ── Derive root cause's reason for alert messages ─────────
        const rootCauseEntry = rootCause ? historyMap[rootCause] : null;
        const rootCauseReason = rootCauseEntry
          ? rootCauseEntry.reason
          : data.current_stage_result.reason || "";

        // ── Build 4-stage supplyChain ─────────────────────────────
        // Rules (in priority order):
        //   1. Stage has been submitted AND is the root cause → "unsafe"
        //   2. Stage has been submitted AND is AFTER root cause → "blocked"
        //      (they were submitted but supply is already halted — override to blocked)
        //   3. Stage has been submitted → use its actual status
        //   4. Stage NOT submitted AND is AFTER root cause → "blocked"
        //   5. Stage NOT submitted → "pending"
        const newSupplyChain = STAGES.map((stage, idx) => {
          const entry = historyMap[stage];
          const isRoot = stage === rootCause;
          const isAfter = rootCauseIndex !== -1 && idx > rootCauseIndex && decision !== "ALLOW";

          if (entry) {
            return {
              id: stage,
              name: STAGE_LABELS[stage],
              actor: entry.actor || STAGE_ACTORS[stage],
              // Root cause → "unsafe", stages after root cause → "blocked", otherwise actual
              status: isRoot ? "unsafe" : isAfter ? "blocked" : entry.status,
              risk: entry.risk,
              reason: entry.reason,
              tds: entry.tds,
              color: entry.color,
              isRootCause: isRoot,
            };
          } else {
            return {
              id: stage,
              name: STAGE_LABELS[stage],
              actor: STAGE_ACTORS[stage],
              status: isAfter ? "blocked" : "pending",
              risk: "NONE",
              reason: "",
              tds: 0,
              color: 0,
              isRootCause: false,
            };
          }
        });

        set({
          // Current stage AI result — status always UPPERCASE
          aiResult: {
            status: aiStatus,
            risk: data.current_stage_result.risk || "LOW",
            reason: data.current_stage_result.reason || "",
            confidence: 95,
          },
          distributorInfo: {
            name: inputData.distributor,
            score: data.distributor_score,
            status: data.distributor_status,
          },
          blockchain: {
            isConnected: true,
            batchId: data.batch_id,
            txHash: data.blockchain_hash,
            verified: true,
          },
          batchHistory: batchHistoryRaw,
          rootCause,
          rootCauseReason,
          decision,
          supplyChain: newSupplyChain,
          hasData: true,
          // Store the last submitted stage's product for limit lookups
          sensorData: {
            pH: 7.2,
            turbidity: 2.1,
            tds: inputData.tds,
            color: inputData.color,
            status: aiStatus,
            lastUpdated: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch AI analysis:", error);
    } finally {
      set({ isAnalyzing: false });
    }
  },
}));

export default useStore;
