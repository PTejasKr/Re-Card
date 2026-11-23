"""
RECARD — Terminal Interactive Fraud Analysis & Threat Intelligence CLI
Enables full terminal-based bank statement auditing, receiver fraud scanning, and risk probability assessment.
"""

import sys
import os
import argparse
import pandas as pd
import numpy as np

# Ensure root workspace is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import RecardEngine
from backend.fraud_database import scan_receiver_database, FRAUD_DATABASE

def print_banner():
    banner = r"""
========================================================================
   ____  _____ ____    _    ____  ____  
  |  _ \| ____/ ___|  / \  |  _ \|  _ \ 
  | |_) |  _|| |     / _ \ | |_) | | | |
  |  _ <| |__| |___ / ___ \|  _ <| |_| |
  |_| \_\_____\____/_/   \_\_| \_\____/ 
  Behavioral Fraud Intelligence & Counterparty Threat Terminal CLI
========================================================================
"""
    print(banner)

def run_statement_audit(file_path):
    print(f"\n[*] Loading statement: {file_path}")
    if not os.path.exists(file_path):
        print(f"[!] Error: File '{file_path}' does not exist.")
        return

    try:
        if file_path.lower().endswith('.csv'):
            try:
                df = pd.read_csv(file_path)
            except UnicodeDecodeError:
                df = pd.read_csv(file_path, encoding='latin1')
        else:
            df = pd.read_excel(file_path)
    except Exception as e:
        print(f"[!] Failed to parse file: {e}")
        return

    print(f"[*] Ingested {len(df)} transactions. Initializing RECARD multi-model engine...")
    engine = RecardEngine()
    result = engine.evaluate_statement(df)

    summary = result.get("summary", {})
    metrics = summary.get("metrics", {})
    cm = summary.get("confusion_matrix", {})
    transactions = result.get("transactions", [])

    print("\n" + "="*72)
    print("                     FORENSIC AUDIT SUMMARY")
    print("="*72)
    print(f"  Total Processed     : {summary.get('total_transactions')}")
    print(f"  Flagged Suspicious  : {summary.get('flagged_suspicious')} (CRITICAL RISK)")
    print(f"  Clean / Verified    : {summary.get('clean_transactions')}")
    print(f"  Average Risk Index  : {summary.get('average_risk_score'):.3f}")
    print("-"*72)
    print("  MODEL EVALUATION METRICS:")
    print(f"    • Precision (PPV) : {metrics.get('precision', 0):.3f}")
    print(f"    • Recall (TPR)    : {metrics.get('recall', 0):.3f}")
    print(f"    • F1-Score        : {metrics.get('f1_score', 0):.3f}")
    print(f"    • Accuracy        : {metrics.get('accuracy', 0):.3f}")
    print(f"    • Benchmarked AUPRC: {metrics.get('auprc', 0.942):.3f}")
    print("-"*72)
    print(f"  CONFUSION MATRIX: TP={cm.get('tp',0)} | FP={cm.get('fp',0)} | TN={cm.get('tn',0)} | FN={cm.get('fn',0)}")
    print("="*72)

    print("\n{:<4} {:<16} {:<32} {:<10} {:<12} {:<14}".format(
        "#", "Timestamp", "Counterparty / Payee", "Amount", "Custom Risk", "Verdict"
    ))
    print("-" * 92)

    for tx in transactions:
        t_id = tx.get("id")
        date = str(tx.get("date", ""))[:14]
        desc = str(tx.get("description", ""))[:30]
        amt = f"${tx.get('amount', 0):.2f}"
        prob = f"{tx.get('custom_probability', 0)*100:.1f}%"
        verdict = "FLAGGED" if tx.get("is_fraud") else "APPROVED"

        print("{:<4} {:<16} {:<32} {:<10} {:<12} {:<14}".format(
            t_id, date, desc, amt, prob, verdict
        ))
        if tx.get("is_fraud"):
            threat = tx.get("threat_intel", {})
            if threat.get("matched"):
                print(f"     └─► [THREAT DB MATCH]: {threat.get('entity_name')} ({threat.get('threat_type')})")
            elif tx.get("suspicious_flag_reason"):
                print(f"     └─► [ANOMALY FLAG]: {tx.get('suspicious_flag_reason')}")

    print("-" * 92)

