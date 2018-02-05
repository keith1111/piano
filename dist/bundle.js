/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = getTempo;
/* harmony export (immutable) */ __webpack_exports__["f"] = setTempo;
/* harmony export (immutable) */ __webpack_exports__["c"] = getTime;
/* harmony export (immutable) */ __webpack_exports__["d"] = initMetronome;
/* harmony export (immutable) */ __webpack_exports__["k"] = startMetronome;
/* harmony export (immutable) */ __webpack_exports__["a"] = adjustMetronomeVolume;
/* harmony export (immutable) */ __webpack_exports__["l"] = stopMetronome;
/* harmony export (immutable) */ __webpack_exports__["e"] = playMetronomeSingle;
/* harmony export (immutable) */ __webpack_exports__["g"] = soundPlay;
/* harmony export (immutable) */ __webpack_exports__["i"] = soundStop;
/* harmony export (immutable) */ __webpack_exports__["h"] = soundPlayCpu;
/* harmony export (immutable) */ __webpack_exports__["j"] = soundStopCpu;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__metronome_controls_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__cpuPlayer_js__ = __webpack_require__(7);



let STD_TUNING = 440;    // tuning A 1-st oct  std == 440Hz
let STD_KEYNUMBER_A = 46; // place of A-note 1-st oct on piano board
let SUSTAIN_TIME = 2;
let tempo = 70;

let ctx = new AudioContext();
let buffer = {};   // buffer.metronome etc
let destination = ctx.destination;;
let osc = {};  //for 84 keys
let gainNode = {};
let volumeManualNode, whistleFilterStep1, whistleFilterStep2, compressor;   //  manual sound nodes
let startedSustain = {};


let oscCpu = {};
let gainNodeCpu = {};
let volumeCpu, whistleFilterCpuStep1, whistleFilterCpuStep2, compressorCpu;   //  auto sound nodes
let startedSustainCpu = {};

let metronomeSource, metronomeGain;
let metronomeTimer;
let metronomeOn = false;


let overtones = [0, 1, .562, .282, .251, .282, .158, .100, .251, .002, .100];   // old
//let overtones = [0, 1, .66, .25, .33, .1, .5, .12, .23, .12, .1];
let real = [];
let imag = [];
for(let i=0;i<overtones.length;i++){
  real[i] = overtones[i];
  imag[i] = 0;
}
let pianoTable = ctx.createPeriodicWave(real, imag);

function getTempo(){
  return tempo;
}

function setTempo(newTempo){
  tempo = newTempo;
}

function getTime(){
  return ctx.currentTime;
}

function initManualSound(){
  volumeManualNode = ctx.createGain();
  volumeManualNode.gain.setValueAtTime(1,0);

  whistleFilterStep1 = ctx.createBiquadFilter();
  whistleFilterStep1.type = 'highshelf';
  whistleFilterStep1.Q.setValueAtTime(.05,0);
  whistleFilterStep1.frequency.setValueAtTime(7000,0);
  whistleFilterStep1.gain.setValueAtTime(-45,0);

  whistleFilterStep2 = ctx.createBiquadFilter();
  whistleFilterStep2.type = 'highshelf';
  whistleFilterStep2.Q.setValueAtTime(.05,0);
  whistleFilterStep2.frequency.setValueAtTime(10000,0);
  whistleFilterStep2.gain.setValueAtTime(-70,0);

  compressor = ctx.createDynamicsCompressor();

  compressor.attack.setValueAtTime(.1,0);
  compressor.knee.setValueAtTime(12,0);
  compressor.ratio.setValueAtTime(15,0);
  compressor.release.setValueAtTime(1,0);

  volumeManualNode.connect(whistleFilterStep1);
  whistleFilterStep1.connect(whistleFilterStep2);
  whistleFilterStep2.connect(compressor);
  compressor.connect(destination);
}

