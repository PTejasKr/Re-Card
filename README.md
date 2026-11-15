# RECARD — Behavioral Fraud Intelligence Website

End-to-end Machine Learning pipeline and web application for bank statement fraud detection based on `mlproj.ipynb`.

## Features
- **Multi-Model ML Engine**: Evaluates financial transactions using K-Nearest Neighbors (KNN), Random Forest, XGBoost Ensembling, and Sequential Behavioral Windowing (LSTM style).
- **Soft Editorial Matte & Crayon Aesthetics**: Inspired by 21st.dev minimalist editorial layouts with paper grain textures and hand-drawn crayon accents.
- **Real-Time Telemetry Visualizer**: Continuous live graphical ping telemetry (using Chart.js) monitoring backend health, latency in milliseconds, and status.
- **Bank Statement Ingestion**: Drag-and-drop support for `.csv` and `.xlsx` bank statements with schema validation and sample generator.

## Project Structure
```
ml proj/
├── backend/
│   └── app.py                  # Python Flask server & RECARD ML engine
├── templates/
│   └── index.html              # Modernistic Soft Editorial UI
├── static/
│   ├── style.css               # Crayon paper grain styling & components
│   └── app.js                  # Real-time ping chart & async file processor
├── sample_statements/
│   └── statement_sample.csv    # Ready-to-test bank statement sample
├── Dockerfile                  # Container deployment specification
├── Procfile                    # Cloud platform entrypoint (Heroku, Render, Railway)
└── requirements.txt            # Python dependencies
```

## Running Locally

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the server:
   ```bash
   python backend/app.py
   ```

3. Open in your browser:
   ```
   http://127.0.0.1:5000
   ```
