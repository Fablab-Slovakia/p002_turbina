function initScene() {
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
}