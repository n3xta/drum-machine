let bpm = 240;
let timeSignature = [4, 4];
let nMeasures = 2;
function nSteps() {
  return nMeasures * timeSignature[0];
}
let currentStep;

let cells = [];


Tone.Transport.bpm.value = bpm;
Tone.Transport.timeSignature = timeSignature[0];

function reinitializeGrid() {
  cells = [];
  cellWidth = width / nSteps();
  for (let track = 0; track < nTracks; track++) {
    cells[track] = [];
    for (let step = 0; step < nSteps(); step++) {
      cells[track][step] = 0;
    }
  }
}

// Sound: Drum Kit
let kit;
let drumNames = [
  "ui_click",
  "ui_swipe",
  "187_percussion",
  // "glitch_hoito",
  // "glitch_kumman"
  "glitch_paha",
  "glitch_saitko",
  // "glitch_tuonne",
  "hat_lupaan",
  "hat_oitte",
  "hat_potku",
  "kick_katoa",
  "kick_kiinni",
  "percussion_asia",
  "tuntuu",
];
let nTracks = drumNames.length;

kit = new Tone.Players({
  "ui_click": "assets/ui_click.wav",
  "ui_swipe": "assets/ui_swipe.wav",
  "187_percussion": "assets/187_percussion.wav",
  // "glitch_hoito": "/assets/glitch_hoito.wav",
  // "glitch_kumman": "/assets/glitch_kumman.wav",
  "glitch_paha": "assets/glitch_paha.wav",
  "glitch_saitko": "assets/glitch_saitko.wav",
  // "glitch_tuonne": "/assets/glitch_tuonne.wav",
  "hat_lupaan": "assets/hat_lupaan.wav",
  "hat_oitte": "assets/hat_oitte.wav",
  "hat_potku": "assets/hat_potku.wav",
  "kick_katoa": "assets/kick_katoa.wav",
  "kick_kiinni": "assets/kick_kiinni.wav",
  "percussion_asia": "assets/percussion_asia.wav",
  "tuntuu": "assets/tuntuu.wav"
});
kit.toDestination();
Tone.Transport.scheduleRepeat(onBeat, "4n");

function onBeat(time) {
  let pos = Tone.Transport.position.split(":");
  let measure = int(pos[0]);
  let beat = int(pos[1]);

  let beatsPerMeasure = timeSignature[0];
  currentStep = (measure * beatsPerMeasure + beat) % nSteps();
  
  for (let track = 0; track < nTracks; track++) {
    if (cells[track][currentStep]) {
      let player = kit.player(drumNames[track]);
      player.start(time);
      appendToTerminal(drumNames[track]);
    }
  }

  if (lineBuffer.length > 0) {
    const terminal = document.getElementById("terminal");
    if (terminal) {
      let newLine = document.createElement("div");
      newLine.textContent = lineBuffer;
      terminal.appendChild(newLine);
      terminal.scrollTop = terminal.scrollHeight;
    }
    lineBuffer = "";
  }
}

let randomWords = [
  "ls", "cd", "rm", "mv", "cp", "echo", "touch", "mkdir",
  "grep", "awk", "sed", "cat", "less", "more", "tail", "head",
  "find", "xargs", "chmod", "chown", "ps", "top", "kill", "pkill",
  "curl", "wget", "tar", "zip", "unzip", "scp", "rsync",
  "ping", "traceroute", "dig", "netstat", "ifconfig", "ip",
  "uptime", "whoami", "hostname", "df", "du", "free",
  "env", "export", "alias", "unalias", "history",
];

let randomPunctuations = [" ", " ", " ", "  ", " -- ", "... ", ". "];
let lineBuffer = "";

function appendToTerminal(soundName) {
  let wordCount = Math.floor(Math.random() * 4) + 1;
  let line = "";

  for (let i = 0; i < wordCount; i++) {
    // let w = randomWords[Math.floor(Math.random() * randomWords.length)];
    let punc = randomPunctuations[Math.floor(Math.random() * randomPunctuations.length)];
    // line += w + punc;
    line += punc;
  }

  line += "[" + soundName + "] ";
  lineBuffer += line; // 将内容追加到 lineBuffer
}

let ambientSounds = [
  { label: "1", file: "assets/80_RADIOFEEDBACK_DRONE.wav" },
  { label: "2", file: "assets/AG_110_drum_loop_data_glitch.wav" },
  { label: "3", file: "assets/AG_110_noise_loop_enter.wav" },
  { label: "4", file: "assets/AG_130_drone_loop_toikoi.wav" }
];

