# RECARD Real-Time Payment Fraud Shield (Chrome & Edge Extension)

The **RECARD Shield Extension** protects users during online checkouts by intercepting and evaluating payment links (Razorpay, Cashfree, UPI VPAs, and crypto gateways) in real time against verified fraud reports and threat intelligence databases.

## Features
- **Checkout Interception**: Automatically detects visits to `*.razorpay.com`, `rzp.io`, `*.cashfree.com`, `*.payu.in`, and generic checkout pages.
- **Threat Database Matching**: Cross-references merchant links, VPAs, and URLs against high-yield Ponzi schemes, task job scams, utility phishing, and stolen merchant IDs.
- **Top Warning Banner**: Injects an immediate high-contrast alert banner when a payment page matches flagged threat reports, explaining the modus operandi and advising the user before entering UPI PINs or card CVVs.
- **Quick Lookup Popup**: Click the extension icon on any page to inspect the counterparty's risk probability score.

## How to Install in Chrome / Brave / Edge
1. Open Chrome and navigate to `chrome://extensions/`.
2. Toggle on **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select the `extension/` folder located inside this repository (`ml proj/extension`).
5. The extension is now active and monitoring payment transactions.
