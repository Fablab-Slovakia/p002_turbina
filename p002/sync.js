const fs = require('fs');
const path = require('path');

const updatePackage = {
    version: "5.0.1",
    files: {
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
    statorGroup = new THREE.Group(); scene.add(statorGroup);
    cfdGroup = new THREE.Group(); scene.add(cfdGroup);

    // Geometria lopatky (Aerodynamický profil)
    const shape = new THREE.Shape();
    const arcAngle = Math.PI / 6;
    shape.absarc(-1, 0, 1, arcAngle, -arcAngle, true);
    shape.quadraticCurveTo(-0.6, 0, -1 + Math.cos(arcAngle), Math.sin(arcAngle));
    const bladeGeo = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false, curveSegments: 32 });
    bladeGeo.translate(0, 0, -0.5); bladeGeo.rotateX(Math.PI/2);
    const matBlade = new THREE.MeshStandardMaterial({ color: 0x3498db, transparent: true, opacity: 0.6, side: THREE.DoubleSide });

    // Hriadeľ a základné komponenty
    shaftMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4, 16), new THREE.MeshStandardMaterial({color: 0x2c3e50}));
    rotorGroup.add(shaftMesh);

    // Generovanie 6 lopatiek a mechanických ramien
    const linkGeo = new THREE.CylinderGeometry(0.02, 0.02, 1, 8);
    for(let i=0; i<6; i++) {
        let pObj = new THREE.Group(); pObj.rotation.y = -(i * Math.PI / 3);
        let pivot = new THREE.Group(); 
        let bMesh = new THREE.Mesh(bladeGeo, matBlade); 
        bMesh.scale.set(1.2, 1.5, 1.2); 
        pivot.add(bMesh); pivot.position.set(1.2, 0, 0);
        bladeMeshes.push(bMesh); pivotGroups.push(pivot); pObj.add(pivot);

        let armT = new THREE.Mesh(linkGeo, new THREE.MeshStandardMaterial({color: 0x2c3e50}));
        let armB = new THREE.Mesh(linkGeo, new THREE.MeshStandardMaterial({color: 0x2c3e50}));
        armsT.push(armT); armsB.push(armB); pObj.add(armT); pObj.add(armB);
        rotorGroup.add(pObj);
    }

    // CFD Streamlines
    for(let i=0; i<150; i++) {
        let geo = new THREE.BufferGeometry();
        let pos = new Float32Array(TRAIL_LENGTH * 3);
        let startX = (Math.random()-0.5)*18, startY = (Math.random()-0.5)*5, startZ = (Math.random()-0.5)*12;
        for(let j=0; j<TRAIL_LENGTH; j++) { pos[j*3]=startX; pos[j*3+1]=startY; pos[j*3+2]=startZ; }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        let line = new THREE.Line(geo, new THREE.LineBasicMaterial({color: 0x3498db, transparent: true, opacity: 0.4}));
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
initUI(); initScene(); initCharts(); animate();`
    }
};

Object.entries(updatePackage.files).forEach(([fileName, content]) => {
    fs.writeFileSync(path.join(__dirname, fileName), content, 'utf8');
    console.log("✅ Opravené: " + fileName);
});
console.log("\\n🛠️ Hotfix V5.0.1 nasadený. Skontroluj 3D scénu.");