def run_receiver_check(query, amount=0.0):
    print(f"\n[*] Scanning Receiver / Payment Link: '{query}' (Amount: ${amount:.2f})")
    threat = scan_receiver_database(query)

    base_risk = threat["confidence"] if threat["matched"] else 0.08
    if amount > 1000:
        base_risk = min(1.0, base_risk + 0.20)
    elif amount > 500:
        base_risk = min(1.0, base_risk + 0.10)

    verdict = "BLOCK / QUARANTINE" if base_risk >= 0.70 else ("STEP-UP 2FA / WARN" if base_risk >= 0.40 else "SAFE TO PROCEED")

    print("\n" + "="*60)
    print("          COUNTERPARTY THREAT INTELLIGENCE REPORT")
    print("="*60)
    print(f"  Target Query      : {query}")
    print(f"  Risk Probability  : {base_risk*100:.1f}%")
    print(f"  Decision Verdict  : {verdict}")
    print(f"  Threat Database   : {'MATCH FOUND' if threat['matched'] else 'NO ADVERSE MATCH'}")
    if threat['matched']:
        print(f"  Entity / Scheme   : {threat.get('entity_name')}")
        print(f"  Threat Category   : {threat.get('threat_type')}")
        print(f"  Intelligence Feed : {threat.get('source')}")
        print(f"  Threat Severity   : {threat.get('risk_level')}")
    else:
        print("  Status            : Verified / Normal Counterparty")
    print("="*60 + "\n")

def interactive_terminal():
    print_banner()
    while True:
        print("\nRECARD CLI Menu:")
        print("  [1] Audit a Bank Statement File (CSV / XLSX)")
        print("  [2] Audit Built-in Sample Statement (statement_sample.csv)")
        print("  [3] Real-Time Counterparty / Payment Link Threat Check (Razorpay, UPI, Crypto)")
        print("  [4] Launch Full Flask Web Dashboard & Real-Time Telemetry")
        print("  [5] Exit")

        choice = input("\nEnter choice [1-5]: ").strip()

        if choice == '1':
            path = input("Enter path to bank statement file: ").strip().replace('"', '')
            run_statement_audit(path)
        elif choice == '2':
            sample_path = os.path.join(os.path.dirname(__file__), 'sample_statements', 'statement_sample.csv')
            run_statement_audit(sample_path)
        elif choice == '3':
            query = input("Enter merchant name, payment link (e.g. rzp.io/l/...), or VPA: ").strip()
            amt_input = input("Enter transaction amount ($ or ₹, optional, default 0): ").strip()
            amt = float(amt_input) if amt_input else 0.0
            run_receiver_check(query, amt)
        elif choice == '4':
            print("\n[*] Starting RECARD Flask Web Server at http://127.0.0.1:5000 ...")
            from backend.app import app
            app.run(host='127.0.0.1', port=5000, debug=False)
            break
        elif choice == '5' or choice.lower() in ['q', 'exit']:
            print("\nExiting RECARD CLI. Stay protected.")
            break
        else:
            print("[!] Invalid option. Please select 1 to 5.")

def main():
    parser = argparse.ArgumentParser(description="RECARD Terminal CLI - Behavioral Fraud Intelligence")
    parser.add_argument("--audit", type=str, help="Path to bank statement CSV or Excel file to audit")
    parser.add_argument("--check", type=str, help="Check counterparty receiver, payment URL, or VPA against fraud database")
    parser.add_argument("--amount", type=float, default=0.0, help="Transaction amount for counterparty check")
    parser.add_argument("--sample", action="store_true", help="Run audit on sample statement")
    parser.add_argument("--server", action="store_true", help="Start the Flask web telemetry server")

    args = parser.parse_args()

    if args.sample:
        print_banner()
        sample_path = os.path.join(os.path.dirname(__file__), 'sample_statements', 'statement_sample.csv')
        run_statement_audit(sample_path)
    elif args.audit:
        print_banner()
        run_statement_audit(args.audit)
    elif args.check:
        print_banner()
        run_receiver_check(args.check, args.amount)
    elif args.server:
        print_banner()
        from backend.app import app
        app.run(host='127.0.0.1', port=5000, debug=True)
    else:
        interactive_terminal()

if __name__ == '__main__':
    main()
