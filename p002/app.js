function animate() {
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
initUI(); initScene(); initCharts(); animate();