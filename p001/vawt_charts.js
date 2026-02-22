/**
 * PROJEKT: Auton\u00F3mna VAWT turb\u00EDna - G4.3
 * S\u00DABOR: vawt_charts.js
 * POPIS: Analytick\u00FD modul pre vykres\u013Eovanie grafov (Chart.js).
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
                { label: 'Vietor (m/s)', borderColor: '#3498db', data: windHistory, yAxisID: 'y', tension: 0.2, pointRadius: 0, borderDash: [5, 5] }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: { display: false }, // Skryjeme \u010Dasov\u00FA os pre \u010Distotu
                y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'RPM / R\u00FDchlos\u0165' } },
                y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Moment (Nm)' }, grid: { drawOnChartArea: false } }
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
    // Grafy updatujeme len ka\u017Ed\u00FDch 15 sn\u00EDmok (cca 4x za sekundu), \u0161etr\u00EDme CPU pre 3D a fyziku
    if (chartUpdateCounter % 15 !== 0) return;

    // A. Aktualiz\u00E1cia Telemetrie
    var timeStamp = new Date().toLocaleTimeString();
    timeHistory.push(timeStamp);
    rpmHistory.push(rpm);
    torqueHistory.push(torque);
    windHistory.push(wind);

    // Udr\u017Eiavame len posledn\u00FDch 50 z\u00E1znamov (efekt be\u017Eiaceho p\u00E1su)
    if (timeHistory.length > 50) {
        timeHistory.shift(); rpmHistory.shift(); torqueHistory.shift(); windHistory.shift();
    }
    if(chartTelemetry) chartTelemetry.update();

    // B. Aktualiz\u00E1cia Radarov\u00E9ho profilu (normaliz\u00E1cia hodn\u00F4t na % pod\u013Ea min/max z UI)
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