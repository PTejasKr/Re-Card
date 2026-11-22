/**
 * RECARD Content Script: Real-Time Checkout & Payment Link Interceptor
 * Evaluates Razorpay links, checkout pages, and receiver identifiers against known scam databases.
 */

// Local threat rules & phishing signature patterns
const THREAT_RULES = [
  {
    regex: /lottery|winner|prize|free.*gift|bonus|task.*income|vip.*rebate|daily.*roi|telegram.*earn|part.*time.*task/i,
    severity: "CRITICAL",
    category: "Task Scam / Advance Fee Phishing",
    advisory: "Common phishing modus operandi. Scammers lure victims with fake prize claims or task returns."
  },
  {
    regex: /electricity.*bill|bsnl.*sim.*block|update.*kyc|aadhaar.*pan.*link|apk.*download/i,
    severity: "CRITICAL",
    category: "Remote Access / Utility Impersonation",
    advisory: "High incidence of malicious APK downloads and extortion under the guise of pending bills."
  },
  {
    regex: /crypto.*investment|forex.*trading|guaranteed.*double|p2p.*usdt/i,
    severity: "HIGH",
    category: "Unregulated Crypto / Ponzi Gateway",
    advisory: "Entities promising guaranteed financial returns via digital currencies are heavily flagged."
  }
];

function analyzeCurrentPage() {
  const currentUrl = window.location.href;
  const pageText = document.body ? document.body.innerText.slice(0, 5000) : "";
  const title = document.title || "";

  let matchedThreat = null;

  // 1. Check URL patterns (e.g. Razorpay custom smart links)
  if (currentUrl.includes("rzp.io") || currentUrl.includes("razorpay.com")) {
    for (const rule of THREAT_RULES) {
      if (rule.regex.test(currentUrl) || rule.regex.test(pageText) || rule.regex.test(title)) {
        matchedThreat = rule;
        break;
      }
    }

    // Flag generic high-risk keywords on payment link pages
    if (!matchedThreat && /reward|contest|claim|unverified/i.test(currentUrl)) {
      matchedThreat = {
        severity: "HIGH",
        category: "Suspicious Payment Link",
        advisory: "Payment URL contains unverified reward/claim parameter patterns."
      };
    }
  } else {
    // Other checkout pages
    for (const rule of THREAT_RULES) {
      if (rule.regex.test(currentUrl) || rule.regex.test(title)) {
        matchedThreat = rule;
        break;
      }
    }
  }

  if (matchedThreat) {
    injectWarningBanner(matchedThreat);
  }
}

function injectWarningBanner(threat) {
  if (document.getElementById("recard-fraud-shield-banner")) return;

  const banner = document.createElement("div");
  banner.id = "recard-fraud-shield-banner";
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2147483647;
    background: #7F1D1D;
    color: #FFFFFF;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 12px 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid #DC2626;
  `;

  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 14px;">
      <div style="background: #EF4444; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; flex-shrink: 0;">
        ⚠️
      </div>
      <div>
        <div style="font-size: 14px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">
          RECARD Shield: High-Risk Counterparty Detected (${threat.category})
        </div>
        <div style="font-size: 12px; color: #FECACA; margin-top: 2px;">
          ${threat.advisory}
        </div>
      </div>
    </div>
    <div style="display: flex; gap: 10px; align-items: center;">
      <button id="recard-dismiss-btn" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: #fff; padding: 6px 14px; border-radius: 4px; font-size: 12px; cursor: pointer;">
        Dismiss
      </button>
      <button id="recard-details-btn" style="background: #EF4444; border: none; color: #fff; padding: 6px 14px; border-radius: 4px; font-weight: bold; font-size: 12px; cursor: pointer;">
        View Threat Report
      </button>
    </div>
  `;

  document.body.prepend(banner);

  document.getElementById("recard-dismiss-btn").addEventListener("click", () => {
    banner.remove();
  });

  document.getElementById("recard-details-btn").addEventListener("click", () => {
    alert(`RECARD FORENSIC ADVISORY:\n\nThreat Category: ${threat.category}\nSeverity Level: ${threat.severity}\nDetails: ${threat.advisory}\n\nRecommendation: Do not authorize UPI PIN or card OTP until beneficiary credentials are verified independently.`);
  });
}

// Run scanner after DOM load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", analyzeCurrentPage);
} else {
  analyzeCurrentPage();
}
