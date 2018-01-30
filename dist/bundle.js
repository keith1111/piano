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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = enableOctaveChange;
/* harmony export (immutable) */ __webpack_exports__["b"] = offset;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__keymap_js__ = __webpack_require__(1);


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
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = signKeys;
/* harmony export (immutable) */ __webpack_exports__["b"] = updateKeysSigns;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__board_js__ = __webpack_require__(0);


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
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = initMetronome;
/* harmony export (immutable) */ __webpack_exports__["e"] = toggleMetronome;
/* harmony export (immutable) */ __webpack_exports__["a"] = adjustMetronomeVolume;
/* harmony export (immutable) */ __webpack_exports__["c"] = soundPlay;
/* harmony export (immutable) */ __webpack_exports__["d"] = soundStop;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__metronome_controls_js__ = __webpack_require__(5);


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

let metronomeSource, metronomeGain;
let metronomeTimer;


let overtones = [0, 1, .562, .282, .251, .282, .158, .100, .251, .002, .100];
let real = [];
let imag = [];
for(let i=0;i<overtones.length;i++){
  real[i] = overtones[i];
  imag[i] = 0;
}
let pianoTable = ctx.createPeriodicWave(real, imag);

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

function initMetronome(){
  loadSample("metronome.mp3", "metronome");
  __WEBPACK_IMPORTED_MODULE_0__metronome_controls_js__["a" /* init */]();





}

function toggleMetronome(on){
  if(on){
    startMetronome();
  }else{
    stopMetronome();
  }
}

function startMetronome(){
  playMetronome();
  tempo = document.querySelector('#speed').value;
  metronomeTimer = setTimeout( startMetronome, 60000/tempo);
}

function adjustMetronomeVolume(vol){
  metronomeGain.gain.setValueAtTime(vol,0);
}

function stopMetronome(){
  clearTimeout(metronomeTimer);
}

function playMetronome(){
  metronomeSource = ctx.createBufferSource();
  metronomeSource.buffer = buffer.metronome;
  metronomeSource.connect(metronomeGain);

  metronomeSource.start(0);
  metronomeSource.stop(ctx.currentTime+.26);
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
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__board_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__keypress_visual_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__keymap_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__sound_js__ = __webpack_require__(2);





function ready(){
  __WEBPACK_IMPORTED_MODULE_3__sound_js__["b" /* initMetronome */]();
  __WEBPACK_IMPORTED_MODULE_1__keypress_visual_js__["b" /* enableVisualClick */]();
  __WEBPACK_IMPORTED_MODULE_0__board_js__["a" /* enableOctaveChange */]();
  __WEBPACK_IMPORTED_MODULE_2__keymap_js__["a" /* signKeys */]();
  __WEBPACK_IMPORTED_MODULE_1__keypress_visual_js__["a" /* enableKeyboardPress */]();


}

document.addEventListener('DOMContentLoaded', ready);


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = enableVisualClick;
/* harmony export (immutable) */ __webpack_exports__["a"] = enableKeyboardPress;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__board_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__sound_js__ = __webpack_require__(2);



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
  __WEBPACK_IMPORTED_MODULE_1__sound_js__["c" /* soundPlay */](this);

}

function stopKey(e) {

  if(e && isPressedOnKeyboard(this)){
    return;
  };

  this.dataset.isPressed = false;

  if(e && e.type=="mouseout" && !(e.buttons & 1)){
    return;
  }
  __WEBPACK_IMPORTED_MODULE_1__sound_js__["d" /* soundStop */](this);
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
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = init;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__sound_js__ = __webpack_require__(2);


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
  } else if(this.dataset.control=="volume")
  {
    Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["a" /* adjustMetronomeVolume */])(this.value);
  }
}

function togglePower(){
  this.classList.toggle('on');
  document.querySelector('#tempo').classList.toggle('on');
  Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["e" /* toggleMetronome */])(this.classList.contains('on'));
}

/***/ })
/******/ ]);