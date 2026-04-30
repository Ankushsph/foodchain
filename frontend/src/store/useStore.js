import { create } from 'zustand';
import toast from 'react-hot-toast';

// Fixed stage order — must match backend STAGES constant
export const STAGES = ["farm", "distributor", "retail"];

export const STAGE_LABELS = {
  farm: "Farm",
  distributor: "Distributor",
  retail: "Retail Store",
};

export const STAGE_ACTORS = {
  farm: "Agricultural Source",
  distributor: "Logistics Node",
  retail: "Retail Center",
};

// TDS / Color safety thresholds per product (for sensor card limit display)
export const PRODUCT_LIMITS = {
  milk: { tds: 250, color: 160 },
  water: { tds: 300, color: 200 },
  juice: { tds: 300, color: 150 },
  default: { tds: 300, color: 150 },
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

  distributorInfo: {
    name: "",
    score: 0,
    status: "",
  },
  retailerInfo: {
    name: "",
    status: "",
  },

  // ── Batch Tracking State ─────────────────────────────────────
  batchHistory: [],        // array of stage entries from API (sorted farm→retail)
  rootCause: null,         // first unsafe stage name or null
  decision: null,          // "ALLOW" | "STOP_SUPPLY" | "BLOCK_BATCH" | null
  // Reason text belonging to the ROOT CAUSE stage (not the current stage)
  rootCauseReason: "",

  isAnalyticsLoading: true,
  analytics: {
    stats: { total: 0, unsafe: 0, risk_pct: 0, current_status: 'SAFE' },
    farmers: [],
    distributors: [],
    retailers: [],
    blacklisted: [],
    trends: []
  },

  // ── Supply Chain (4 stages, always rendered) ─────────────────
  supplyChain: defaultSupplyChain,

  // ── Blockchain State ─────────────────────────────────────────
  blockchain: {
    isConnected: false,
    batchId: "N/A",
    txHash: "N/A",
    event: null,
    verified: false,
  },

  // ── Alerts ───────────────────────────────────────────────────
  alerts: [],
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),

  // ── ESP32 Live Feed ──────────────────────────────────────────
  esp32Live: {
    connected: false,
    tds: 0,
    color: 0,
    status: "IDLE",
    time: null,
  },
  _pollInterval: null,

  startEsp32Polling: () => {
    // Clear any existing interval
    const existing = useStore.getState()._pollInterval;
    if (existing) clearInterval(existing);

    const poll = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8008/live");
        const json = await res.json();

        if (json.connected) {
          set({
            esp32Live: {
              connected: true,
              tds: json.tds,
              color: json.color,
              status: json.status,
              time: json.last_updated,
            }
          });
        }

        // 🔥 AUTOMATIC PIPELINE SYNC
        if (json.analysis && json.analysis.batch_id) {
          const fullBatch = json.analysis;
          const batchHistoryRaw = fullBatch.batch_history;
          const rootCause = fullBatch.root_cause;
          const decision = fullBatch.decision;

          const historyMap = {};
          batchHistoryRaw.forEach((entry) => {
            if (entry && entry.stage) historyMap[entry.stage] = entry;
          });

          const rootCauseIndex = rootCause ? STAGES.indexOf(rootCause) : -1;

          const newSupplyChain = STAGES.map((stage, idx) => {
            const entry = historyMap[stage];
            const isRoot = stage === rootCause;
            const isAfter = rootCauseIndex !== -1 && idx > rootCauseIndex && decision !== "ALLOW";

            if (entry) {
              return {
                id: stage,
                name: STAGE_LABELS[stage],
                actor: entry.actor || STAGE_ACTORS[stage],
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
            supplyChain: newSupplyChain,
            batchHistory: batchHistoryRaw,
            rootCause,
            decision,
            batchId: fullBatch.batch_id,
            hasData: true,
            blockchain: {
              ...get().blockchain,
              txHash: fullBatch.blockchain_hash || "N/A",
              batchId: fullBatch.batch_id,
            }
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
        set((s) => ({ esp32Live: { ...s.esp32Live, connected: false } }));
      }
    };

    poll(); // immediate first call
    const id = setInterval(poll, 3000); // poll every 3s
    set({ _pollInterval: id });
  },

  // ── Main API Call ─────────────────────────────────────────────
  fetchAiAnalysis: async (inputData) => {
    // Only mark isAnalyzing — do NOT reset hasData (keeps previous pipeline visible)
    set({ isAnalyzing: true });
    try {
      const response = await fetch("http://127.0.0.1:8008/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail?.[0]?.msg || errorData.message || "Backend Analysis Failed");
      }

      const data = await response.json();

      if (data && data.status === 'BLOCKED') {
        toast.error(data.reason || "Submission blocked");
        set({ isAnalyzing: false });
        return data;
      }

      if (data && data.current_stage_result) {

        const rawStatus = data.current_stage_result.status || "safe";
        const aiStatus = rawStatus.toUpperCase();

        const rootCause = data.root_cause || null;
        const decision = data.decision || "ALLOW";
        const batchHistoryRaw = data.batch_history || [];

        const historyMap = {};
        batchHistoryRaw.forEach((entry) => {
          if (entry && entry.stage) historyMap[entry.stage] = entry;
        });

        const rootCauseIndex = rootCause ? STAGES.indexOf(rootCause) : -1;
        const rootCauseEntry = rootCause ? historyMap[rootCause] : null;

        let alertMsg = "Batch cleared for next stage";
        if (decision === "BLOCK_BATCH") alertMsg = "Batch blocked due to contamination at early stage";
        else if (decision === "STOP_SUPPLY") alertMsg = `Supply halted at ${rootCause?.toUpperCase()} stage`;
        else if (decision === "REJECT_AT_RETAIL") alertMsg = "Batch rejected at retail gate";
        else if (decision === "APPROVED_FOR_SALE") alertMsg = "Batch fully verified for distribution";
        else if (decision === "ALLOW_WITH_WARNING") alertMsg = "⚠️ Safe batch from low-reputation supplier";

        const rootCauseReason = rootCauseEntry ? rootCauseEntry.reason : alertMsg;

        if (data.recall_triggered) {
          toast.error(`🚨 RECALL: ${data.recall_batches.length} related batches identified`, { duration: 6000 });
        }

        const newSupplyChain = STAGES.map((stage, idx) => {
          const entry = historyMap[stage];
          const isRoot = stage === rootCause;
          const isAfter = rootCauseIndex !== -1 && idx > rootCauseIndex && decision !== "ALLOW";

          if (entry) {
            return {
              id: stage,
              name: STAGE_LABELS[stage],
              actor: (stage === 'distributor' ? entry.distributor : stage === 'retail' ? entry.retailer : null) || entry.actor || STAGE_ACTORS[stage],
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
          aiResult: {
            status: aiStatus,
            risk: data.current_stage_result.risk || "LOW",
            reason: data.current_stage_result.reason || "",
            confidence: data.current_stage_result.confidence || 95,
          },
          distributorInfo: {
            name: historyMap['distributor']?.distributor || historyMap['distributor']?.actor || "",
            score: data.distributor_score || 0,
            status: historyMap['distributor']?.status || "",
          },
          retailerInfo: {
            name: historyMap['retail']?.retailer || historyMap['retail']?.actor || "",
            status: historyMap['retail']?.status || "",
          },
          blockchain: {
            isConnected: true,
            batchId: data.batch_id || "N/A",
            txHash: data.blockchain?.txHash || data.blockchain_hash || "N/A",
            event: data.blockchain?.event || null,
            verified: true,
          },
          batchHistory: batchHistoryRaw,
          rootCause,
          rootCauseReason,
          decision,
          supplyChain: newSupplyChain,
          hasData: true,
          sensorData: {
            pH: 7.2,
            turbidity: 2.1,
            tds: inputData.tds,
            color: inputData.color,
            status: aiStatus,
            lastUpdated: new Date().toISOString(),
          },
        });
        toast.success(`${STAGE_LABELS[data.current_stage_result.stage] || 'Stage'} Analyzed`);
        return data;
      } else {
        throw new Error("Invalid response format from AI backend");
      }
    } catch (error) {
      console.error("Failed to fetch AI analysis:", error);
      toast.error(error.message || "Failed to analyze batch");
    } finally {
      set({ isAnalyzing: false });
    }
  },

  // ⛓️ Dispute Verification Action
  verifyBatch: async (batchId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8008/verify/${batchId}`);
      if (!response.ok) throw new Error("Verification failed");
      const data = await response.json();

      if (data.events) {
        // Update global state so Live Network Events and other components see this batch
        set({
          batchHistory: data.events,
          batchId: data.batch_id,
          hasData: true,
          decision: data.status === 'UNSAFE' ? 'BLOCK_BATCH' : 'APPROVED_FOR_SALE',
          rootCause: data.root_cause
        });
      }

      return data;
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error("Batch verification failed");
      return null;
    }
  },

  fetchAnalytics: async () => {
    set({ isAnalyticsLoading: true });
    try {
      const response = await fetch('http://127.0.0.1:8008/analytics');
      const data = await response.json();
      set({ analytics: data, isAnalyticsLoading: false });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      set({ isAnalyticsLoading: false });
    }
  },
}));

export default useStore;
