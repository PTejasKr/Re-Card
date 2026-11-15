/* ==========================================================================
   RECARD — Frontend Orchestrator & Real-Time Telemetry Monitor
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const browseBtn = document.getElementById('browse-btn');
  const filePill = document.getElementById('file-pill');
  const fileNameText = document.getElementById('file-name-text');
  const removeFileBtn = document.getElementById('remove-file-btn');
  const analyzeBtn = document.getElementById('analyze-btn');
  const uploadStatus = document.getElementById('upload-status');
  
  // Results Elements
  const resultsSection = document.getElementById('results-section');
  const metricTotal = document.getElementById('metric-total');
  const metricFlagged = document.getElementById('metric-flagged');
  const metricClean = document.getElementById('metric-clean');
  const metricAvgRisk = document.getElementById('metric-avg-risk');
  const tableBody = document.getElementById('table-body');
  const summaryMeta = document.getElementById('summary-meta');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // Telemetry Elements
  const serverStatus = document.getElementById('server-status');
  const liveLatency = document.getElementById('live-latency');
  const liveClock = document.getElementById('live-clock');
  const pulseDot = document.getElementById('pulse-dot');
  const pingCountBadge = document.getElementById('ping-count-badge');

  let selectedFile = null;
  let parsedTransactions = [];
  let currentFilter = 'all';
  let pingCount = 0;

  // -------------------------------------------------------------
  // 1. Graphical Real-Time Ping Visualizer (Chart.js)
  // -------------------------------------------------------------
  const ctx = document.getElementById('pingChart').getContext('2d');
  
  // Editorial crayon color palette
  const maxDataPoints = 25;
  const labels = Array(maxDataPoints).fill('');
  const pingData = Array(maxDataPoints).fill(null);

  const pingChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Latency (ms)',
        data: pingData,
        borderColor: '#c25943', // Terracotta crayon
        backgroundColor: 'rgba(194, 89, 67, 0.08)',
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#c25943',
        pointRadius: 2.5,
        pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 400
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `Latency: ${ctx.parsed.y} ms`
          }
        }
      },
      scales: {
        x: {
          display: false
        },
        y: {
          beginAtZero: true,
          suggestedMax: 20,
          grid: {
            color: 'rgba(218, 211, 196, 0.5)',
            lineWidth: 1
          },
          ticks: {
            font: { family: "'JetBrains Mono', monospace", size: 10 },
            color: '#989f99',
            callback: (val) => `${val}ms`
          }
        }
      }
    }
  });

  // Telemetry Ping Loop
  async function performPing() {
    const tStart = performance.now();
    try {
      const resp = await fetch('/api/ping');
      const data = await resp.json();
      const clientLatency = Math.round(performance.now() - tStart);
      
      pingCount++;
      pulseDot.classList.add('live');
      serverStatus.textContent = 'ONLINE (FLASK + SCIKIT)';
      serverStatus.style.color = '#456f54';
      liveLatency.textContent = clientLatency;
      
      const now = new Date();
      liveClock.textContent = now.toTimeString().split(' ')[0];
      pingCountBadge.textContent = `${pingCount} telemetry pings`;

      // Update Chart
      pingData.push(clientLatency);
      if (pingData.length > maxDataPoints) {
        pingData.shift();
      }
      pingChart.update('none');

    } catch (err) {
      pulseDot.classList.remove('live');
      serverStatus.textContent = 'OFFLINE / DISCONNECTED';
      serverStatus.style.color = '#c25943';
      liveLatency.textContent = 'ERR';
    }
  }

  // Ping immediately and stream every 1.8 seconds
  performPing();
  setInterval(performPing, 1800);

  // -------------------------------------------------------------
  // 2. Drag & Drop File Handling
  // -------------------------------------------------------------
  browseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  dropZone.addEventListener('click', () => {
    if (!selectedFile) fileInput.click();
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      handleFile(fileInput.files[0]);
    }
  });

  function handleFile(file) {
    const name = file.name.toLowerCase();
    if (!name.endsWith('.csv') && !name.endsWith('.xlsx') && !name.endsWith('.xls')) {
      showStatus('Unsupported file format. Please upload .csv or .xlsx bank statements.', 'error');
      return;
    }
    selectedFile = file;
    fileNameText.textContent = file.name;
    filePill.classList.remove('hidden');
    analyzeBtn.disabled = false;
    hideStatus();
  }

  removeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedFile = null;
    fileInput.value = '';
    filePill.classList.add('hidden');
    analyzeBtn.disabled = true;
    hideStatus();
  });

  function showStatus(msg, type = 'loading') {
    uploadStatus.textContent = msg;
    uploadStatus.className = `status-box ${type}`;
    uploadStatus.classList.remove('hidden');
  }

  function hideStatus() {
    uploadStatus.classList.add('hidden');
  }

  // -------------------------------------------------------------
  // 3. Multi-Model Inference Execution
  // -------------------------------------------------------------
  analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    analyzeBtn.disabled = true;
    showStatus('Streaming bank statement to Python RECARD engine (KNN + RF + XGBoost + LSTM)...', 'loading');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const resp = await fetch('/api/analyze-statement', {
        method: 'POST',
        body: formData
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || 'Server error occurred during statement processing.');
      }

      hideStatus();
      renderResults(data);

    } catch (err) {
      showStatus(err.message, 'error');
    } finally {
      analyzeBtn.disabled = false;
    }
  });

  // -------------------------------------------------------------
  // 4. Render Results & Interactive Table
  // -------------------------------------------------------------
  function renderResults(data) {
    const summary = data.summary;
    parsedTransactions = data.transactions;

    metricTotal.textContent = summary.total_transactions;
    metricFlagged.textContent = summary.flagged_suspicious;
    metricClean.textContent = summary.clean_transactions;
    metricAvgRisk.textContent = summary.average_risk_score.toFixed(3);
    summaryMeta.textContent = `Analyzed ${summary.total_transactions} txs across 4 models`;

    resultsSection.classList.remove('hidden');
    renderTable();

    // Smooth scroll down to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderTable() {
    tableBody.innerHTML = '';

    const filtered = parsedTransactions.filter(item => {
      if (currentFilter === 'fraud') return item.is_fraud;
      if (currentFilter === 'clean') return !item.is_fraud;
      return true;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #989f99;">No records found for current filter.</td></tr>`;
      return;
    }

    filtered.forEach(tx => {
      const tr = document.createElement('tr');
      if (tx.is_fraud) tr.classList.add('row-fraud');

      const riskPercent = Math.round(tx.risk_score * 100);
      const riskColor = tx.is_fraud ? 'var(--crayon-terracotta)' : 'var(--crayon-sage)';

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); color: var(--ink-faint);">${tx.id}</td>
        <td style="font-size: 0.82rem; font-family: var(--font-mono);">${tx.date}</td>
        <td>
          <strong>${tx.description}</strong>
          ${tx.suspicious_flag_reason ? `<div style="font-size: 0.72rem; color: var(--crayon-terracotta);">${tx.suspicious_flag_reason}</div>` : ''}
        </td>
        <td style="font-family: var(--font-mono); font-weight: 600;">$${tx.amount.toFixed(2)}</td>
        <td style="font-family: var(--font-mono); color: var(--ink-muted);">${tx.balance !== null ? `$${tx.balance.toFixed(2)}` : '—'}</td>
        <td>
          <div class="model-chips">
            <span class="chip" title="KNN Risk">K: ${tx.model_breakdown.knn}</span>
            <span class="chip" title="Random Forest Risk">RF: ${tx.model_breakdown.random_forest}</span>
            <span class="chip" title="XGBoost Risk">XGB: ${tx.model_breakdown.xgboost}</span>
            <span class="chip" title="LSTM Sequence Risk">SEQ: ${tx.model_breakdown.lstm_sequential}</span>
          </div>
        </td>
        <td>
          <div class="risk-bar-container">
            <div class="risk-bar">
              <div class="risk-bar-fill" style="width: ${riskPercent}%; background-color: ${riskColor};"></div>
            </div>
            <span class="risk-val" style="color: ${riskColor};">${(tx.risk_score).toFixed(2)}</span>
          </div>
        </td>
        <td>
          <span class="badge-status ${tx.is_fraud ? 'fraud' : 'clean'}">
            ${tx.is_fraud ? 'FLAGGED FRAUD' : 'CLEAN'}
          </span>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // Filter Toggles
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTable();
    });
  });

});
