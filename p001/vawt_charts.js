/**
 * PROJEKT: Auton\u00F3mna VAWT turb\u00EDna - G4.3
 * S\u00DABOR: vawt_charts.js
 * POPIS: Analytick\u00FD modul pre vykres\u013Eovanie grafov (Chart.js) - NeZ\u00E1visl\u00E9 mierky.
 */

function initCharts() {
    // 1. Telemetrick\u00FD graf (L\u00EDniov\u00FD)
    var ctxTel = document.getElementById('canvas-telemetry').getContext('2d');
    chartTelemetry = new Chart(ctxTel, {
        type: 'line',
        data: {
            labels: timeHistory,
            datasets: [
                { label: 'RPM', borderColor: '#e74c3c', data: rpmHistory, yAxisID: 'y', tension: 0.2, pointRadius: 0 },
                { label: 'Kr\u00FAtiaci moment (Nm)', borderColor: '#27ae60', data: torqueHistory, yAxisID: 'y1', tension: 0.2, pointRadius: 0 },
                // Vietor teraz be\u017E\u00ED na vlastnej osi 'y2'
                { label: 'Vietor (m/s)', borderColor: '#3498db', data: windHistory, yAxisID: 'y2', tension: 0.2, pointRadius: 0, borderDash: [5, 5] }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: { display: false }, 
                // \u013Dav\u00E1 os pre RPM
                y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'RPM' } },
                // Prav\u00E1 vn\u00FAtorn\u00E1 os pre Moment (Nm)
                y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Moment (Nm)' }, grid: { drawOnChartArea: false } },
                // Prav\u00E1 vonkaj\u0161ia os pre Vietor (m/s) so zafixovanou mierkou
                y2: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Vietor (m/s)' }, grid: { drawOnChartArea: false }, min: 0, max: 40 }
            },
            plugins: { legend: { position: 'top' } }
        }
    });

    // 2. Konfigura\u010Dn\u00FD graf (Radarov\u00FD)
    var ctxPar = document.getElementById('canvas-params').getContext('2d');
    chartParams = new Chart(ctxPar, {
        type: 'radar',
        data: {
            labels: ['Polomer', 'V\u00FD\u0161ka', 'P\u00E1ka', 'Hmota', 'Tlmi\u010D'],
            datasets: [{
                label: 'Aktu\u00E1lna \u0161trukt\u00FAra',
                data: [0, 0, 0, 0, 0],
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: '#2980b9',
                pointBackgroundColor: '#2c3e50'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { r: { min: 0, max: 100, ticks: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });
}

function updateCharts(rpm, torque, wind, rad, h, lev, mass, damp) {
    chartUpdateCounter++;
    // Aktualiz\u00E1cia grafov ka\u017Ed\u00FDch 15 frameov pre zachovanie 3D v\u00FDkonu
    if (chartUpdateCounter % 15 !== 0) return;

    var timeStamp = new Date().toLocaleTimeString();
    timeHistory.push(timeStamp);
    rpmHistory.push(rpm);
    torqueHistory.push(torque);
    windHistory.push(wind);

    if (timeHistory.length > 50) {
        timeHistory.shift(); rpmHistory.shift(); torqueHistory.shift(); windHistory.shift();
    }
    if(chartTelemetry) chartTelemetry.update();

    if(chartParams) {
        var nRad = ((rad - 0.8) / (2.5 - 0.8)) * 100;
        var nH = ((h - 1.0) / (3.0 - 1.0)) * 100;
        var nLev = ((lev - 0.1) / (0.4 - 0.1)) * 100;
        var nMass = ((mass - 1) / (15 - 1)) * 100;
        var nDamp = ((damp - 1) / (10 - 1)) * 100;
        
        chartParams.data.datasets[0].data = [nRad, nH, nLev, nMass, nDamp];
        chartParams.update();
    }
}