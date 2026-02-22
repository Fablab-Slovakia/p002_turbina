function toggleAudio() {
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
}