/**
 * Netlify Function: /api/check-receiver
 * Real-time receiver intelligence lookup for browser extension and checkout gateways.
 */
const { scanReceiverDatabase } = require('./fraud-database');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      },
      body: ""
    };
  }

  try {
    let query = "";
    let amount = 0;

    if (event.httpMethod === 'POST') {
      let bodyData = {};
      try {
        bodyData = JSON.parse(event.body || "{}");
      } catch (e) {
        bodyData = {};
      }
      query = bodyData.query || bodyData.url || bodyData.merchant || bodyData.vpa || "";
      amount = parseFloat(bodyData.amount || 0);
    } else {
      const q = event.queryStringParameters || {};
      query = q.query || q.url || q.merchant || q.vpa || "";
      amount = parseFloat(q.amount || 0);
    }

    const threatProfile = scanReceiverDatabase(query);
    let baseRisk = threatProfile.matched ? threatProfile.confidence : 0.08;

    if (amount > 1000) {
      baseRisk = Math.min(1.0, baseRisk + 0.20);
    } else if (amount > 500) {
      baseRisk = Math.min(1.0, baseRisk + 0.10);
    }

    const isRisky = baseRisk >= 0.40;
    const verdict = baseRisk >= 0.70 ? "BLOCK / QUARANTINE" : (isRisky ? "STEP-UP 2FA / WARN" : "SAFE TO PROCEED");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      body: JSON.stringify({
        status: "success",
        query,
        amount,
        risk_probability: Math.round(baseRisk * 1000) / 1000,
        verdict,
        is_risky: isRisky,
        threat_intel: threatProfile,
        timestamp: new Date().toISOString()
      })
    };
  } catch (err) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ error: err.message || "Failed to check receiver" })
    };
  }
};
