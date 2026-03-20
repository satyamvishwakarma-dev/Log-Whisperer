// 1. Setup the glowing Area Chart
var options = {
    chart: { type: 'area', height: 280, background: 'transparent', foreColor: '#cbd5e1', toolbar: {show: false} },
    series: [{ name: 'Anomaly Score', data: [0.1, 0.2, 0.1, 0.5, 0.2, 0.9, 0.1] }],
    xaxis: { categories: ['14:00', '14:10', '14:20', '14:30', '14:40', '14:50', '15:00'] },
    colors: ['#ef4444'], // Neon red
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1 } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 }
};
var chart = new ApexCharts(document.querySelector("#anomalyChart"), options);
chart.render();

// 2. Fetch live data from Flask
function fetchUpdates() {
    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            document.getElementById('ingested').innerText = data.logs_ingested;
            document.getElementById('score').innerText = data.anomaly_score;
            document.getElementById('alerts').innerText = data.active_alerts;
            document.getElementById('latest-log').innerText = data.latest_log;
            document.getElementById('root-cause').innerText = data.root_cause;
        });
}

// Update the numbers every 3 seconds
setInterval(fetchUpdates, 3000);
fetchUpdates();