document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. SIDEBAR NAVIGATION LOGIC ---
    const navItems = document.querySelectorAll('#nav-menu li');
    const viewSections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove highlight from all, add to clicked
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Hide all pages, show the target page
            viewSections.forEach(view => view.style.display = 'none');
            const targetViewId = this.getAttribute('data-target');
            document.getElementById(targetViewId).style.display = 'block';
        });
    });

    // --- 2. CHART SETUP ---
    const chartElement = document.querySelector("#anomalyChart");
    var chart;
    if (chartElement) {
        var options = {
            chart: { type: 'area', height: 280, background: 'transparent', foreColor: '#cbd5e1', toolbar: {show: false}, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
            series: [{ name: 'Anomaly Score', data: [5, 12, 8, 15, 10, 14, 9] }],
            xaxis: { categories: ['14:00', '14:10', '14:20', '14:30', '14:40', '14:50', '15:00'] },
            colors: ['#38bdf8'],
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1 } },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 2 }
        };
        chart = new ApexCharts(chartElement, options);
        chart.render();
    }

    // --- 3. SIMULATE BUTTON LOGIC ---
    const simulateBtn = document.getElementById('simulate-btn');
    if (simulateBtn) {
        simulateBtn.addEventListener('click', function() {
            simulateBtn.innerText = "Analyzing Logs with AI...";
            simulateBtn.disabled = true;

            fetch('/api/simulate')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('ingested').innerText = data.logs_ingested;
                    document.getElementById('score').innerText = data.anomaly_score;
                    document.getElementById('alerts').innerText = data.alerts;
                    
                    document.getElementById('alerts').classList.add('error-text');
                    document.getElementById('alert-card').classList.add('error-card');
                    
                    const logBox = document.getElementById('log-box');
                    logBox.classList.add('critical');
                    logBox.innerHTML = `<span class="timestamp">Live</span> <span id="latest-log" class="error-text">${data.log}</span>`;

                    document.getElementById('root-cause').innerText = data.root_cause;
                    document.getElementById('root-cause').style.color = '#f87171'; // <-- ADD THIS LINE
                    
                    document.getElementById('fix').innerHTML = data.fix.replace(/\n/g, '<br>');
                    document.getElementById('fix').style.color = '#f87171';

                    chart.updateSeries([{ data: [5, 12, 8, 15, 10, 14, data.anomaly_score] }]);
                    chart.updateOptions({ colors: ['#ef4444'] });

                    simulateBtn.innerText = "🚨 Simulate Crash & Run AI";
                    simulateBtn.disabled = false;
                })
                .catch(err => {
                    console.error(err);
                    simulateBtn.innerText = "Error - Try Again";
                    simulateBtn.disabled = false;
                });
        });
    }

    // --- 4. REAL FILE UPLOAD & ML LOGIC ---
    const fileInput = document.getElementById('log-upload');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const label = document.querySelector('label[for="log-upload"]');
            const originalText = label.innerHTML;
            label.innerHTML = "⏳ Analyzing...";

            const formData = new FormData();
            formData.append('file', file);

            // Read the file locally to display in the Logs tab
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('raw-logs-display').innerText = event.target.result;
            };
            reader.readAsText(file);

            // Send file to Flask
            fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                
                // Update Top Cards
                document.getElementById('score').innerText = data.anomaly_score;
                document.getElementById('alerts').innerText = data.alerts;
                
                // ==========================================
                // THIS IS THE NEW ML FEED RENDERING CODE
                // ==========================================
                const logBox = document.getElementById('log-box');
                logBox.innerHTML = ''; // Clear the box
                
                // Loop through all the anomalies the ML found
                if (data.anomaly_list) {
                    data.anomaly_list.forEach(logLine => {
                        logBox.innerHTML += `
                            <div style="margin-bottom: 10px; border-bottom: 1px solid #334155; padding-bottom: 5px;">
                                <span style="color: #ef4444; font-weight: bold; font-size: 12px;">[ML DETECTED]</span> 
                                <span style="color: #f87171; font-family: monospace;">${logLine}</span>
                            </div>
                        `;
                    });
                }
                // ==========================================

                // Update AI Crash Report
                document.getElementById('root-cause').innerText = data.root_cause;
                document.getElementById('fix').innerHTML = data.fix.replace(/\n/g, '<br>');
                
                // Update Incidents Tab
                document.getElementById('incidents-list').innerHTML = `
                    <div class="card" style="border-left: 4px solid #ef4444; margin-bottom: 15px;">
                        <h3 style="color: #ef4444; margin-top: 0;">🚨 Critical Anomaly Detected</h3>
                        <p><strong>Score:</strong> ${data.anomaly_score}%</p>
                        <p style="color: #cbd5e1;"><strong>Culprit Log:</strong> ${data.log}</p>
                    </div>
                ` + document.getElementById('incidents-list').innerHTML.replace('No active incidents.', '');

                // Update Reports Tab
                document.getElementById('reports-list').innerHTML = `
                    <div class="card" style="border-left: 4px solid #38bdf8; margin-bottom: 15px;">
                        <h3 style="color: #38bdf8; margin-top: 0;">AI Analysis Report</h3>
                        <p style="color: #f87171;"><strong>Root Cause:</strong> ${data.root_cause}</p>
                        <p style="color: #cbd5e1;"><strong>Fix:</strong><br>${data.fix.replace(/\n/g, '<br>')}</p>
                    </div>
                ` + document.getElementById('reports-list').innerHTML.replace('No reports generated yet.', '');

                // Spike the chart
                chart.updateSeries([{ data: [5, 12, 8, 15, 10, 14, data.anomaly_score] }]);
                chart.updateOptions({ colors: ['#ef4444'] });

                // Reset button
                label.innerHTML = originalText;
                fileInput.value = ''; 
            })
            .catch(err => {
                console.error(err);
                label.innerHTML = "Error!";
                setTimeout(() => label.innerHTML = originalText, 2000);
            });
        });
    }
});