function initCpuSound(){
  __WEBPACK_IMPORTED_MODULE_1__cpuPlayer_js__["a" /* init */]();

  volumeCpu = ctx.createGain();
  volumeCpu.gain.setValueAtTime(1,0);

  whistleFilterCpuStep1 = ctx.createBiquadFilter();
  whistleFilterCpuStep1.type = 'highshelf';
  whistleFilterCpuStep1.Q.setValueAtTime(.05,0);
  whistleFilterCpuStep1.frequency.setValueAtTime(7000,0);
  whistleFilterCpuStep1.gain.setValueAtTime(-45,0);

  whistleFilterCpuStep2 = ctx.createBiquadFilter();
  whistleFilterCpuStep2.type = 'highshelf';
  whistleFilterCpuStep2.Q.setValueAtTime(.05,0);
  whistleFilterCpuStep2.frequency.setValueAtTime(10000,0);
  whistleFilterCpuStep2.gain.setValueAtTime(-70,0);

  compressorCpu = ctx.createDynamicsCompressor();

  compressorCpu.attack.setValueAtTime(.1,0);
  compressorCpu.knee.setValueAtTime(12,0);
  compressorCpu.ratio.setValueAtTime(15,0);
  compressorCpu.release.setValueAtTime(1,0);

  volumeCpu.connect(whistleFilterCpuStep1);
  whistleFilterCpuStep1.connect(whistleFilterCpuStep2);
  whistleFilterCpuStep2.connect(compressorCpu);
  compressorCpu.connect(destination);
}

function initMetronome(){
  loadSample("metronome.mp3", "metronome");
  __WEBPACK_IMPORTED_MODULE_0__metronome_controls_js__["a" /* init */]();
  initCpuSound();
}



function startMetronome(){

  document.querySelector('#tempo').classList.add('on');
  document.querySelector('.power').classList.add('on');
  metronomeOn = true;
  playMetronome();


}

function adjustMetronomeVolume(vol){
  metronomeGain.gain.setValueAtTime(vol,0);
}

function stopMetronome(){

  clearTimeout(metronomeTimer);
  metronomeOn = false;
  document.querySelector(".power").classList.remove('on');
  document.querySelector('#tempo').classList.remove('on');
}

function playMetronome(){
  metronomeSource = ctx.createBufferSource();
  metronomeSource.buffer = buffer.metronome;
  metronomeSource.connect(metronomeGain);

  metronomeSource.start(0);
  metronomeSource.stop(ctx.currentTime+.26);

  tempo = document.querySelector('#speed').value;
  if(metronomeOn){
    metronomeTimer = setTimeout( startMetronome, 60000/tempo);
  }
}

function playMetronomeSingle(time){
  metronomeSource = ctx.createBufferSource();
  metronomeSource.buffer = buffer.metronome;
  metronomeSource.connect(metronomeGain);

  metronomeSource.start(time);

  metronomeSource.stop(time+.26);
}

function loadSample(filename, bufferProp){
  let req = new XMLHttpRequest();
  req.open('GET', `./sample/${filename}`, true);
  req.responseType = 'arraybuffer';
  req.onload = function(e) {
     ctx.decodeAudioData(this.response,function(decodedArrayBuffer) {
        buffer[bufferProp] = decodedArrayBuffer;

        metronomeGain = ctx.createGain();


        metronomeGain.connect(destination);
        }, function(e) {
        console.log('Error decoding file', e);
        });
  };
  req.send();
}

function resetSustain(e){
  //console.log(ctx.currentTime - startedSustain[e.target.keyNumber]);
  startedSustain[e.target.keyNumber] = 0;
}

function generateManualSound(keyNumber){

  let diffHalftones = keyNumber - STD_KEYNUMBER_A;
  let toneHz = Math.pow(2, diffHalftones/12) * STD_TUNING;

  if(startedSustain[keyNumber]){
    osc[keyNumber].disconnect();
  }

  osc[keyNumber] = ctx.createOscillator();
  osc[keyNumber].frequency.setValueAtTime(toneHz, 0);
  osc[keyNumber].setPeriodicWave(pianoTable);

  osc[keyNumber].onended = resetSustain;
  osc[keyNumber].keyNumber = keyNumber;

  gainNode[keyNumber] = ctx.createGain();
  gainNode[keyNumber].gain.setValueAtTime(1,0);
  if(!volumeManualNode){
    initManualSound();
  }

  gainNode[keyNumber].connect(volumeManualNode);

  osc[keyNumber].connect(gainNode[keyNumber]);
  gainNode[keyNumber].gain.linearRampToValueAtTime(0, ctx.currentTime + SUSTAIN_TIME);
  osc[keyNumber].start(0);


}

