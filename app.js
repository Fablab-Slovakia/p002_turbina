/**
 * PROJEKT: Auton\u00F3mna VAWT turb\u00EDna - G4.0
 * S\u00DABOR: app.js
 * POPIS: Hlavn\u00FD modul pre inicializ\u00E1ciu 3D sc\u00E9ny, fyziku a UI.
 */

// 1. INJEKCIA TEXTOV
document.getElementById("ui-title-v40").innerText = "VAWT G4.0: Modul\u00E1rna arch.";
document.getElementById("ui-wind-lbl-v40").innerText = "R\u00FDchlos\u0165 vetra (m/s):";
document.getElementById("ui-time-lbl-v40").innerText = "Spomalenie \u010Dasu:";
document.getElementById("ui-offset-lbl-v40").innerText = "V\u00FD\u0161kov\u00FD offset p\u00E1k (m):";
document.getElementById("ui-mass-lbl-v40").innerText = "Hmota rotora:";
document.getElementById("btn-cfd-v40").innerText = "CFD ZAPNUT\u00C9";
document.getElementById("btn-proj-v40").innerText = "RE\u017EIM: PERSPEKT\u00CDVA";
document.getElementById("btn-cam-top-v40").innerText = "Poh\u013Ead ZHORA";
document.getElementById("btn-cam-side-v40").innerText = "Poh\u013Ead ZBOKU";
document.getElementById("ui-dim-title-v40").innerText = "Kon\u0161truk\u010Dn\u00E9 parametre";
document.getElementById("lbl-rad-v40").innerText = "Polomer r (m):";
document.getElementById("lbl-h-v40").innerText = "V\u00FD\u0161ka h (m):";
document.getElementById("lbl-lev-v40").innerText = "P\u00E1ka (cm):";
document.getElementById("lbl-mass-v40").innerText = "Z\u00E1va\u017Eie (kg):";
document.getElementById("lbl-damp-v40").innerText = "Tlmi\u010D (Hustota):";

// 2. GLOB\u00C1LNE PREMENN\u00C9
let scene, renderer, controls, activeCamera, perspCamera, orthoCamera;
let rotorGroup, statorGroup, cfdGroup;
let isOrthographic = false, isCfd = true;
let currentRPM = 0, currentAngle = 50, timeScale = 1.0;
let bladeMeshes = [], pivotGroups = [], armsT = [], armsB = [], levers = [], pushRods = [];
let topHub, bottomHub, motorMesh, shaftMesh;
let govWeights = [], govArmsT = [], govArmsB = [], topCollar, slidingCollar;
let statorPillars = [], topStruts = [], botStruts = [], mountLegs = [];

let streamlines = [];
const TRAIL_LENGTH = 15;

// 3. POMOCN\u00C9 MATEMATICK\u00C9 FUNKCIE
function distToSegment(px, pz, ax, az, bx, bz) {
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
}

// 4. INICIALIZ\u00C1CIA 3D SC\u00C9NY
function init() {
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

    // CFD Pr\u00FAdnice
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
}

// 5. OVL\u00C1DACIE FUNKCIE UI
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
    btn.innerText = isOrthographic ? "RE\u017EIM: ORTOGRAFICK\u00DD (CAD)" : "RE\u017EIM: PERSPEKT\u00CDVA";
    btn.style.background = isOrthographic ? "#8e44ad" : "#2c3e50";
}

window.toggleCFD = function() {
    isCfd = !isCfd; cfdGroup.visible = isCfd;
    let btn = document.getElementById("btn-cfd-v40");
    btn.innerText = isCfd ? "CFD ZAPNUT\u00C9" : "CFD VYPNUT\u00C9";
    btn.style.backgroundColor = isCfd ? "#3498db" : "#95a5a6";
}

window.setCameraView = function(type) {
    if(type==='top') { activeCamera.position.set(0, 16, 0.1); } 
    else { activeCamera.position.set(0, 0, 16); }
    controls.target.set(0,0,0);
    if(isOrthographic) { toggleProjection(); toggleProjection(); }
    controls.update();
}

// 6. HLAVN\u00C1 ANIMA\u010CN\u00C1 A FYZIK\u00C1LNA SLU\u010CKA
function animate() {
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
    
    let netTorque = aeroTorque - frictionTorque;
    let angularAcc = netTorque / momentOfInertia; 
    
    currentRPM += angularAcc * timeScale * 20; 
    if (currentRPM < 0) currentRPM = 0;

    let angularVel = (currentRPM * 2 * Math.PI) / 60;
    rotorGroup.rotation.y -= angularVel * 0.016 * timeScale;
    
    let govExt = Math.min(1.0, currentRPM / 450);
    currentAngle += (50 * (1 - govExt) - currentAngle) * (0.2 / damp) * timeScale;

    let isClosed = currentAngle < 5;
    let flowStateEl = document.getElementById("ui-flow-state-v40");
    if(isClosed) {
        flowStateEl.innerHTML = "<span style='color:#e74c3c;'>Analytick\u00E9 potenci\u00E1lne obtekanie uzamknut\u00E9ho valca</span>";
    } else {
        flowStateEl.innerHTML = "<span style='color:#27ae60;'>Kol\u00EDzne kr\u00EDdlov\u00E9 v\u00EDrenie s odrazmi pr\u00FAdnic</span>";
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

    renderer.render(scene, activeCamera);
}
init(); animate();