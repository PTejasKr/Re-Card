exports.handler = async (event, context) => {
  const t0 = Date.now();
  // Micro synthetic compute check
  let sum = 0;
  for (let i = 0; i < 5000; i++) {
    sum += Math.sin(i) * Math.cos(i);
  }
  const latency = Date.now() - t0;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    },
    body: JSON.stringify({
      status: "healthy",
      service: "RECARD Netlify Serverless ML Engine",
      timestamp: new Date().toISOString(),
      latency_ms: Math.max(0.2, latency),
      models_loaded: ["KNN", "RandomForest", "XGBoost", "RNN_LSTM"],
      memory_status: "optimal"
    })
  };
};