function soundPlay(key){

  let keyTone = +key.dataset.tone;
  let oct = +key.parentElement.dataset.oct+2;
  let keyNumber = oct*12+keyTone;

  generateManualSound(keyNumber);


}

function soundStop(key){
  let keyTone = +key.dataset.tone;
  let oct = +key.parentElement.dataset.oct+2;
  let keyNumber = oct*12+keyTone;
  
  if(!osc[keyNumber]){
    return;
  }

  startedSustain[keyNumber] = ctx.currentTime;
  osc[keyNumber].stop(ctx.currentTime+SUSTAIN_TIME);


}



function soundPlayCpu(keyNumber, time, duration){
  let diffHalftones = keyNumber - STD_KEYNUMBER_A;
  let toneHz = Math.pow(2, diffHalftones/12) * STD_TUNING;


  oscCpu[keyNumber] = ctx.createOscillator();
  oscCpu[keyNumber].frequency.setValueAtTime(toneHz, 0);
  oscCpu[keyNumber].setPeriodicWave(pianoTable);

 // oscCpu[keyNumber].onended = endCpuSound(keyNumber);

  gainNodeCpu[keyNumber] = ctx.createGain();
  gainNodeCpu[keyNumber].gain.setValueAtTime(1,time);

  gainNodeCpu[keyNumber].connect(volumeCpu);

  oscCpu[keyNumber].connect(gainNodeCpu[keyNumber]);
  gainNodeCpu[keyNumber].gain.linearRampToValueAtTime(0, time + duration + SUSTAIN_TIME/4);

  oscCpu[keyNumber].start(time);
  oscCpu[keyNumber].stop(time+duration+SUSTAIN_TIME/4);
}

function soundStopCpu(time){
  for( let key in oscCpu){
    oscCpu[key].stop(time + SUSTAIN_TIME);
  }
}




// let gainNode =  ctx.createGain();
//let delayNode = ctx.createDelay();


//delayNode.delayTime.setValueAtTime(.5,0);
//let convolverNode = ctx.createConvolver();   //impulse response




//  var analyser = context.createAnalyser();
//// ����������� �������������� �����
//// ���� �� ���������, ��� ��� ����� - ������� 512, 1024 ��� 2048 ;)
//  analyser.fftSize = 2048;
//// ������� ������� ��� �������� ������
//  fFrequencyData = new Float32Array(analyser.frequencyBinCount);
//  bFrequencyData = new Uint8Array(analyser.frequencyBinCount);
//  bTimeData = new Uint8Array(analyser.frequencyBinCount);
//// �������� ������
//  analyser.getFloatFrequencyData(fFrequencyData);
//  analyser.getByteFrequencyData(bFrequencyData);
//  analyser.getByteTimeDomainData(bTimeData);
//// ������ � ��� ���� ������� fFrequencyData, bFrequencyData, bTimeData, � �������� ����� ������ ���, ��� ����������



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = enableOctaveChange;
/* harmony export (immutable) */ __webpack_exports__["b"] = offset;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__keymap_js__ = __webpack_require__(2);


function enableOctaveChange(){


  document.addEventListener("keydown", moveBoard);

  function moveBoard(e){
    if(e.keyCode == 33){
      octaveMove(-1);
      Object(__WEBPACK_IMPORTED_MODULE_0__keymap_js__["b" /* updateKeysSigns */])();

    }else if(e.keyCode==34){
      octaveMove(1);
      Object(__WEBPACK_IMPORTED_MODULE_0__keymap_js__["b" /* updateKeysSigns */])();
    }
  }
}

function offset(){
  let keys = document.querySelector(".board");

  if(arguments.length){
    let newOffset = arguments[0];
    keys.setAttribute("transform", `translate(${newOffset},140)`);
    return newOffset;
  }
  return offsetFromAttr(keys.getAttribute("transform"));
}

