const fs = require('fs');
const path = require('path');

const updatePackage = {
    version: "5.0",
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
        <button id="btn-audio-v42" onclick="toggleAudio()" style="width: 100%; padding: 10px; background-color: #e74c3c; color: #fff; border: none; font-weight: bold; cursor: pointer; border-radius: 4px;"></button>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #fff; padding: 10px; border-radius: 5px; border: 1px solid #ddd; font-size: 0.85em;">
            <div>RPM: <span id="val-rpm-v40" style="font-weight: bold;">0</span></div>
            <div style="text-align: right;"><span id="ui-mass-lbl-v40"></span> <span id="val-rotor-mass-v40" style="font-weight: bold;">0</span> kg</div>
            <div style="grid-column: 1 / -1; border-top: 1px dashed #ccc; padding-top: 5px; font-weight: bold;" id="ui-flow-state-v40"></div>
        </div>
    </div>
    <div id="canvas-v40" style="flex: 2; min-width: 450px; height: 600px; background: #ffffff; border: 1px solid #bdc3c7; border-radius: 8px; overflow: hidden; position: relative;"></div>
    <div style="width: 100%; height: 250px; background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
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
var audioInitialized = false, isAudioPlaying = false;
var chartTelemetry, chartParams;
var timeHistory = [], rpmHistory = [], torqueHistory = [], windHistory = [], wattsHistory = [];
var chartUpdateCounter = 0;`,

        "vawt_math.js": `function distToSegment(px, pz, ax, az, bx, bz) {
    let l2 = (bx - ax)*(bx - ax) + (bz - az)*(bz - az);
    if (l2 === 0) return Math.sqrt((px-ax)*(px-ax) + (pz-az)*(pz-az));
    let t = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (pz - az) * (bz - az)) / l2));
    return Math.sqrt((px - (ax + t * (bx - ax)))**2 + (pz - (az + t * (bz - az)))**2);
}
function alignCylinder(mesh, p1, p2) {
    let d = p1.distanceTo(p2);
    mesh.scale.set(1, Math.max(d, 0.01), 1);
    mesh.position.copy(p1.clone().lerp(p2, 0.5));
    if(d > 0.001) mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
}
function resetStreamline(s, x, y, z) {
    s.head.set(x, y, z);
    for(let j=0; j<TRAIL_LENGTH; j++) { s.positions[j*3] = x; s.positions[j*3+1] = y; s.positions[j*3+2] = z; }
}`,

        "vawt_ui.js": `function initUI() {
    document.getElementById("ui-title-v40").innerText = "VAWT V5.0: Autonómny systém";
    document.getElementById("ui-wind-lbl-v40").innerText = "Rýchlosť vetra (m/s):";
    document.getElementById("ui-time-lbl-v40").innerText = "Spomalenie času:";
    var loadLbl = document.getElementById("ui-load-lbl-v44");
    if(loadLbl) {
        loadLbl.innerText = "Elektrická záťaž (Odpor):";
        document.getElementById("ohm-sym-v44").innerText = "Ω";
        document.getElementById("ui-volts-lbl-v44").innerText = "Napätie (V)";
        document.getElementById("ui-amps-lbl-v44").innerText = "Prúd (A)";
        document.getElementById("ui-watts-lbl-v44").innerText = "Výkon (W)";
    }
    document.getElementById("ui-mass-lbl-v40").innerText = "Hmota rotora:";
    if(document.getElementById("btn-audio-v42")) document.getElementById("btn-audio-v42").innerText = "ZAPNÚŤ ZVUK";
}`,

        "vawt_audio.js": `function toggleAudio() {
    var btn = document.getElementById("btn-audio-v42");
    if (!audioInitialized) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        let bufferSize = audioCtx.sampleRate * 2;
        let noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        let output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
        let noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = noiseBuffer; noiseSource.loop = true;
        windFilter = audioCtx.createBiquadFilter(); windFilter.type = 'lowpass';
        windGain = audioCtx.createGain(); windGain.gain.value = 0;
        noiseSource.connect(windFilter); windFilter.connect(windGain); windGain.connect(audioCtx.destination);
        noiseSource.start();
        bladeOsc = audioCtx.createOscillator(); bladeOsc.type = 'sawtooth';
        bladeGain = audioCtx.createGain(); bladeGain.gain.value = 0;
        bladeOsc.connect(bladeGain); bladeGain.connect(audioCtx.destination);
        bladeOsc.start();
        audioInitialized = true; isAudioPlaying = true;
        btn.innerText = "ZVUK ZAPNUTÝ"; btn.style.backgroundColor = "#27ae60";
    } else {
        isAudioPlaying ? audioCtx.suspend() : audioCtx.resume();
        isAudioPlaying = !isAudioPlaying;
        btn.innerText = isAudioPlaying ? "ZVUK ZAPNUTÝ" : "ZVUK VYPNUTÝ";
        btn.style.backgroundColor = isAudioPlaying ? "#27ae60" : "#e74c3c";
    }
}
function updateAudio(windSpeed, rpm) {
    if (!audioInitialized || !isAudioPlaying) return;
    let time = audioCtx.currentTime;
    windGain.gain.setTargetAtTime(Math.min(windSpeed / 36, 1) * 0.4, time, 0.1);
    if (rpm > 1) {
        bladeGain.gain.setTargetAtTime(Math.min(rpm / 600, 1) * 0.2, time, 0.1);
        bladeOsc.frequency.setTargetAtTime(20 + (rpm / 600) * 150, time, 0.1);
    } else bladeGain.gain.setTargetAtTime(0, time, 0.1);
}`,

        "vawt_charts.js": `function initCharts() {
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
}`,

        "vawt_scene.js": `function initScene() {
    const container = document.getElementById('canvas-v40');
    scene = new THREE.Scene(); scene.background = new THREE.Color(0xffffff);
    perspCamera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
    perspCamera.position.set(8, 10, 12); activeCamera = perspCamera;
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    controls = new THREE.OrbitControls(activeCamera, renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sun = new THREE.DirectionalLight(0xffffff, 1); sun.position.set(10, 20, 10); scene.add(sun);
    rotorGroup = new THREE.Group(); scene.add(rotorGroup);
    cfdGroup = new THREE.Group(); scene.add(cfdGroup);
    const shaftGeo = new THREE.CylinderGeometry(0.06, 0.06, 4, 16);
    shaftMesh = new THREE.Mesh(shaftGeo, new THREE.MeshStandardMaterial({color: 0x2c3e50}));
    rotorGroup.add(shaftMesh);
    for(let i=0; i<150; i++) {
        let geo = new THREE.BufferGeometry();
        let pos = new Float32Array(TRAIL_LENGTH * 3);
        let startX = (Math.random()-0.5)*18, startY = (Math.random()-0.5)*5, startZ = (Math.random()-0.5)*12;
        for(let j=0; j<TRAIL_LENGTH; j++) { pos[j*3]=startX; pos[j*3+1]=startY; pos[j*3+2]=startZ; }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        let line = new THREE.Line(geo, new THREE.LineBasicMaterial({color: 0x3498db, transparent: true, opacity: 0.5}));
        streamlines.push({mesh: line, positions: pos, head: new THREE.Vector3(startX, startY, startZ), yOffset: startY, baseSpeed: Math.random()*0.5+0.5});
        cfdGroup.add(line);
    }
}`,

        "app.js": `function animate() {
    requestAnimationFrame(animate);
    let wind = parseFloat(document.getElementById('wind-v40').value);
    timeScale = parseFloat(document.getElementById('time-v40').value);
    let R_load = parseFloat(document.getElementById('load-v44').value);
    let rad = 1.2, h = 1.5;
    let momentOfInertia = (rad * h * 30) * rad * rad;
    let aeroTorque = (wind * wind) * (currentAngle / 50.0) * (rad * h) * 1.5;
    let Kv = 15.0, Kt = 60.0 / (2.0 * Math.PI * Kv);
    let E_emf = currentRPM / Kv;
    let I_gen = E_emf / (0.2 + R_load);
    let P_elec = I_gen * I_gen * R_load;
    let genTorque = Kt * I_gen;
    let netTorque = aeroTorque - (currentRPM * 0.8) - genTorque;
    currentRPM += (netTorque / momentOfInertia) * timeScale * 20;
    if (currentRPM < 0) currentRPM = 0;
    rotorGroup.rotation.y -= (currentRPM * 2 * Math.PI / 60) * 0.016 * timeScale;
    document.getElementById('val-wind-v40').innerText = wind.toFixed(1);
    document.getElementById('val-rpm-v40').innerText = Math.round(currentRPM);
    document.getElementById('val-watts-v44').innerText = Math.round(P_elec);
    updateCharts(currentRPM, netTorque, wind, P_elec);
    updateAudio(wind, currentRPM);
    renderer.render(scene, activeCamera);
}
initUI(); initScene(); initCharts(); animate();`
    }
};

Object.entries(updatePackage.files).forEach(([fileName, content]) => {
    fs.writeFileSync(path.join(__dirname, fileName), content, 'utf8');
    console.log("✅ Aktualizované: " + fileName);
});
console.log("\\n🚀 Verzia " + updatePackage.version + " úspešne nasadená do p002.");