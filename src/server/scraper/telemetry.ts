export const FALLBACK_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-pro"
];

export let lastTelemetry: any = {
  timestamp: null,
  status: "idle",
  error: null,
  jinaCharCount: 0,
  jinaEstimatedCars: 0,
  model: "gemini-3.6-flash",
  totalChunks: 0,
  processedChunks: 0,
  aiExtractedCount: 0,
  finalCarsCount: 0,
  source: "waiting",
  chunks: [],
  routingLogs: []
};
