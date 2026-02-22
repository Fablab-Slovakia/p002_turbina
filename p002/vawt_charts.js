function initCharts() {
    var ctxTel = document.getElementById('canvas-telemetry').getContext('2d');
    chartTelemetry = new Chart(ctxTel, {
        type: 'line',
        data: {
            labels: timeHistory,
            datasets: [
                { label: 'RPM', borderColor: '#e74c3c', data: rpmHistory, yAxisID: 'y', pointRadius: 0 },
                { label: 'Výkon (W)', borderColor: '#f39c12', data: wattsHistory, yAxisID: 'y1', pointRadius: 0 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, animation: false }
    });
}
function updateCharts(rpm, torque, wind, watts) {
    chartUpdateCounter++; if (chartUpdateCounter % 20 !== 0) return;
    timeHistory.push(new Date().toLocaleTimeString());
    rpmHistory.push(rpm); wattsHistory.push(watts);
    if (timeHistory.length > 50) { timeHistory.shift(); rpmHistory.shift(); wattsHistory.shift(); }
    if(chartTelemetry) chartTelemetry.update();
}