let ambientPlayers = {};
let ambientStates = {};

function setupAmbientControls() {
  let ambientElements = document.querySelectorAll(".ambient-sound");
  if (!ambientElements.length) {
    console.error("未在 HTML 中找到任何 .ambient-sound 元素！");
    return;
  }
  
  ambientElements.forEach(elem => {
    let label = elem.getAttribute("data-sound");
    let soundObj = ambientSounds.find(s => s.label === label);
    if (!soundObj) {
      console.error("未找到对应配置： " + label);
      return;
    }
    
    ambientPlayers[label] = new Tone.Player({
      url: soundObj.file,
      loop: true,
      autostart: false
    }).toDestination();
    
    ambientStates["1"] = false;
    ambientStates["2"] = false;
    ambientStates["3"] = false;
    ambientStates["4"] = true;
    if (label === "1" || label === "2" || label === "3") {
      elem.classList.add("inactive");
    } else {
      elem.classList.add("active");
    }
    
    elem.addEventListener("click", () => {
      if (ambientStates[label]) {
        ambientPlayers[label].stop();
        ambientStates[label] = false;
        elem.classList.remove("active");
        elem.classList.add("inactive");
      } else {
        ambientPlayers[label].loop = true;
        ambientPlayers[label].start();
        ambientStates[label] = true;
        elem.classList.remove("inactive");
        elem.classList.add("active");
      }
    });
  });
}

let w = 60;
let gray;
let colors = [
  "#41FF00","#666",
];

function setup() {
  createCanvas(960, 1080);
  cellWidth = width / nSteps();
  cellHeight = height / nTracks;
  gray = color(178, 178, 188);

  for (let track = 0; track < nTracks; track++) {
    cells[track] = [];
    for (let step = 0; step < nSteps(); step++) {
      cells[track][step] = 0;
    }
  }

  setupAmbientControls();
}

function draw() {
  background(13);
  let w = 60;
  frameRate(30);

  noStroke();

  for (let step = 0; step < nSteps(); step++) {
    for (let track = 0; track < nTracks; track++) {
      if (cells[track][step] == 1) {
        fill(colors[track % colors.length]);
        // fill( random(100,255), 0, random(100,255) );
        rect(step * w, track * w, w, w);
      }
    }
  }

  stroke(gray);
  for (let i = 0; i <= nTracks; i++) {
    let y = i * w;
    line(0, y, width, y);
  }

  for (let i = 0; i <= nSteps(); i++) {
    if (i % timeSignature[0] == 0) {
      strokeWeight(1);
      stroke(255);
    } else {
      stroke(gray);
      strokeWeight(0.5);
    }

    line(i * w, 0, i * w, height);

    if (i == currentStep && Tone.Transport.state == "started") {
      fill(65, 255, 0, random(50,100));
      //noStroke();
      rect(i * w, 0, w, height);

      strokeWeight(random(1,3));
      stroke(65,255,0);
      line(i*w, 0, i*w+random(-10,10), height);
    }
  }

    // loadPixels();
    // for (let i = 0; i < pixels.length; i += 4) {
    //   let noiseVal = random(-20, 20);
    //   pixels[i]   += noiseVal;   // R
    //   pixels[i+1] += noiseVal;   // G
    //   pixels[i+2] += noiseVal;   // B
    // }
    // updatePixels();
  
}

function mousePressed() {
  let i = floor(mouseX / w);
  let j = floor(mouseY / w);
  cells[j][i] = !cells[j][i];
}

Tone.loaded().then(function () {
  console.log("loaded");
  Tone.Transport.start();
});

document.getElementById("startOverlay").addEventListener("click", async () => {
  await Tone.start();
  console.log("Audio context started");
  Tone.Transport.start();
  document.getElementById("startOverlay").style.display = "none";
  
  for (let key in ambientPlayers) {
    if (ambientStates[key]) {
      ambientPlayers[key].start();
    }
  }
});

document.getElementById("bpmInput").addEventListener("change", (e) => {
  bpm = parseInt(e.target.value);
  Tone.Transport.bpm.value = bpm;
  console.log("BPM 更新为: " + bpm);
});

document.getElementById("timeSigNum").addEventListener("change", (e) => {
  timeSignature[0] = parseInt(e.target.value);
  Tone.Transport.timeSignature = timeSignature[0];
  reinitializeGrid();
  console.log("拍号更新为: " + timeSignature[0] + "/" + timeSignature[1]);
});
