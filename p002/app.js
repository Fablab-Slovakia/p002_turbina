function animate() {
    requestAnimationFrame(animate);
    let wind = parseFloat(document.getElementById('wind-v40').value);
    timeScale = parseFloat(document.getElementById('time-v40').value);
    let R_load = parseFloat(document.getElementById('load-v44').value);
    let rad = 1.2, h = 1.5;

    // Fyzikálny model V5.0.1
    let momentOfInertia = (rad * h * 30) * rad * rad;
    let aeroTorque = (wind * wind) * (currentAngle / 50.0) * (rad * h) * 1.5;
    let E_emf = currentRPM / 15.0;
    let I_gen = E_emf / (0.2 + R_load);
    let P_elec = I_gen * I_gen * R_load;
    let genTorque = (60.0 / (2.0 * Math.PI * 15.0)) * I_gen;

    let netTorque = aeroTorque - (currentRPM * 0.8) - genTorque;
    currentRPM += (netTorque / momentOfInertia) * timeScale * 20;
    if (currentRPM < 0) currentRPM = 0;

    let angularVel = (currentRPM * 2 * Math.PI) / 60;
    rotorGroup.rotation.y -= angularVel * 0.016 * timeScale;

    // Lícovanie ramien k lopatkám
    for(let i=0; i<6; i++) {
        alignCylinder(armsT[i], new THREE.Vector3(0, h/2, 0), new THREE.Vector3(rad, h/2, 0));
        alignCylinder(armsB[i], new THREE.Vector3(0, -h/2, 0), new THREE.Vector3(rad, -h/2, 0));
    }

    // CFD Logika
    if(isCfd) {
        for(let s of streamlines) {
            s.head.x += (wind * 0.1 * s.baseSpeed) * timeScale;
            if (s.head.x > 12) resetStreamline(s, -8, s.yOffset, (Math.random()-0.5)*12);
            for(let j = TRAIL_LENGTH - 1; j > 0; j--) {
                s.positions[j*3] = s.positions[(j-1)*3];
                s.positions[j*3+1] = s.positions[(j-1)*3+1];
                s.positions[j*3+2] = s.positions[(j-1)*3+2];
            }
            s.positions[0] = s.head.x; s.positions[1] = s.head.y; s.positions[2] = s.head.z;
            s.mesh.geometry.attributes.position.needsUpdate = true;
        }
    }

    document.getElementById('val-wind-v40').innerText = wind.toFixed(1);
    document.getElementById('val-rpm-v40').innerText = Math.round(currentRPM);
    document.getElementById('val-watts-v44').innerText = Math.round(P_elec);
    
    updateCharts(currentRPM, netTorque, wind, P_elec);
    updateAudio(wind, currentRPM);
    renderer.render(scene, activeCamera);
}
initUI(); initScene(); initCharts(); animate();