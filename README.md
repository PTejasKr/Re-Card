# RECARD — Behavioral Fraud Intelligence & Threat Analytics Platform

End-to-end Machine Learning pipeline, Counterparty Threat Intelligence Database, and Web Application for bank statement fraud detection and real-time payment gateway protection.

## Features
- **Multi-Model ML Engine**: Evaluates financial transactions using K-Nearest Neighbors (KNN), Random Forest (cost-sensitive balanced), XGBoost (`scale_pos_weight` ensembling), and Sequential Behavioral Windowing (LSTM style).
- **Counterparty Fraud Intelligence Database**: Cross-references merchants, recipient VPAs, and URLs against phishing advisories, malicious Razorpay/Cashfree payment links, and P2P crypto laundering registers.
- **Continuous Real-Time Risk Probability ($0\% - 100\%$)**: Moves beyond rigid binary classifications to calculate calibrated risk percentiles with comparative baseline vs. custom model visualization.
- **Interactive Evaluation & Plotted Confusion Matrix**: Live in-browser 2x2 confusion matrix heatmap and precision-recall metric ribbons.
- **Browser Checkout Protection Extension**: Manifest V3 extension in `extension/` that inspects live payment links (Razorpay, Cashfree, crypto gateways) and injects instant warning banners before entering UPI PINs or card details.
- **Terminal CLI Interface**: Standalone terminal CLI in `cli.py` for headless bank statement audits and receiver lookups.

## Project Structure
```
ml proj/
├── cli.py                      # Interactive Terminal CLI tool for auditing & scanning
├── backend/
│   ├── app.py                  # Flask server & RECARD ML engine
│   └── fraud_database.py       # Counterparty Threat Database & regex scanner
├── extension/                  # Chrome / Edge Browser Checkout Shield Extension
│   ├── manifest.json
│   ├── content.js              # Payment page interceptor & warning banner
│   ├── popup.html & popup.js   # Manual receiver risk scanner
│   └── README.md
├── templates/
│   └── index.html              # Modernistic Editorial UI
├── static/
│   ├── style.css               # Styling & visual components
│   └── app.js                  # Real-time ping chart, comparative bar chart & audit engine
├── netlify/
│   └── functions/              # Zero-dependency serverless backend functions
├── sample_statements/
│   └── statement_sample.csv    # Ready-to-test bank statement sample
├── Dockerfile                  # Container deployment specification
├── Procfile                    # Cloud platform entrypoint
└── requirements.txt            # Python dependencies
```

## Running the Terminal CLI File

You can execute the terminal tool directly from the parent folder:

1. **Interactive Menu Mode**:
   ```bash
   python cli.py
   ```

2. **Audit a Statement File via CLI**:
   ```bash
   python cli.py --audit sample_statements/statement_sample.csv
   ```

3. **Check a Counterparty / Razorpay Link via CLI**:
   ```bash
   python cli.py --check "rzp.io/l/winner_prize_claim" --amount 1200
   ```

4. **Launch the Flask Web Server via CLI**:
   ```bash
   python cli.py --server
   ```
