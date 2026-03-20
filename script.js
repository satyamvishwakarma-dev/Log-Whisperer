document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. Navigation Logic ---
    const navItems = document.querySelectorAll('#nav-menu li');
    const views = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all buttons and hide all views
            navItems.forEach(nav => nav.classList.remove('active'));
            views.forEach(view => view.classList.remove('active-view'));
            
            // Highlight clicked button
            this.classList.add('active');
            
            // Show the matching view
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active-view');
        });
    });

    // --- 2. Chart Logic ---
    const chartElement = document.querySelector("#anomalyChart");
    if (chartElement) {
        var options = {
            chart: { type: 'area', height: 280, background: 'transparent', foreColor: '#cbd5e1', toolbar: {show: false} },
            series: [{ name: 'Anomaly Score', data: [0.1, 0.2, 0.1, 0.5, 0.2, 0.9, 0.1] }],
            xaxis: { categories: ['14:00', '14:10', '14:20', '14:30', '14:40', '14:50', '15:00'] },
            colors: ['#ef4444'],
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1 } },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 2 }
        };
        var chart = new ApexCharts(chartElement, options);
        chart.render();
    }

    // --- 3. Live Data Fetching ---
    function fetchUpdates() {
        fetch('/api/data')
            .then(response => response.json())
            .then(data => {
                // Only update if the elements are currently on the screen
                if(document.getElementById('ingested')) document.getElementById('ingested').innerText = data.logs_ingested;
                if(document.getElementById('score')) document.getElementById('score').innerText = data.anomaly_score;
                if(document.getElementById('alerts')) document.getElementById('alerts').innerText = data.active_alerts;
                if(document.getElementById('latest-log')) document.getElementById('latest-log').innerText = data.latest_log;
                if(document.getElementById('root-cause')) document.getElementById('root-cause').innerText = data.root_cause;
            })
            .catch(err => console.log("API not ready yet."));
    }

    // Update numbers every 3 seconds
    setInterval(fetchUpdates, 3000);
    fetchUpdates();
});