function offsetFromAttr(transform){
  let pos = transform.indexOf('(');
  let trimmedAttr = transform.slice(pos+1);
  return parseInt(trimmedAttr);
}

function octaveMove(change){
  let OCT_WIDTH = -490;
  let currentOffset = offset();
  let currentOct = currentOffset/OCT_WIDTH - 2;

  if(change == 1 && currentOct < 3){
    offset( currentOffset +=OCT_WIDTH );
  } else if( change == -1 && currentOct > -2){
    offset( currentOffset -=OCT_WIDTH );
  }
}

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = signKeys;
/* harmony export (immutable) */ __webpack_exports__["b"] = updateKeysSigns;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__board_js__ = __webpack_require__(1);


function signKeys(){
  updateKeysSigns();


}

let TEXT_SIGNS = {
  current: [-1, "Z","S", "X","D","C", "V","G", "B","H", "N","J", "M"],
  next: [-1, "Y","7","U","8","I","o","0","P","-","[" ,"=","]"]
};

function updateKeysSigns(){
  let keys = document.querySelectorAll(".piano-key");
  let OCT_WIDTH = -490;
  let currentOffset = Object(__WEBPACK_IMPORTED_MODULE_0__board_js__["b" /* offset */])();
  let currentOct = currentOffset/OCT_WIDTH - 2;
  keys.forEach( function(key){
    let keyOct = key.parentElement.dataset.oct;
    if( keyOct < currentOct || keyOct > currentOct+1){
      return;
    }
    let tone = key.dataset.tone;
    key.querySelector('text').textContent = (keyOct == currentOct) ? TEXT_SIGNS.current[tone] : TEXT_SIGNS.next[tone];
  });
}

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = renderExamples;
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return examples; });
function renderExamples(){
  let select = document.querySelector("#examples");
  let examplesArray = [...Object.keys(examples)];
  select.innerHTML = examplesArray.map((a,i) => {
    return `
      <option value="${a}">${a}</option>
    `
  }).join("");

}

let examples = {
  '1' : '* this is a comment. Song: Bach Prelude C-moll  * ' +
  ' t132 o2 16' +
  ' c - eb d eb c eb d eb + c - eb d eb c eb d eb' +
  ' ab f e f c f e f ab f e f c f e f' +
  ' h f eb f d f eb f h f eb f d f eb f' +
  ' + c - g f g eb g f g + c - g f g eb g f g' +
  ' + eb - ab g ab eb ab g ab + eb - ab g ab eb ab g ab' +
  ' + d - f# e f# d f# e f# + d - f# e f# d f# e f#' +
  ' + d - g f# g d g f# g + d - g f# g d g f# g' +
  ' + c - e d e c e d e + c - e d e c e d e' +
  ' + c - f e f c f e f + c - f e f c f e f' +
  ' hb f eb f d f eb f hb f eb f d f eb f' +
  ' hb g f g eb g f g hb g f g eb g f g' +
  ' ab g f g eb g f g ab g f g eb g f g' +
  ' ab d c d - hb + d c d ab d c d - hb + d c d' +
  ' g - hb ab hb + eb - hb ab hb + g - hb ab hb + eb - hb ab hb' +
  ' + f c - hb + c - a + c - hb + c f c - hb + c - a + c - hb + c' +
  ' f d c d - h + d c d f d c d - h + d c d' +
  ' f d c d - h + d c d f d c d - h + d c d' +
  ' eb c - h + c - g + c - h + c eb c - h + c - g + c - h + c' +
  ' - f + eb d eb f eb d eb - f + eb d eb f eb d eb' +
  ' - f# + c - h + c eb c - h + c - f# + c - h + c eb c - h + c' +
  ' eb c - h + c - g + c - h + c eb c - h + c - g + c - h + c' +
  ' f# c - h + c - a + c - h + c f# c - h + c - a + c - h + c' +
  ' g c - h + c d c - h + c g c - h + c d c - h + c' +
  ' ab c - h + c d c - h + c ab c - h + c d c - h + c' +

  ' *  PART 2 * +' +
  ' o-1 ' +
  ' g h + d f ab f e f h f + d - h ab f e f ' +
  ' o-1 ' +
  ' g +c eb g + c -g f# g + eb c g eb c - ab g ab' +
  'o-1 ' +
  ' g a + f# + c + eb c - h + c f# c a f# eb c - h +c' +
  ' *PART 3*' +
  ' o2 p d c d eb c - h + c - a +c -h + c d - h a h' +
  ' g h a h +c  -a g a f# a g a h g f# g' +
  ' d +g f g ab f eb f d f eb f g eb d eb' +
  'c eb d eb f d c d - h + dc d eb c -h +c' +
  '- g + c - h +c - ab + f eb f - g + eb d eb - f + d c d' +
  ' - eb +c -hb +c - ab f eb f g eb d eb f d c d ' +
  '    *ADAGIO*     ' +
  't60 8 e 32 ^e c d e 64 f g ab hb + c - hb ab g 32 f g e f e f 16 ^f g 32 f e f g ab g 64 f eb d eb f d eb f' +
  ' *ALLEGRO*  ' +
  't132 8 - h. 16 d f ab g f h f + d  -f h ab g f' +
  ' e + db -hb g +c -ab  f ab g hb g eb ab f d f' +
  ' e g e c f d - h +d 8 c. 16 d g hb g ' +
  ' ab + c f d f ab +c - h +c -f gd 4 e'

};

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__board_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__keypress_visual_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__keymap_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__sound_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__examples_js__ = __webpack_require__(3);








