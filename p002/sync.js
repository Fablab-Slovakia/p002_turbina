const fs = require('fs');
const path = require('path');

const updatePackage = {
    version: "5.0.0",
    files: {
        "index.html": `<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VAWT Simulator V5.0</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { margin: 0; padding: 20px; background-color: #ecf0f1; display: flex; justify-content: center; }
        * { box-sizing: border-box; }
    </style>
</head>
<body>

<div id="vawd-dashboard-v40" style="font-family: monospace; border: 1px solid #2c3e50; padding: 15px; max-width: 1300px; background-color: #ffffff; display: flex; flex-wrap: wrap; gap: 15px; width: 100%;">
    
    <div style="flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 10px; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
        <h3 id="ui-title-v40" style="margin: 0; color: #27ae60; border-bottom: 2px solid #27ae60; padding-bottom: 5px;"></h3>
        
        <div style="background: #fff; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
            <label id="ui-wind-lbl-v40" style="font-weight: bold; color: #2980b9;"></label>
            <input type="range" id="wind-v40" min="0" max="36" value="15" step="0.5" style="width: 100%; cursor: pointer;">
            <div style="text-align: right;"><span id="val-wind-v40">15.0</span> m/s</div>
        </div>

        <div style="background: #fff; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
            <label id="ui-time-lbl-v40" style="font-weight: bold; color: #8e44ad;"></label>
            <input type="range" id="time-v40" min="0" max="1" value="0.2" step="0.05" style="width: 100%; cursor: pointer;">
            <div style="text-align: right;"><span id="val-time-v40">0.20</span> x</div>
        </div>

        <div style="background: #fff; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
            <label id="ui-offset-lbl-v40" style="font-weight: bold; color: #e67e22;"></label>
            <input type="range" id="offset-v40" min="-0.8" max="0.8" value="0" step="0.05" style="width: 100%; cursor: pointer;">
            <div style="text-align: right;"><span id="val-offset-v40">0.0</span> m</div>
        </div>

        <div style="background: #fff; padding: 10px; border-radius: 5px; border: 1px solid #ddd; border-left: 4px solid #f39c12;">
            <label id="ui-load-lbl-v44" style="font-weight: bold; color: #f39c12;"></label>
            <input type="range" id="load-v44" min="0.5" max="50" value="5" step="0.5" style="width: 100%; cursor: pointer;">
            <div style="text-align: right;"><span id="val-load-v44">5.0</span> <span id="ohm-sym-v44"></span></div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-top: 10px; font-size: 0.85em; text-align: center; border-top: 1px dashed #ccc; padding-top: 8px;">
                <div><span id="ui-volts-lbl-v44" style="color:#7f8c8d;"></span><br><b id="val-volts-v44">0.0</b></div>
                <div><span id="ui-amps-lbl-v44" style="color:#7f8c8d;"></span><br><b id="val-amps-v44">0.00</b></div>
                <div><span id="ui-watts-lbl-v44" style="font-weight:bold; color:#d35400;"></span><br><b id="val-watts-v44" style="color:#d35400; font-size:1.2em;">0</b></div>
            </div>
        </div>

        <div style="display: flex; gap: 5px;">
            <button id="btn-cfd-v40" onclick="toggleCFD()" style="flex: 1; padding: 10px; background-color: #3498db; color: #fff; border: none; font-weight: bold; cursor: pointer; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></button>
            <button id="btn-proj-v40" onclick="toggleProjection()" style="flex: 1; padding: 10px; cursor: pointer; background: #2c3e50; color: white; border: none; border-radius: 4px; font-weight: bold;"></button>
        </div>

        <button id="btn-audio-v42" onclick="toggleAudio()" style="width: 100%; padding: 10px; background-color: #e74c3c; color: #fff; border: none; font-weight: bold; cursor: pointer; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></button>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #fff; padding: 10px; border-radius: 5px; border: 1px solid #ddd; font-size: 0.85em;">
            <div>RPM: <span id="val-rpm-v40" style="font-weight: bold;">0</span></div>
            <div style="text-align: right;"><span id="ui-mass-lbl-v40"></span> <span id="val-rotor-mass-v40" style="color: #2c3e50; font-weight: bold;">0</span> kg</div>
            <div style="grid-column: 1 / -1; border-top: 1px dashed #ccc; padding-top: 5px; font-weight: bold;" id="ui-flow-state-v40"></div>
        </div>
        
        <div style="display: flex; gap: 5px; margin-top: auto;">
            <button id="btn-cam-top-v40" onclick="setCameraView('top')" style="flex: 1; padding: 8px; cursor: pointer; background: #34495e; color: white; border: none; border-radius: 4px;"></button>
            <button id="btn-cam-side-v40" onclick="setCameraView('side')" style="flex: 1; padding: 8px; cursor: pointer; background: #34495e; color: white; border: none; border-radius: 4px;"></button>
        </div>
    </div>

    <div style="flex: 1; min-width: 280px; display: flex; flex-direction: column; gap: 8px; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
        <h4 id="ui-dim-title-v40" style="margin: 0; border-bottom: 1px solid #ccc; padding-bottom: 5px;"></h4>
        
        <label id="lbl-rad-v40"></label>
        <input type="range" id="rad-v40" min="0.8" max="2.5" value="1.2" step="0.1" style="width: 100%; cursor: pointer;">
        
        <label id="lbl-h-v40"></label>
        <input type="range" id="h-v40" min="1.0" max="3.0" value="1.5" step="0.1" style="width: 100%; cursor: pointer;">
        
        <label id="lbl-lev-v40"></label>
        <input type="range" id="lev-v40" min="10" max="40" value="25" step="1" style="width: 100%; cursor: pointer;">
        
        <label id="lbl-mass-v40"></label>
        <input type="range" id="mass-v40" min="1" max="15" value="8" step="0.5" style="width: 100%; cursor: pointer;">
        
        <label id="lbl-damp-v40"></label>
        <input type="range" id="damp-v40" min="1" max="10" value="5" step="1" style="width: 100%; cursor: pointer;">

        <div style="flex: 1; min-height: 220px; position: relative; margin-top: 15px; background: #fff; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
            <canvas id="canvas-params"></canvas>
        </div>
    </div>

    <div id="canvas-v40" style="flex: 2; min-width: 450px; height: 600px; background: #ffffff; border: 1px solid #bdc3c7; border-radius: 8px; overflow: hidden; position: relative;"></div>

    <div style="width: 100%; height: 250px; position: relative; background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6; box-shadow: inset 0 0 5px rgba(0,0,0,0.05);">
        <canvas id="canvas-telemetry"></canvas>
    </div>

</div>

<script src="vawt_globals.js"></script>
<script src="vawt_math.js"></script>
<script src="vawt_ui.js"></script>
<script src="vawt_audio.js"></script>
<script src="vawt_charts.js"></script>
<script src="vawt_scene.js"></script>
<script src="app.js"></script>

</body>
</html>`,

        "app.js": `function animate() {
    requestAnimationFrame(animate);
    let wind = parseFloat(document.getElementById('wind-v40').value);
    timeScale = parseFloat(document.getElementById('time-v40').value);
    document.getElementById('val-time-v40').innerText = timeScale.toFixed(2);
    let rad = parseFloat(document.getElementById('rad-v40').value);
    let h = parseFloat(document.getElementById('h-v40').value);
    let l_cm = parseFloat(document.getElementById('lev-v40').value)/100;
    let damp = parseFloat(document.getElementById('damp-v40').value);

    let estimatedRotorMass = (rad * h) * 30; 
    let momentOfInertia = estimatedRotorMass * rad * rad; 
    let aeroEfficiency = currentAngle / 50.0; 
    let aeroTorque = (wind * wind) * aeroEfficiency * (rad * h) * 1.5; 
    let frictionTorque = (currentRPM * 0.8) + (currentRPM > 0 ? 5.0 : 0); 
    
    // G4.4: Fyzika Generátora
    let Kv = 15.0; 
    let Kt = 60.0 / (2.0 * Math.PI * Kv); 
    let R_ph = 0.2; 
    
    let R_load = 5.0;
    let loadEl = document.getElementById('load-v44');
    if(loadEl) {
        R_load = parseFloat(loadEl.value);
        document.getElementById('val-load-v44').innerText = R_load.toFixed(1);
    }
    
    let E_emf = currentRPM / Kv;
    let I_gen = E_emf / (R_ph + R_load);
    let P_elec = I_gen * I_gen * R_load;
    let genTorque = Kt * I_gen;

    let voltsEl = document.getElementById('val-volts-v44');
    if(voltsEl) {
        voltsEl.innerText = E_emf.toFixed(1);
        document.getElementById('val-amps-v44').innerText = I_gen.toFixed(2);
        document.getElementById('val-watts-v44').innerText = Math.round(P_elec);
    }

    let netTorque = aeroTorque - frictionTorque - genTorque;
    let angularAcc = netTorque / momentOfInertia; 
    
    currentRPM += angularAcc * timeScale * 20; 
    if (currentRPM < 0) currentRPM = 0;

    let angularVel = (currentRPM * 2 * Math.PI) / 60;
    rotorGroup.rotation.y -= angularVel * 0.016 * timeScale;
    
    let govExt = Math.min(1.0, currentRPM / 450);
    currentAngle += (50 * (1 - govExt) - currentAngle) * (0.2 / damp) * timeScale;

    let isClosed = currentAngle < 5;
    let flowStateEl = document.getElementById("ui-flow-state-v40");
    if(flowStateEl) {
        if(isClosed) {
            flowStateEl.innerHTML = "<span style='color:#e74c3c;'>Analytické potenciálne obtekanie uzamknutého valca</span>";
        } else {
            flowStateEl.innerHTML = "<span style='color:#27ae60;'>Kolízne krídlové vírenie s odrazmi prúdnic</span>";
        }
    }

    let sR = rad + 0.6, hTS = h/2 + 0.5, hBS = -h/2 - 0.5, offset = parseFloat(document.getElementById('offset-v40').value);
    topHub.position.y = hTS; bottomHub.position.y = hBS; motorMesh.position.y = hBS - 0.25;
    for(let i=0; i<3; i++) {
        let a = (i * 120) * Math.PI / 180;
        let pT = new THREE.Vector3(Math.cos(a)*sR, hTS, -Math.sin(a)*sR);
        let pB = new THREE.Vector3(Math.cos(a)*sR, hBS, -Math.sin(a)*sR);
        alignCylinder(statorPillars[i], pB, pT);
        alignCylinder(topStruts[i], topHub.position, pT);
        alignCylinder(botStruts[i], bottomHub.position, pB);
        alignCylinder(mountLegs[i], pB, new THREE.Vector3(Math.cos(a)*(sR+0.5), hBS-1.5, -Math.sin(a)*(sR+0.5)));
    }

    shaftMesh.scale.set(1, h + 1.0, 1);
    topCollar.position.y = offset + 0.6; slidingCollar.position.y = offset - 0.3 + (govExt * 0.6);

    for(let i=0; i<6; i++) {
        let pRad = (currentAngle * Math.PI) / 180;
        pivotGroups[i].rotation.y = -pRad;
        pivotGroups[i].position.set(rad, 0, 0); 
        bladeMeshes[i].scale.set(rad, h, rad);

        alignCylinder(armsT[i], new THREE.Vector3(0, h/2, 0), new THREE.Vector3(rad, h/2, 0));
        alignCylinder(armsB[i], new THREE.Vector3(0, -h/2, 0), new THREE.Vector3(rad, -h/2, 0));
        
        let pPivot = new THREE.Vector3(rad, offset, 0);
        let lA = -pRad + Math.PI - 0.2;
        let pE = new THREE.Vector3(rad + Math.cos(lA)*l_cm, offset, -Math.sin(lA)*l_cm);
        alignCylinder(levers[i], pPivot, pE);
        alignCylinder(pushRods[i], new THREE.Vector3(0, slidingCollar.position.y, 0), pE);
    }

    for(let i=0; i<2; i++) {
        let gR = 0.3 + (govExt * 0.6); let midY = (topCollar.position.y + slidingCollar.position.y) / 2;
        govWeights[i].position.set(gR, midY, 0);
        alignCylinder(govArmsT[i], new THREE.Vector3(0, topCollar.position.y, 0), govWeights[i].position);
        alignCylinder(govArmsB[i], new THREE.Vector3(0, slidingCollar.position.y, 0), govWeights[i].position);
    }

    if(isCfd) {
        let U = wind === 0 ? 0.05 : wind * 0.1;
        let closedR = rad + 0.15, closedR2 = closedR * closedR;
        
        rotorGroup.updateMatrixWorld(true);
        let bladeSegments = [];
        let arcAngle = Math.PI / 6;
        let hX = -1 + Math.cos(arcAngle); let hZ = -Math.sin(arcAngle); 
        let tX = -1 + Math.cos(-arcAngle); let tZ = -Math.sin(-arcAngle); 

        for(let i=0; i<6; i++) {
            let mesh = bladeMeshes[i];
            let headPos = new THREE.Vector3(hX, 0, hZ).applyMatrix4(mesh.matrixWorld);
            let tailPos = new THREE.Vector3(tX, 0, tZ).applyMatrix4(mesh.matrixWorld);
            bladeSegments.push({x1: headPos.x, z1: headPos.z, x2: tailPos.x, z2: tailPos.z});
        }
        
        for(let s of streamlines) {
            let vx = U * s.baseSpeed; let vz = 0;
            let px = s.head.x; let pz = s.head.z;
            let r2 = px*px + pz*pz; let distToCenter = Math.sqrt(r2);
            let hitColor = 0x3498db;

            if (Math.abs(s.head.y) <= h/2) {
                if (isClosed) {
                    if (r2 < closedR2) { px = (px/distToCenter) * closedR; pz = (pz/distToCenter) * closedR; r2 = closedR2; }
                    vx = U * (1 - closedR2 * (px*px - pz*pz) / (r2*r2));
                    vz = U * (- closedR2 * (2*px*pz) / (r2*r2));
                    hitColor = 0xe74c3c;
                } else {
                    for(let b of bladeSegments) {
                        let distToBlade = distToSegment(px, pz, b.x1, b.z1, b.x2, b.z2);
                        if(distToBlade < 0.25) { 
                            let dx = b.x2 - b.x1; let dz = b.z2 - b.z1;
                            let len = Math.sqrt(dx*dx + dz*dz);
                            let nx = -dz/len; let nz = dx/len; 
                            if (nx*(px - b.x1) + nz*(pz - b.z1) < 0) { nx = -nx; nz = -nz; }
                            px += nx * (0.25 - distToBlade); pz += nz * (0.25 - distToBlade);
                            vx += nx * U * 2.5; vz += nz * U * 2.5;
                            hitColor = 0xf1c40f; 
                            break;
                        }
                    }
                    if (distToCenter <= rad && hitColor === 0x3498db) {
                        let angle = Math.atan2(pz, px);
                        let swirl = angularVel * distToCenter * 0.05;
                        vx += Math.sin(angle) * swirl; vz -= Math.cos(angle) * swirl;
                        hitColor = 0xe67e22;
                    }
                }
            }

            s.head.x = px + vx * timeScale; s.head.z = pz + vz * timeScale;
            s.head.y = s.yOffset + Math.sin(s.head.x * 2) * 0.1;

            if (timeScale > 0.001) {
                for(let j = TRAIL_LENGTH - 1; j > 0; j--) {
                    s.positions[j*3] = s.positions[(j-1)*3];
                    s.positions[j*3+1] = s.positions[(j-1)*3+1];
                    s.positions[j*3+2] = s.positions[(j-1)*3+2];
                }
                s.positions[0] = s.head.x; s.positions[1] = s.head.y; s.positions[2] = s.head.z;
                s.mesh.geometry.attributes.position.needsUpdate = true;
                s.mesh.material.color.setHex(hitColor);
            }

            if (s.head.x > 12 || Math.abs(s.head.z) > 10) { resetStreamline(s, -8, s.yOffset, (Math.random()-0.5)*12); }
        }
    }

    document.getElementById('val-wind-v40').innerText = wind.toFixed(1);
    document.getElementById('val-rotor-mass-v40').innerText = Math.round(estimatedRotorMass);
    document.getElementById('val-rpm-v40').innerText = Math.round(currentRPM);

    if (typeof initCharts === "function" && chartUpdateCounter === 0) { initCharts(); }
    if (typeof updateCharts === "function") {
        updateCharts(currentRPM, netTorque, wind, P_elec, rad, h, l_cm, parseFloat(document.getElementById('mass-v40').value), damp);
    }
    if (typeof updateAudio === "function") { updateAudio(wind, currentRPM); }

    renderer.render(scene, activeCamera);
}

// Inicializácia
initUI();
initScene();
animate();`,

        "vawt_audio.js": `function toggleAudio() {
    var btn = document.getElementById("btn-audio-v42");
    
    if (!audioInitialized) {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        
        var bufferSize = audioCtx.sampleRate * 2; 
        var noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var output = noiseBuffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; }
        var noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        
        windFilter = audioCtx.createBiquadFilter();
        windFilter.type = 'lowpass';
        windFilter.frequency.value = 400; 
        
        windGain = audioCtx.createGain();
        windGain.gain.value = 0; 
        
        noiseSource.connect(windFilter);
        windFilter.connect(windGain);
        windGain.connect(audioCtx.destination);
        noiseSource.start();

        bladeOsc = audioCtx.createOscillator();
        bladeOsc.type = 'sawtooth';
        bladeOsc.frequency.value = 50; 
        
        var bladeFilter = audioCtx.createBiquadFilter();
        bladeFilter.type = 'lowpass';
        bladeFilter.frequency.value = 600;
        
        bladeGain = audioCtx.createGain();
        bladeGain.gain.value = 0; 
        
        bladeOsc.connect(bladeFilter);
        bladeFilter.connect(bladeGain);
        bladeGain.connect(audioCtx.destination);
        bladeOsc.start();
        
        audioInitialized = true;
        isAudioPlaying = true;
        
        if(btn) {
            btn.innerText = "ZVUK ZAPNUTÝ";
            btn.style.backgroundColor = "#27ae60"; 
        }
    } else {
        if (isAudioPlaying) {
            audioCtx.suspend();
            isAudioPlaying = false;
            if(btn) {
                btn.innerText = "ZVUK VYPNUTÝ";
                btn.style.backgroundColor = "#e74c3c"; 
            }
        } else {
            audioCtx.resume();
            isAudioPlaying = true;
            if(btn) {
                btn.innerText = "ZVUK ZAPNUTÝ";
                btn.style.backgroundColor = "#27ae60"; 
            }
        }
    }
}

function updateAudio(windSpeed, rpm) {
    if (!audioInitialized || !audioCtx || !isAudioPlaying) return;
    var time = audioCtx.currentTime;
    
    var maxWind = 36.0;
    var windNorm = Math.min(windSpeed / maxWind, 1.0);
    windGain.gain.setTargetAtTime(windNorm * 0.4, time, 0.1);
    windFilter.frequency.setTargetAtTime(300 + (windNorm * 2000), time, 0.1);
    
    var maxRpm = 600.0;
    var rpmNorm = Math.min(rpm / maxRpm, 1.0);
    if (rpm > 1) {
        bladeGain.gain.setTargetAtTime(rpmNorm * 0.25, time, 0.1);
        bladeOsc.frequency.setTargetAtTime(20 + (rpmNorm * 180), time, 0.1);
    } else {
        bladeGain.gain.setTargetAtTime(0, time, 0.1);
    }
}`,

        "vawt_globals.js": `var scene, renderer, controls, activeCamera, perspCamera, orthoCamera;
var rotorGroup, statorGroup, cfdGroup;
var isOrthographic = false, isCfd = true;
var currentRPM = 0, currentAngle = 50, timeScale = 1.0;
var bladeMeshes = [], pivotGroups = [], armsT = [], armsB = [], levers = [], pushRods = [];
var topHub, bottomHub, motorMesh, shaftMesh;
var govWeights = [], govArmsT = [], govArmsB = [], topCollar, slidingCollar;
var statorPillars = [], topStruts = [], botStruts = [], mountLegs = [];
var streamlines = [];
var TRAIL_LENGTH = 15;

var audioCtx, windGain, bladeGain, windFilter, bladeOsc;
var audioInitialized = false;
var isAudioPlaying = false;

var chartTelemetry, chartParams;
var timeHistory = [], rpmHistory = [], torqueHistory = [], windHistory = [], wattsHistory = [];
var chartUpdateCounter = 0;`,

        "vawt_charts.js": `function initCharts() {
    var ctxTel = document.getElementById('canvas-telemetry').getContext('2d');
    chartTelemetry = new Chart(ctxTel, {
        type: 'line',
        data: {
            labels: timeHistory,
            datasets: [
                { label: 'RPM', borderColor: '#e74c3c', data: rpmHistory, yAxisID: 'y', tension: 0.2, pointRadius: 0 },
                { label: 'Moment (Nm)', borderColor: '#27ae60', data: torqueHistory, yAxisID: 'y1', tension: 0.2, pointRadius: 0 },
                { label: 'Vietor (m/s)', borderColor: '#3498db', data: windHistory, yAxisID: 'y2', tension: 0.2, pointRadius: 0, borderDash: [5, 5] },
                { label: 'Výkon (W)', borderColor: '#f39c12', data: wattsHistory, yAxisID: 'y3', tension: 0.2, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: { display: false }, 
                y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'RPM' } },
                y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Moment (Nm)' }, grid: { drawOnChartArea: false } },
                y2: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Vietor (m/s)' }, grid: { drawOnChartArea: false }, min: 0, max: 40 },
                y3: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Výkon (W)' }, grid: { drawOnChartArea: false } }
            },
            plugins: { legend: { position: 'top' } }
        }
    });

    var ctxPar = document.getElementById('canvas-params').getContext('2d');
    chartParams = new Chart(ctxPar, {
        type: 'radar',
        data: {
            labels: ['Polomer', 'Výška', 'Páka', 'Hmota', 'Tlmič'],
            datasets: [{
                label: 'Aktuálna štruktúra',
                data: [0, 0, 0, 0, 0],
                backgroundColor: 'rgba(52, 152, 219, 0.2)', borderColor: '#2980b9', pointBackgroundColor: '#2c3e50'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { r: { min: 0, max: 100, ticks: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });
}

function updateCharts(rpm, torque, wind, watts, rad, h, lev, mass, damp) {
    chartUpdateCounter++;
    if (chartUpdateCounter % 15 !== 0) return;

    var timeStamp = new Date().toLocaleTimeString();
    timeHistory.push(timeStamp);
    rpmHistory.push(rpm);
    torqueHistory.push(torque);
    windHistory.push(wind);
    wattsHistory.push(watts);

    if (timeHistory.length > 50) {
        timeHistory.shift(); rpmHistory.shift(); torqueHistory.shift(); windHistory.shift(); wattsHistory.shift();
    }
    if(chartTelemetry) chartTelemetry.update();

    if(chartParams) {
        chartParams.data.datasets[0].data = [
            ((rad - 0.8) / 1.7) * 100, ((h - 1.0) / 2.0) * 100, 
            ((lev - 0.1) / 0.3) * 100, ((mass - 1) / 14) * 100, ((damp - 1) / 9) * 100
        ];
        chartParams.update();
    }
}`,

        "vawt_math.js": `function distToSegment(px, pz, ax, az, bx, bz) {
    let l2 = (bx - ax)*(bx - ax) + (bz - az)*(bz - az);
    if (l2 === 0) return Math.sqrt((px-ax)*(px-ax) + (pz-az)*(pz-az));
    let t = ((px - ax) * (bx - ax) + (pz - az) * (bz - az)) / l2;
    t = Math.max(0, Math.min(1, t));
    let projX = ax + t * (bx - ax);
    let projZ = az + t * (bz - az);
    return Math.sqrt((px - projX)*(px - projX) + (pz - projZ)*(pz - projZ));
}

function alignCylinder(mesh, p1, p2) {
    let d = p1.distanceTo(p2);
    mesh.scale.set(1, Math.max(d, 0.01), 1);
    mesh.position.copy(p1.clone().lerp(p2, 0.5));
    if(d > 0.001) mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
}

function resetStreamline(s, x, y, z) {
    s.head.set(x, y, z);
    for(let j=0; j<TRAIL_LENGTH; j++) {
        s.positions[j*3] = x; s.positions[j*3+1] = y; s.positions[j*3+2] = z;
    }
}`,

        "vawt_scene.js": `function initScene() {
    const container = document.getElementById('canvas-v40');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    let aspect = container.clientWidth / container.clientHeight;
    perspCamera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    perspCamera.position.set(8, 10, 12);
    
    let frustumSize = 7.0;
    orthoCamera = new THREE.OrthographicCamera(-frustumSize * aspect / 2, frustumSize * aspect / 2, frustumSize / 2, -frustumSize / 2, 0.1, 1000);
    orthoCamera.position.set(8, 10, 12);
    activeCamera = perspCamera;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(activeCamera, renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sun = new THREE.DirectionalLight(0xffffff, 1); sun.position.set(10, 20, 10); scene.add(sun);

    const matStator = new THREE.MeshStandardMaterial({ color: 0x7f8c8d });
    const matRotor = new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.6, roughness: 0.2 });
    const matBlade = new THREE.MeshStandardMaterial({ color: 0x3498db, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
    const matMech = new THREE.MeshStandardMaterial({ color: 0xd35400 });

    statorGroup = new THREE.Group(); scene.add(statorGroup);
    rotorGroup = new THREE.Group(); scene.add(rotorGroup);
    cfdGroup = new THREE.Group(); scene.add(cfdGroup);

    for(let i=0; i<300; i++) {
        let geo = new THREE.BufferGeometry();
        let positions = new Float32Array(TRAIL_LENGTH * 3);
        let startX = (Math.random() - 0.5) * 18, startY = (Math.random() - 0.5) * 5, startZ = (Math.random() - 0.5) * 12;
        for(let j=0; j<TRAIL_LENGTH; j++) { positions[j*3] = startX; positions[j*3+1] = startY; positions[j*3+2] = startZ; }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        let mat = new THREE.LineBasicMaterial({ color: 0x3498db, linewidth: 2, transparent: true, opacity: 0.7 });
        let line = new THREE.Line(geo, mat);
        streamlines.push({ mesh: line, positions: positions, head: new THREE.Vector3(startX, startY, startZ), yOffset: startY, baseSpeed: Math.random() * 0.5 + 0.5 });
        cfdGroup.add(line);
    }

    topHub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.2, 16), matStator); statorGroup.add(topHub);
    bottomHub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 16), matStator); statorGroup.add(bottomHub);
    motorMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.3, 32), new THREE.MeshStandardMaterial({color: 0x34495e})); statorGroup.add(motorMesh);

    const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 1, 8);
    for(let i=0; i<3; i++) {
        statorPillars.push(new THREE.Mesh(strutGeo, matStator)); statorGroup.add(statorPillars[i]);
        topStruts.push(new THREE.Mesh(strutGeo, matStator)); statorGroup.add(topStruts[i]);
        botStruts.push(new THREE.Mesh(strutGeo, matStator)); statorGroup.add(botStruts[i]);
        mountLegs.push(new THREE.Mesh(strutGeo, matStator)); statorGroup.add(mountLegs[i]);
    }

    shaftMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 16), matRotor); rotorGroup.add(shaftMesh);

    const shape = new THREE.Shape();
    const arcAngle = Math.PI / 6; 
    shape.absarc(-1, 0, 1, arcAngle, -arcAngle, true); 
    let headX = -1 + Math.cos(arcAngle); let headY = Math.sin(arcAngle);
    shape.quadraticCurveTo(-0.6, 0, headX, headY); 

    const bladeGeo = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false, curveSegments: 32 });
    bladeGeo.translate(0, 0, -0.5); 
    bladeGeo.rotateX(Math.PI/2); 

    const linkGeo = new THREE.CylinderGeometry(0.015, 0.015, 1, 8);
    for(let i=0; i<6; i++) {
        let pObj = new THREE.Group(); pObj.rotation.y = -(i * Math.PI / 3);
        let pivot = new THREE.Group(); 
        let bMesh = new THREE.Mesh(bladeGeo, matBlade); pivot.add(bMesh);
        bladeMeshes.push(bMesh); pivotGroups.push(pivot); pObj.add(pivot);
        
        armsT.push(new THREE.Mesh(linkGeo, matRotor)); pObj.add(armsT[i]);
        armsB.push(new THREE.Mesh(linkGeo, matRotor)); pObj.add(armsB[i]);
        levers.push(new THREE.Mesh(linkGeo, matMech)); pObj.add(levers[i]);
        pushRods.push(new THREE.Mesh(linkGeo, matMech)); pObj.add(pushRods[i]);
        rotorGroup.add(pObj);
    }

    topCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16), matRotor); rotorGroup.add(topCollar);
    slidingCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16), matMech); rotorGroup.add(slidingCollar);

    for(let i=0; i<2; i++) {
        let gG = new THREE.Group(); gG.rotation.y = i * Math.PI;
        govWeights.push(new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), matMech)); gG.add(govWeights[i]);
        govArmsT.push(new THREE.Mesh(linkGeo, matRotor)); gG.add(govArmsT[i]);
        govArmsB.push(new THREE.Mesh(linkGeo, matRotor)); gG.add(govArmsB[i]);
        rotorGroup.add(gG);
    }

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    const container = document.getElementById('canvas-v40');
    let aspect = container.clientWidth / container.clientHeight;
    perspCamera.aspect = aspect; perspCamera.updateProjectionMatrix();
    let fSize = 7.0;
    orthoCamera.left = -fSize * aspect / 2; orthoCamera.right = fSize * aspect / 2;
    orthoCamera.top = fSize / 2; orthoCamera.bottom = -fSize / 2;
    orthoCamera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}`,

        "vawt_ui.js": `function initUI() {
    document.getElementById("ui-title-v40").innerText = "VAWT V5.0: Autonómny systém";
    document.getElementById("ui-wind-lbl-v40").innerText = "Rýchlosť vetra (m/s):";
    document.getElementById("ui-time-lbl-v40").innerText = "Spomalenie času:";
    document.getElementById("ui-offset-lbl-v40").innerText = "Výškový offset pák (m):";
    
    var loadLbl = document.getElementById("ui-load-lbl-v44");
    if(loadLbl) {
        loadLbl.innerText = "Elektrická záťaž (Odpor):";
        document.getElementById("ohm-sym-v44").innerText = "Ω";
        document.getElementById("ui-volts-lbl-v44").innerText = "Napätie(V)";
        document.getElementById("ui-amps-lbl-v44").innerText = "Prúd(A)";
        document.getElementById("ui-watts-lbl-v44").innerText = "Výkon(W)";
    }

    var btnAudio = document.getElementById("btn-audio-v42");
    if(btnAudio) { btnAudio.innerText = "ZAPNÚŤ ZVUK"; }

    document.getElementById("ui-mass-lbl-v40").innerText = "Hmota rotora:";
    document.getElementById("btn-cfd-v40").innerText = "CFD ZAPNUTÉ";
    document.getElementById("btn-proj-v40").innerText = "REŽIM: PERSPEKTÍVA";
    document.getElementById("btn-cam-top-v40").innerText = "Pohľad ZHORA";
    document.getElementById("btn-cam-side-v40").innerText = "Pohľad ZBOKU";
    document.getElementById("ui-dim-title-v40").innerText = "Konštrukčné parametre";
    document.getElementById("lbl-rad-v40").innerText = "Polomer r (m):";
    document.getElementById("lbl-h-v40").innerText = "Výška h (m):";
    document.getElementById("lbl-lev-v40").innerText = "Páka (cm):";
    document.getElementById("lbl-mass-v40").innerText = "Závažie (kg):";
    document.getElementById("lbl-damp-v40").innerText = "Tlmič (Hustota):";
}

window.toggleProjection = function() {
    isOrthographic = !isOrthographic;
    let oldCam = isOrthographic ? perspCamera : orthoCamera;
    let newCam = isOrthographic ? orthoCamera : perspCamera;
    newCam.position.copy(oldCam.position); newCam.quaternion.copy(oldCam.quaternion);

    if(isOrthographic) {
        const container = document.getElementById('canvas-v40');
        let aspect = container.clientWidth / container.clientHeight;
        let dist = oldCam.position.distanceTo(controls.target);
        let fov = perspCamera.fov * (Math.PI / 180);
        let h = 2 * Math.tan(fov / 2) * dist;
        orthoCamera.left = -h * aspect / 2; orthoCamera.right = h * aspect / 2;
        orthoCamera.top = h / 2; orthoCamera.bottom = -h / 2;
        orthoCamera.updateProjectionMatrix();
    }
    activeCamera = newCam; controls.object = activeCamera; controls.update();
    let btn = document.getElementById("btn-proj-v40");
    btn.innerText = isOrthographic ? "REŽIM: ORTOGRAFICKÝ (CAD)" : "REŽIM: PERSPEKTÍVA";
    btn.style.background = isOrthographic ? "#8e44ad" : "#2c3e50";
}

window.toggleCFD = function() {
    isCfd = !isCfd; cfdGroup.visible = isCfd;
    let btn = document.getElementById("btn-cfd-v40");
    btn.innerText = isCfd ? "CFD ZAPNUTÉ" : "CFD VYPNUTÉ";
    btn.style.backgroundColor = isCfd ? "#3498db" : "#95a5a6";
}

window.setCameraView = function(type) {
    if(type==='top') { activeCamera.position.set(0, 16, 0.1); } 
    else { activeCamera.position.set(0, 0, 16); }
    controls.target.set(0,0,0);
    if(isOrthographic) { toggleProjection(); toggleProjection(); }
    controls.update();
}`
    }
};

Object.entries(updatePackage.files).forEach(([fileName, content]) => {
    fs.writeFileSync(path.join(__dirname, fileName), content, 'utf8');
    console.log("✅ Aktualizované a vyčistené do UTF-8: " + fileName);
});
console.log("\\n🚀 Verzia " + updatePackage.version + " úspešne nasadená. Otestuj scénu.");