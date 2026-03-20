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