function ready(){
  __WEBPACK_IMPORTED_MODULE_3__sound_js__["d" /* initMetronome */]();
  __WEBPACK_IMPORTED_MODULE_1__keypress_visual_js__["b" /* enableVisualClick */]();
  __WEBPACK_IMPORTED_MODULE_0__board_js__["a" /* enableOctaveChange */]();
  __WEBPACK_IMPORTED_MODULE_2__keymap_js__["a" /* signKeys */]();
  __WEBPACK_IMPORTED_MODULE_1__keypress_visual_js__["a" /* enableKeyboardPress */]();
  __WEBPACK_IMPORTED_MODULE_4__examples_js__["b" /* renderExamples */]();


}

document.addEventListener('DOMContentLoaded', ready);


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = enableVisualClick;
/* harmony export (immutable) */ __webpack_exports__["a"] = enableKeyboardPress;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__board_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__sound_js__ = __webpack_require__(0);



const TONE_VISUAL_OFFSET = {
  1: 0,
  2: 55,
  3: 70,
  4: 125,
  5: 140,
  6: 210,
  7: 265,
  8: 280,
  9: 335,
  10: 350,
  11: 405,
  12: 420
};
const KEYCODE_TONE = {
  90: 1,  //z
  83: 2,  //s
  88: 3,  //x
  68: 4,  //d
  67: 5,  //c
  86: 6,  //v
  71: 7,  //g
  66: 8,  //b
  72: 9,  //h
  78: 10, //n
  74: 11, //j
  77: 12, //m
  89: 13, //y
  55: 14, //7
  85: 15, //u
  56: 16, //8
  73: 17, //i
  79: 18, //o (letter)
  48: 19, //0 (zero)
  80: 20, //p
  189: 21,  //-
  219: 22,  //[
  187: 23, //=
  221: 24 // ]
}

let activatedKeys = {
  90: -1,  //z
  83: -1,  //s
  88: -1,  //x
  68: -1,  //d
  67: -1,  //c
  86: -1,  //v
  71: -1,  //g
  66: -1,  //b
  72: -1,  //h
  78: -1, //n
  74: -1, //j
  77: -1, //m
  89: -1, //y
  55: -1, //7
  85: -1, //u
  56: -1, //8
  73: -1, //i
  79: -1, //o (letter)
  48: -1, //0 (zero)
  80: -1, //p
  189: -1,  //-
  219: -1,  //[
  187: -1, //=
  221: -1 // ]
};

function playKey(e) {
  if(e && (isPressedOnKeyboard(this) || e.type=="mouseenter" && !(e.buttons & 1)) ){
    return;
  };
  this.dataset.isPressed = true;
  __WEBPACK_IMPORTED_MODULE_1__sound_js__["g" /* soundPlay */](this);

}

