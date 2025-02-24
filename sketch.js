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

// Ambient Sounds 配置
let ambientSounds = [
  { label: "1", file: "samples/80_RADIOFEEDBACK_DRONE.wav" },
  { label: "2", file: "samples/AG_110_drum_loop_data_glitch.wav" },
  { label: "3", file: "samples/AG_110_noise_loop_enter.wav" },
  { label: "4", file: "samples/AG_130_drone_loop_toikoi.wav" }
];

// 用于保存 ambient 声音的 Tone.Player 实例和状态（true: 播放中，false: 停止）
let ambientPlayers = {};
let ambientStates = {};

// 初始化 ambient sounds 控制，注意这里是从 HTML 中读取对应元素
function setupAmbientControls() {
  let ambientElements = document.querySelectorAll(".ambient-sound");
  if (!ambientElements.length) {
    console.error("未在 HTML 中找到任何 .ambient-sound 元素！");
    return;
  }
  
  ambientElements.forEach(elem => {
    let label = elem.getAttribute("data-sound");
    // 根据 label 在配置中查找对应的 ambient 声音
    let soundObj = ambientSounds.find(s => s.label === label);
    if (!soundObj) {
      console.error("未找到对应配置： " + label);
      return;
    }
    
    // 创建 Tone.Player，默认设置为循环播放但不自动启动
    ambientPlayers[label] = new Tone.Player({
      url: soundObj.file,
      loop: true,
      autostart: false
    }).toDestination();
    
    // 默认状态为播放中（1），不过实际播放需等音频上下文启动后开始
    ambientStates["1"] = false;
    ambientStates["2"] = false;
    ambientStates["3"] = false;
    ambientStates["4"] = true;
    if (label === "1" || label === "2" || label === "3") {
      elem.classList.add("inactive");
    } else {
      elem.classList.add("active");
    }
    
    // 绑定点击事件，实现状态切换
    elem.addEventListener("click", () => {
      if (ambientStates[label]) {
        // 当前处于播放中，点击后停止播放
        ambientPlayers[label].stop();
        ambientStates[label] = false;
        elem.classList.remove("active");
        elem.classList.add("inactive");
      } else {
        // 当前已停止，点击后恢复循环播放
        ambientPlayers[label].loop = true;
        ambientPlayers[label].start();
        ambientStates[label] = true;
        elem.classList.remove("inactive");
        elem.classList.add("active");
      }
    });
  });
}

// Graphics 部分
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

  // 初始化 sequencer 网格
  for (let track = 0; track < nTracks; track++) {
    cells[track] = [];
    for (let step = 0; step < nSteps(); step++) {
      cells[track][step] = 0;
    }
  }

  // 初始化 ambient 控制（确保 HTML 中 ambient 元素已加载）
  setupAmbientControls();
}

function draw() {
  background(255);
  let w = 60;

  noStroke();

  // 绘制处于开启状态的格子
  for (let step = 0; step < nSteps(); step++) {
    for (let track = 0; track < nTracks; track++) {
      if (cells[track][step] == 1) {
        fill(colors[track % colors.length]);
        rect(step * w, track * w, w, w);
      }
    }
  }

  // 绘制横线
  stroke(gray);
  for (let i = 0; i <= nTracks; i++) {
    let y = i * w;
    line(0, y, width, y);
  }

  // 绘制竖线及当前播放步高亮
  for (let i = 0; i <= nSteps(); i++) {
    if (i % timeSignature[0] == 0) {
      strokeWeight(1);
      stroke(234, 30, 83, 60);
    } else {
      stroke(gray);
      strokeWeight(0.5);
    }

    line(i * w, 0, i * w, height);

    if (i == currentStep && Tone.Transport.state == "started") {
      fill(234, 30, 83, 60);
      noStroke();
      rect(i * w, 0, w, height);
    }
  }
}

function mousePressed() {
  // 计算鼠标点击的是哪个单元格
  let i = floor(mouseX / w);
  let j = floor(mouseY / w);
  cells[j][i] = !cells[j][i];
}

// Tone.js 所有音频文件加载完成后启动 Transport
Tone.loaded().then(function () {
  console.log("loaded");
  Tone.Transport.start();
});

document.getElementById("startOverlay").addEventListener("click", async () => {
  await Tone.start();
  console.log("Audio context started");
  Tone.Transport.start();
  document.getElementById("startOverlay").style.display = "none";
  
  // 启动所有默认处于开启状态的 ambient sound
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
