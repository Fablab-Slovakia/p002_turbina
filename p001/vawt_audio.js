/**
 * PROJEKT: Auton\u00F3mna VAWT turb\u00EDna - G4.2
 * S\u00DABOR: vawt_audio.js
 * POPIS: Procedur\u00E1lna synt\u00E9za zvuku (Web Audio API). Generuje \u0161um vetra a oscil\u00E1ciu rotora.
 */

function initAudio() {
    if (audioInitialized) return;
    
    // Modern\u00E9 prehliada\u010De vy\u017Eaduj\u00FA odomknutie audia u\u017E\u00EDvate\u013Esk\u00FDm vstupom
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    
    // 1. Synt\u00E9za zvuku vetra (Biely \u0161um + Lowpass filter)
    var bufferSize = audioCtx.sampleRate * 2; 
    var noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    var output = noiseBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    var noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    windFilter = audioCtx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 400; 
    
    windGain = audioCtx.createGain();
    windGain.gain.value = 0; // \u0160tartuje potichu
    
    noiseSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(audioCtx.destination);
    noiseSource.start();

    // 2. Synt\u00E9za bzukotu lopatiek (Sawtooth oscil\u00E1tor)
    bladeOsc = audioCtx.createOscillator();
    bladeOsc.type = 'sawtooth';
    bladeOsc.frequency.value = 50; 
    
    var bladeFilter = audioCtx.createBiquadFilter();
    bladeFilter.type = 'lowpass';
    bladeFilter.frequency.value = 600;
    
    bladeGain = audioCtx.createGain();
    bladeGain.gain.value = 0; // \u0160tartuje potichu
    
    bladeOsc.connect(bladeFilter);
    bladeFilter.connect(bladeGain);
    bladeGain.connect(audioCtx.destination);
    bladeOsc.start();
    
    audioInitialized = true;
    
    // Zmena UI tla\u010Didla
    var btn = document.getElementById("btn-audio-v42");
    if(btn) {
        btn.innerText = "ZVUK AKT\u00CDVNY";
        btn.style.backgroundColor = "#27ae60";
    }
}

function updateAudio(windSpeed, rpm) {
    if (!audioInitialized || !audioCtx) return;
    
    var time = audioCtx.currentTime;
    
    // A. Akustika vetra (z\u00E1vis\u00ED na m/s)
    var maxWind = 36.0;
    var windNorm = Math.min(windSpeed / maxWind, 1.0);
    // Hlasitos\u0165 vetra
    windGain.gain.setTargetAtTime(windNorm * 0.4, time, 0.1);
    // Frekvencia rezu (pri silnej\u0161om vetre prep\u00FA\u0161\u0165a vy\u0161\u0161ie frekvencie - "svi\u0161\u0165anie")
    windFilter.frequency.setTargetAtTime(300 + (windNorm * 2000), time, 0.1);
    
    // B. Akustika rotora (z\u00E1vis\u00ED na RPM)
    var maxRpm = 600.0;
    var rpmNorm = Math.min(rpm / maxRpm, 1.0);
    if (rpm > 1) {
        bladeGain.gain.setTargetAtTime(rpmNorm * 0.25, time, 0.1);
        bladeOsc.frequency.setTargetAtTime(20 + (rpmNorm * 180), time, 0.1);
    } else {
        bladeGain.gain.setTargetAtTime(0, time, 0.1);
    }
}