function stopKey(e) {

  if(e && isPressedOnKeyboard(this)){
    return;
  };

  this.dataset.isPressed = false;

  if(e && e.type=="mouseout" && !(e.buttons & 1)){
    return;
  }
  __WEBPACK_IMPORTED_MODULE_1__sound_js__["i" /* soundStop */](this);
}

function isPressedOnKeyboard(key){
  let oct = +key.parentElement.dataset.oct+2;
  let toneNumber = +key.dataset.tone;
  let keyNumber = oct*12+toneNumber;
  for (let x in activatedKeys){
    if (activatedKeys[x] == keyNumber){
      return true;
    };
  }
  return false;
}

function enableVisualClick() {

  //document.addEventListener("dragstart", ()=> false);

  let pianoKeys = document.querySelectorAll(".piano-key");
  pianoKeys.forEach(key=> key.addEventListener("mousedown", playKey));
  pianoKeys.forEach(key=> key.addEventListener("mouseup", stopKey));
  pianoKeys.forEach(key=> key.addEventListener("mouseout", stopKey));
  pianoKeys.forEach(key=> key.addEventListener("mouseenter", playKey));




}

function enableKeyboardPress(){

  document.addEventListener("keydown", function(e){
    if(!KEYCODE_TONE[e.keyCode] || activatedKeys[e.keyCode] != -1){
      return;
    }
    let OCT_WIDTH = -490;
    let currentOffset = Object(__WEBPACK_IMPORTED_MODULE_0__board_js__["b" /* offset */])();
    let currentOct = currentOffset/OCT_WIDTH - 2;

    let keyCountNumber = KEYCODE_TONE[e.keyCode];

    activatedKeys[e.keyCode] = (currentOct+2)*12 + keyCountNumber;

    let octave = keyCountNumber <= 12 ? currentOct : currentOct+1;
    if(keyCountNumber>12){
      keyCountNumber -=12;
    }

    let keyDOM = document.querySelector(`[data-oct="${octave}"] [data-tone="${keyCountNumber}"]`);
    playKey.call(keyDOM);

    });

  document.addEventListener("keyup", function(e){
    if(!KEYCODE_TONE[e.keyCode] || activatedKeys[e.keyCode == -1]){
      return;
    }

    let keyCountNumber = activatedKeys[e.keyCode] % 12 || 12;
    let octave = (activatedKeys[e.keyCode] - keyCountNumber)/12 - 2;

    activatedKeys[e.keyCode] = -1;

    let keyDOM = document.querySelector(`[data-oct="${octave}"] [data-tone="${keyCountNumber}"]`);
    stopKey.call(keyDOM);

  });

}



/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = init;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__sound_js__ = __webpack_require__(0);


function init(){
  let controls = document.querySelectorAll(".metronome-controls");

  controls.forEach( c=> c.addEventListener("input", setControl));

  let power = document.querySelector(".power");
  power.addEventListener("click", togglePower);
}

function setControl(){
  this.setAttribute('value', this.value);
  if(this.dataset.control == "speed"){
    document.querySelector("#tempo").textContent = this.value;
    Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["f" /* setTempo */])(this.value);
  } else if(this.dataset.control=="volume")
  {
    Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["a" /* adjustMetronomeVolume */])(this.value);
  }
}

function togglePower(){
  if(!this.classList.contains('on')){
    document.querySelector('#tempo').classList.add('on');
    this.classList.add('on');
    Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["k" /* startMetronome */])();
  }else{
    document.querySelector('#tempo').classList.remove('on');
    this.classList.remove('on');
    Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["l" /* stopMetronome */])();
  }


}

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = init;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__sound_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__sequenceParser_js__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__examples_js__ = __webpack_require__(3);





let NOTES = {
  'c': 1,
  'c#': 2,
  'db': 2,
  'd': 3,
  'd#': 4,
  'eb': 4,
  'e': 5,
  'f': 6,
  'f#': 7,
  'gb': 7,
  'g': 8,
  'g#': 9,
  'ab': 9,
  'a': 10,
  'a#': 11,
  'hb': 11,
  'h': 12
};
let SILENCE_INTRO_TICKS = 4;

