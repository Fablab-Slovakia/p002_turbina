function initUI() {
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
}