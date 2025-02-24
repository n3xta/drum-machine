// Ambient sounds 列表（根据实际文件路径调整）
let ambientSounds = [
  { label: "80_RADIOFEEDBACK_DRONE", file: "/samples/80_RADIOFEEDBACK_DRONE.wav" },
  { label: "187_percussion", file: "/samples/187_percussion.wav" },
  { label: "AG_110_drum_loop_data_gitch", file: "/samples/AG_110_drum_loop_data_gitch.wav" },
  { label: "AG_110_noise_loop_enter", file: "/samples/AG_110_noise_loop_enter.wav" },
  { label: "AG_130_drone_loop_toikoi", file: "/samples/AG_130_drone_loop_toikoi.wav" }
];

// 保存 ambient players 的对象
let ambientPlayers = {};
// 全局 ambient 循环播放复选框
let ambientLoopCheckbox;

function setupAmbientControls() {
  // 创建一个容器，方便管理 ambient 控件
  let ambientDiv = createDiv().id("ambientControls");
  ambientDiv.style("margin-top", "10px");

  // 创建循环播放的复选框，默认不循环播放
  ambientLoopCheckbox = createCheckbox("循环播放", false);
  ambientLoopCheckbox.parent(ambientDiv);
  ambientLoopCheckbox.changed(() => {
    // 如果复选框状态改变，更新正在播放的 ambient sound 的 loop 属性
    for (let key in ambientPlayers) {
      if (ambientPlayers[key].state === "started") {
        ambientPlayers[key].loop = ambientLoopCheckbox.checked();
      }
    }
  });

  // 为每个 ambient sound 创建一个按钮，并同时创建对应的 Tone.Player
  ambientSounds.forEach((sound) => {
    // 创建并连接 player 到输出
    ambientPlayers[sound.label] = new Tone.Player(sound.file).toDestination();
    
    // 创建按钮
    let btn = createButton(sound.label);
    btn.parent(ambientDiv);
    
    // 点击按钮时切换播放/停止状态
    btn.mousePressed(() => {
      let player = ambientPlayers[sound.label];
      if (player.state === "started") {
        player.stop();
      } else {
        // 根据复选框设置循环播放
        player.loop = ambientLoopCheckbox.checked();
        player.start();
      }
    });
  });
}

// Sequencer 参数
let bpm = 240;
let timeSignature = [4, 4];
let nMeasures = 2;
function nSteps() {
  return nMeasures * timeSignature[0];
}
let currentStep;

let cells = [];

// 设置 Transport 的 BPM 和拍号
Tone.Transport.bpm.value = bpm;
Tone.Transport.timeSignature = timeSignature[0];

// 重新初始化网格函数
function reinitializeGrid() {
  cells = [];
  cellWidth = width / nSteps(); // 根据新步数调整每个格子的宽度
  for (let track = 0; track < nTracks; track++) {
    cells[track] = [];
    for (let step = 0; step < nSteps(); step++) {
      cells[track][step] = 0;
    }
  }
}

// Sound
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
  "ui_click": "/samples/ui_click.wav",
  "ui_swipe": "/samples/ui_swipe.wav",
  "187_percussion": "/samples/187_percussion.wav",
  // "glitch_hoito": "/samples/glitch_hoito.wav",
  // "glitch_kumman": "/samples/glitch_kumman.wav",
  "glitch_paha": "/samples/glitch_paha.wav",
  "glitch_saitko": "/samples/glitch_saitko.wav",
  // "glitch_tuonne": "/samples/glitch_tuonne.wav",
  "hat_lupaan": "/samples/hat_lupaan.wav",
  "hat_oitte": "/samples/hat_oitte.wav",
  "hat_potku": "/samples/hat_potku.wav",
  "kick_katoa": "/samples/kick_katoa.wav",
  "kick_kiinni": "/samples/kick_kiinni.wav",
  "percussion_asia": "/samples/percussion_asia.wav",
  "tuntuu": "/samples/tuntuu.wav"
});
kit.toDestination();
Tone.Transport.scheduleRepeat(onBeat, "4n");

// Audio playback loop
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
    }
  }
}

// Graphics
let w = 60;
let gray;
let colors = [
  "#999999", "#909090", "#707070", "#505050", "#303030",
  "#ff9999", "#ff9090", "#ff7070", "#ff5050", "#ff3030",
  "#ff0000", "#00ff00"
];

function setup() {
  createCanvas(1080, 1080);
  cellWidth = width / nSteps();
  cellHeight = height / nTracks;
  gray = color(178, 178, 188);

  // 初始化所有 sequencer 单元格，ON: 1, OFF: 0
  for (let track = 0; track < nTracks; track++) {
    cells[track] = [];
    for (let step = 0; step < nSteps(); step++) {
      cells[track][step] = 0;
    }
  }
}

function draw() {
  background(255);
  let w = 60;

  noStroke();

  // Draw cells that are on
  for (let step = 0; step < nSteps(); step++) {
    for (let track = 0; track < nTracks; track++) {
      if (cells[track][step] == 1) {
        fill(colors[track % colors.length]);
        rect(step * w, track * w, w, w);
      }
    }
  }

  // Draw horizontal lines
  stroke(gray);
  for (let i = 0; i <= nTracks; i++) {
    let y = i * w;
    line(0, y, width, y);
  }

  // Draw vertical lines
  for (let i = 0; i <= nSteps(); i++) {
    if (i % timeSignature[0] == 0) {
      strokeWeight(1);
      stroke(234, 30, 83, 60);
    } else {
      stroke(gray);
      strokeWeight(0.5);
    }

    line(i * w, 0, i * w, height);

    // Highlight the step that is playing
    if (i == currentStep && Tone.Transport.state == "started") {
      fill(234, 30, 83, 60);
      noStroke();
      rect(i * w, 0, w, height);
    }
  }
}

function mousePressed() {
  // Determine which cell the mouse is on
  let i = floor(mouseX / w);
  let j = floor(mouseY / w);
  // Toggle cell on/off
  cells[j][i] = !cells[j][i];
}

// Once all audio files have been loaded, start the Tone playhead
Tone.loaded().then(function () {
  console.log("loaded");
  Tone.Transport.start();
});

document.getElementById("startOverlay").addEventListener("click", async () => {
  await Tone.start();
  console.log("Audio context started");
  Tone.Transport.start();
  // Remove or hide the overlay
  document.getElementById("startOverlay").style.display = "none";
});

document.getElementById("bpmInput").addEventListener("change", (e) => {
  bpm = parseInt(e.target.value);
  Tone.Transport.bpm.value = bpm;
  console.log("BPM 更新为: " + bpm);
});

document.getElementById("timeSigNum").addEventListener("change", (e) => {
  timeSignature[0] = parseInt(e.target.value);
  Tone.Transport.timeSignature = timeSignature[0];
  reinitializeGrid(); // 重新初始化网格，步数和格子宽度会随之变化
  console.log("拍号更新为: " + timeSignature[0] + "/" + timeSignature[1]);
});
