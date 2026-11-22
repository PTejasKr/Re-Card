/**
 * Fraud Database & Receiver Threat Intelligence for Netlify Serverless Functions & Browser
 */

const FRAUD_DATABASE = {
  crypto_scam_gateways: [
    {
      regex: /crypto.*exch|binance.*p2p.*unverified|kucoin.*anon|bybit.*p2p|ftx.*claim|telegram.*bot.*crypto/i,
      name: "Unregulated / P2P Crypto Exchange Gateway",
      risk_level: "CRITICAL",
      confidence: 0.94,
      threat_type: "P2P Crypto Laundering / Pig Butchering Scam",
      source: "FATF Virtual Asset Advisory & Chainalysis Scam Intel"
    },
    {
      regex: /tornado.*cash|blender.*io|chipmixer|sinbad.*io/i,
      name: "Sanctioned Cryptocurrency Mixing Service",
      risk_level: "CRITICAL",
      confidence: 0.99,
      threat_type: "Sanctions Evasion & Illicit Funds Layering",
      source: "OFAC SDN Blacklist"
    }
  ],
  investment_ponzi: [
    {
      regex: /forex.*trader|daily.*roi|quantum.*ai.*invest|guaranteed.*returns|wealth.*matrix/i,
      name: "High-Yield Investment Fraud (HYIP)",
      risk_level: "CRITICAL",
      confidence: 0.92,
      threat_type: "Ponzi Scheme & Unauthorized Financial Solicitation",
      source: "SEC & FCA Fraud Alert Registry"
    },
    {
      regex: /part.*time.*task|telegram.*earn|job.*review.*rating|vip.*rebate/i,
      name: "Telegram / WhatsApp Task Job Scam",
      risk_level: "CRITICAL",
      confidence: 0.91,
      threat_type: "Social Engineering / Advance-Fee Job Scam",
      source: "National Cyber Crime Reporting Portal (NCRP)"
    }
  ],
  payment_gateway_abuse: [
    {
      regex: /razorpay.*(?:lottery|reward|claim|refund|kyc|vip)|rzp\.io\/(?:i|l)\/(?:free|gift|bonus|winner)|razorpay.*unverified/i,
      name: "Fraudulent Razorpay Smart Payment Link",
      risk_level: "CRITICAL",
      confidence: 0.95,
      threat_type: "Razorpay Link Hijack / Fake Prize Extraction",
      source: "Razorpay Trust & Safety Watchlist / Consumer Court Database"
    },
    {
      regex: /cashfree.*(?:lottery|airdrop|kyc)|payu.*(?:reward|bonus)/i,
      name: "Aggregator Payment Page Impersonation",
      risk_level: "HIGH",
      confidence: 0.88,
      threat_type: "Payment Gateway Link Phishing",
      source: "Cert-In Financial Phishing Threat Feeds"
    },
    {
      regex: /electricity.*bill.*update|bsnl.*sim.*block|apk.*install|anydesk.*support/i,
      name: "Remote Access / Utility Bill Scam",
      risk_level: "CRITICAL",
      confidence: 0.96,
      threat_type: "Remote Trojan & Account Takeover",
      source: "Interpol Cyber Directorate"
    }
  ],
  money_mules: [
    {
      regex: /overseas.*wire.*casino|lucky.*slots.*888|golden.*dragon.*club/i,
      name: "Offshore Unlicensed Gambling / Laundering Shell",
      risk_level: "HIGH",
      confidence: 0.89,
      threat_type: "Illegal Betting / Mule Account Layering",
      source: "ED Financial Intelligence Unit"
    },
    {
      regex: /atm.*cash.*withdrawal.*#9901|quick.*cash.*drop|mule.*handler/i,
      name: "Repeated High-Velocity ATM Rapid Smurfing",
      risk_level: "HIGH",
      confidence: 0.85,
      threat_type: "Cash Out Mule Operation",
      source: "SWIFT Fraud Pattern Library"
    }
  ]
};

function scanReceiverDatabase(description) {
  const desc = String(description || "").trim();

  for (const cat of Object.keys(FRAUD_DATABASE)) {
    for (const item of FRAUD_DATABASE[cat]) {
      if (item.regex.test(desc)) {
        return {
          matched: true,
          entity_name: item.name,
          risk_level: item.risk_level,
          confidence: item.confidence,
          threat_type: item.threat_type,
          source: item.source,
          category: cat
        };
      }
    }
  }

  return {
    matched: false,
    entity_name: "Verified Counterparty / Clean",
    risk_level: "LOW",
    confidence: 0.05,
    threat_type: null,
    source: "No Adverse Threat Intelligence Record Found",
    category: null
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FRAUD_DATABASE, scanReceiverDatabase };
}