let PROCESSING_TIME = 1; // seconds

function init(){
  document.querySelector(".player .start").addEventListener("click", takeNotes);
}


function takeNotes() {

  let selected = document.querySelector('#examples').value;
  let notesString = __WEBPACK_IMPORTED_MODULE_2__examples_js__["a" /* examples */][selected];
  playCommands(__WEBPACK_IMPORTED_MODULE_1__sequenceParser_js__["a" /* parse */](notesString));
}


function playCommands(sequenceObj) {

  let commands = sequenceObj.commands;
  let timings = sequenceObj.timings;
  let oct = 1;
  let outerTemp = Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["b" /* getTempo */])();

  let stdInnerTemp = outerTemp;
  let currentInnerTemp;
  let currentSpeed = 1;


  let notesCount = 0;

  timings = timings.map( a=> {
    return {
      duration: a.end-a.start,
      start: a.start+SILENCE_INTRO_TICKS,
      end: a.end+SILENCE_INTRO_TICKS

    }
  });

  let ctxTime = Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["c" /* getTime */])();
  let startTime = ctxTime + PROCESSING_TIME;

  let breakPoints = [0];    // tacts in each tempo
  let breakTime = [0];      // seconds when change tempo
  let tempoZone = 0;        // increase in each tempo change
  let q = [60/outerTemp];   //  4th note in seconds



  for (let i = 0; i < commands.length; i++) {

    if (!timings[i].duration) {
      if (commands[i].startsWith('t')) {
        let newInnerTemp = parseInt(commands[i].slice(1));
        if(!notesCount){
          stdInnerTemp = newInnerTemp;
        }
        if(timings[i].start > SILENCE_INTRO_TICKS){
          let prevTempoSeconds = (timings[i].start - breakPoints[breakPoints.length-1])*q[tempoZone];

          breakPoints.push(timings[i].start);

          breakTime.push(breakTime[breakTime.length-1] + prevTempoSeconds);
          tempoZone++;
          q.push(60/(outerTemp*newInnerTemp/stdInnerTemp));
        }
        currentInnerTemp = newInnerTemp;
        currentSpeed = newInnerTemp/stdInnerTemp;

      }
      else if (commands[i].startsWith('o')) {
        let nextOct = parseInt(commands[i].slice(1));
        if (!isNaN(nextOct)) {
          oct = nextOct;

        }
        else if (commands[i][1] == '-') {
          oct--;
        } else if (commands[i][1] == '+') {
          oct++;
        }
      }
      else if(commands[i] == '@'){
        Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["j" /* soundStopCpu */])(startTime+ breakTime[tempoZone] +  timings[i].start*q[tempoZone]);
      }
    }

    else {
      let key = NOTES[commands[i]] + (oct+2) * 12;
      notesCount++;
      Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["h" /* soundPlayCpu */])(key, startTime + breakTime[tempoZone] + (timings[i].start - breakPoints[tempoZone])*q[tempoZone], timings[i].duration*q[tempoZone]);
    }

  }

  let lastNote = Math.floor(timings[timings.length-1].end);

  breakPoints.push(lastNote);


  for(let tzone=0; tzone<breakPoints.length ;tzone++){
    for(let j=breakPoints[tzone]; j<breakPoints[tzone+1]; j++){
      Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["e" /* playMetronomeSingle */])(startTime+breakTime[tzone]+(j-breakPoints[tzone])*q[tzone]);
    }
  }





}



