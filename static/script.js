document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Navigation Logic
    const navItems = document.querySelectorAll('#nav-menu li');
    const views = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            views.forEach(view => view.classList.remove('active-view'));
            
            this.classList.add('active');
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active-view');
        });
    });

    // 2. Chart Setup (Starts normal)
    const chartElement = document.querySelector("#anomalyChart");
    var chart;
    if (chartElement) {
        var options = {
            chart: { type: 'area', height: 280, background: 'transparent', foreColor: '#cbd5e1', toolbar: {show: false}, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
            series: [{ name: 'Anomaly Score', data: [5, 12, 8, 15, 10, 14, 9] }],
            xaxis: { categories: ['14:00', '14:10', '14:20', '14:30', '14:40', '14:50', '15:00'] },
            colors: ['#38bdf8'], // Starts blue
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1 } },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 2 }
        };
        chart = new ApexCharts(chartElement, options);
        chart.render();
    }

    // 3. API Fetch on Button Click
    const simulateBtn = document.getElementById('simulate-btn');
    simulateBtn.addEventListener('click', function() {
        console.log("Button was clicked!"); // Added this line to check if the button is clicked
        // Show loading state
        simulateBtn.innerText = "Analyzing Logs with AI...";
        simulateBtn.disabled = true;

        fetch('/api/simulate')
            .then(response => response.json())
            .then(data => {
                // Update text stats
                document.getElementById('ingested').innerText = data.logs_ingested;
                document.getElementById('score').innerText = data.anomaly_score;
                document.getElementById('alerts').innerText = data.alerts;
                
                // Update UI to look like an alert
                document.getElementById('alerts').classList.add('error-text');
                document.getElementById('alert-card').classList.add('error-card');
                
                const logBox = document.getElementById('log-box');
                logBox.classList.add('critical');
                document.getElementById('latest-log').innerText = data.log;
                document.getElementById('latest-log').classList.add('error-text');

                // Update AI Report
                document.getElementById('root-cause').innerText = data.root_cause;
                document.getElementById('root-cause').style.color = '#f87171';
                document.getElementById('fix').innerHTML = data.fix.replace(/\n/g, '<br>');
                document.getElementById('fix').style.color = '#cbd5e1';

                // Spike the chart and turn it red
                chart.updateSeries([{ data: [5, 12, 8, 15, 10, 14, data.anomaly_score] }]);
                chart.updateOptions({ colors: ['#ef4444'] });

                // Reset button
                simulateBtn.innerText = "🚨 Simulate Crash & Run AI";
                simulateBtn.disabled = false;
            })
            .catch(err => {
                console.error(err);
                simulateBtn.innerText = "Error - Try Again";
                simulateBtn.disabled = false;
            });
    });
});

// --- 4. File Upload Logic ---
    const fileInput = document.getElementById('log-upload');
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Change button text to show loading
        const label = document.querySelector('label[for="log-upload"]');
        const originalText = label.innerHTML;
        label.innerHTML = "⏳ Analyzing...";

        // Send file to Flask
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
            // Update Dashboard (Your existing code)
            document.getElementById('score').innerText = data.anomaly_score;
            document.getElementById('alerts').innerText = data.alerts;
            document.getElementById('latest-log').innerText = data.log;
            document.getElementById('root-cause').innerText = data.root_cause;
            document.getElementById('fix').innerHTML = data.fix.replace(/\n/g, '<br>');
            
            // --- NEW: Update Incidents Tab ---
            document.getElementById('incidents-list').innerHTML = `
                <div class="card" style="border-left: 4px solid #ef4444; margin-bottom: 15px;">
                    <h3 style="color: #ef4444; margin-top: 0;">🚨 Critical Anomaly Detected</h3>
                    <p><strong>Score:</strong> ${data.anomaly_score}%</p>
                    <p style="color: #cbd5e1;"><strong>Culprit Log:</strong> ${data.log}</p>
                </div>
            ` + document.getElementById('incidents-list').innerHTML.replace('No active incidents.', '');

            // --- NEW: Update Reports Tab ---
            document.getElementById('reports-list').innerHTML = `
                <div class="card" style="border-left: 4px solid #38bdf8; margin-bottom: 15px;">
                    <h3 style="color: #38bdf8; margin-top: 0;">AI Analysis Report</h3>
                    <p style="color: #f87171;"><strong>Root Cause:</strong> ${data.root_cause}</p>
                    <p style="color: #cbd5e1;"><strong>Fix:</strong><br>${data.fix.replace(/\n/g, '<br>')}</p>
                </div>
            ` + document.getElementById('reports-list').innerHTML.replace('No reports generated yet.', '');

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
// --- SIDEBAR NAVIGATION LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('#nav-menu li');
    const viewSections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // 1. Remove the blue highlight from all sidebar items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // 2. Add the blue highlight to the one you just clicked
            this.classList.add('active');

            // 3. Hide all the main pages
            viewSections.forEach(view => view.style.display = 'none');

            // 4. Find out which page to show, and display it!
            const targetViewId = this.getAttribute('data-target');
            document.getElementById(targetViewId).style.display = 'block';
        });
    });
});