/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = parse;
function parse(sheet){

  let commentRegex = new RegExp('\\*.\*\?\\*', 'g');      //  remove all between    *    ...   *
  sheet = sheet.replace(commentRegex, '');

  sheet += " @";  // end

  let pos = 0;
  let next = 0;
  let dur = 4;
  let time = 0;
  let commands = [];
  let timings = [];    //{start: 0, end: 1} in 4th notes


  while(true) {
    let c = sheet[pos];
    /*    tempo change , octave change :     t60  o2     */
    if (c == "t" || c == 'o') {
      next = sheet.slice(pos).indexOf(" ");
      let command = sheet.substr(pos, next);


      timings.push({start: time, end: time});
      commands.push(command);
      pos += next+1;
    }
    /*  1 octave down    :     -    */
    else if (c == '-') {
      timings.push({start: time, end: time});
      commands.push('o-');
      pos ++;
    }
    /*  1 octave up    :     +     */
    else if (c == '+') {
      timings.push({start: time, end: time});
      commands.push('o+');
      pos ++;
    }
    /* note detect mode :   c d e f g a h; cb c# ; cdc ebdbc f#gh ;   pause detect : p  */
    else if ('cdefgahp'.indexOf(c) != -1) {
      let quitNoteMode = new RegExp("[^cdefgah#bp ]");
      quitNoteMode.lastIndex = pos;   // start scan note-adding mode sequence
      next = pos + quitNoteMode.exec(sheet.slice(pos)).index;     // detect quit of note-adding mode
      /* buffer */
      let command = "";
      for(let i=pos; i<next; i++){
        if('cdefgah'.indexOf(sheet[i]) != -1){

          if(!command){
            /* buffer empty - add note */
          command = sheet[i];
          }else{
            /* note already exists in buffer  - play, clear buffer, add new note  */
            commands.push(command);
            timings.push({start: time, end: time + 4 / dur});
            time += 4 / dur;
            command = sheet[i];
          }
        }
        else if (command && '#b'.indexOf(sheet[i]) != -1){
          /* note already exists in buffer - apply halftone up/down, play note, clear buffer, ready for next note  */
          command += sheet[i];
          commands.push(command);
          timings.push({start: time, end: time + 4 / dur});
          time += 4 / dur;
          command = "";
        }
        else if (sheet[i] == 'p'){
          /* pause - add silence (no commands for pause dur)*/
          time += 4/dur;
        }

        else if (sheet[i] != ' '){
          /*  error  */
          console.log("Unknown command:" + sheet[i]);
          console.log(sheet.slice(pos, pos+10));
          commands.push("@");
          timings.push({start:time, end:time});
          break;
        }

        if(i == next-1 && command){
          commands.push(command);
          timings.push({start: time, end: time + 4 / dur});
          time += 4 / dur;
        }
      }
      pos = next;

    }
    else if(c == '.'){
      /*  dot -  last note duration x1.5  */
      let lastDur = timings[timings.length-1].end - timings[timings.length-1].start;
      timings[timings.length-1].end += lastDur/2;
      time += lastDur/2;
      pos++;
    }
    else if (!isNaN(parseInt(c))) {
      next = sheet.slice(pos).indexOf(" ");
      let newDur = +sheet.substr(pos, next);
      dur = newDur;
      pos += next+1;
    }
    /* ignore whitespace */
    else if(c == ' '){
      pos++;
    }
    /*   merge note length  */
    else if (c == '^'){
      let noteToFind = '';
      let currentPos = pos;
      while(true){
        currentPos++;
        if('cdefgah#b '.indexOf(sheet[currentPos]) == -1){
          break;
        }

        if('cdefgah'.indexOf(sheet[currentPos]) != -1){
          if(noteToFind){
            break;
          }
          else{
            noteToFind = sheet[currentPos];
          }
        }else if('#b'.indexOf(sheet[currentPos]) !=- 1){
          if(noteToFind){
            noteToFind += sheet[currentPos];
          }
          break;
        }

      }

      let noteIndex = commands.lastIndexOf(noteToFind);
      time += 4/dur;
      timings[noteIndex].end = time;

      pos = currentPos;
    }

    else if(c == '@'){
      commands.push("@");
      timings.push({start:time, end:time});
      break;
    }
    else{
      console.log("Unknown command:" + c);
      console.log(sheet.slice(pos, pos+10));
      commands.push("@");
      timings.push({start:time, end:time});
      break;
    }

    if(pos>=sheet.length){
      break;
    }
  }

  console.log(commands);
  console.log(timings.map ((a,i)=> Object.assign(a,{command: commands[i]})) );

  return {
    commands: commands,
    timings: timings
  };

}

/***/ })
/******/ ]);