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
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SUSTAIN_TIME; });
/* harmony export (immutable) */ __webpack_exports__["c"] = getTempo;
/* harmony export (immutable) */ __webpack_exports__["h"] = setTempo;
/* harmony export (immutable) */ __webpack_exports__["d"] = getTime;
/* harmony export (immutable) */ __webpack_exports__["e"] = initCpuSound;
/* harmony export (immutable) */ __webpack_exports__["f"] = initMetronome;
/* harmony export (immutable) */ __webpack_exports__["m"] = startMetronome;
/* harmony export (immutable) */ __webpack_exports__["b"] = adjustMetronomeVolume;
/* harmony export (immutable) */ __webpack_exports__["n"] = stopMetronome;
/* harmony export (immutable) */ __webpack_exports__["g"] = playMetronomeSingle;
/* harmony export (immutable) */ __webpack_exports__["i"] = soundPlay;
/* harmony export (immutable) */ __webpack_exports__["k"] = soundStop;
/* harmony export (immutable) */ __webpack_exports__["j"] = soundPlayCpu;
/* harmony export (immutable) */ __webpack_exports__["l"] = soundStopCpu;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__metronome_controls_js__ = __webpack_require__(6);



let STD_TUNING = 440;    // tuning A 1-st oct  std == 440Hz
let STD_KEYNUMBER_A = 46; // place of A-note 1-st oct on piano board
let SUSTAIN_TIME = 2;
let tempo = 70;

let ctx = new AudioContext();
let buffer = {};   // buffer.metronome etc
let destination = ctx.destination;;

let cpuChannel = 1;

/* all sound generators will be here */
let channels = {
  manual: {},
  cpu: {}
};

console.log(channels);

channels.manual.osc = {};  //for 84 keys
channels.manual.gainNode = {};
 //  manual sound nodes

let metronomeSource, metronomeGain;
let metronomeTimer;
let metronomeOn = false;


//let overtones = [0, 1, .562, .282, .251, .282, .158, .100, .251, .002, .100, 0,0,0,0];   // old
//let overtonesLOW = [0, .089, .562, 2.818, .501, 1, .178, .355, .100, .089, .050, .022, .071, .045, .126];
let overtones1 = [1.0, 0.399064778, 0.229404484, 0.151836061, 0.196754229, 0.093742264, 0.060871957,
  0.138605419, 0.010535002, 0.071021868, 0.029954614, 0.051299684, 0.055948288,   0.066208224, 0.010067391, 0.00753679,
  0.008196947, 0.012955577, 0.007316738,   0.006216476, 0.005116215, 0.006243983,
  0.002860679, 0.002558108, 0.0, 0.001650392];
let real = [];
let realLOW = [];
let imag = [];
for(let i=0;i<overtones1.length;i++){
  real[i] = overtones1[i];
  //realLOW[i] = overtonesLOW[i];
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
  // (84 x (osc -> gain)  )   ->   volumeManualNode ->  filter1 -> filter2 -> compressor -> output

  channels.manual.volumeManualNode = ctx.createGain();
  channels.manual.volumeManualNode.gain.setValueAtTime(1,0);

  for(let keyNumber=1; keyNumber<=84;keyNumber++){
    let diffHalftones = keyNumber - STD_KEYNUMBER_A;
    let toneHz = Math.pow(2, diffHalftones/12) * STD_TUNING;
    channels.manual.osc[keyNumber] = ctx.createOscillator();
    channels.manual.osc[keyNumber].frequency.setValueAtTime(toneHz, 0);
    channels.manual.osc[keyNumber].setPeriodicWave(pianoTable);
    channels.manual.osc[keyNumber].keyNumber = keyNumber;
    channels.manual.osc[keyNumber].start(0);

    channels.manual.gainNode[keyNumber] = ctx.createGain();
    channels.manual.gainNode[keyNumber].gain.setValueAtTime(0,0);

    channels.manual.osc[keyNumber].connect(channels.manual.gainNode[keyNumber]);
    channels.manual.gainNode[keyNumber].connect(channels.manual.volumeManualNode);
  }

  channels.manual.whistleFilterStep1 = ctx.createBiquadFilter();
  channels.manual.whistleFilterStep1.type = 'highshelf';
  channels.manual.whistleFilterStep1.Q.setValueAtTime(.05,0);
  channels.manual.whistleFilterStep1.frequency.setValueAtTime(7000,0);
  channels.manual.whistleFilterStep1.gain.setValueAtTime(-45,0);

  channels.manual.whistleFilterStep2 = ctx.createBiquadFilter();
  channels.manual.whistleFilterStep2.type = 'highshelf';
  channels.manual.whistleFilterStep2.Q.setValueAtTime(.05,0);
  channels.manual.whistleFilterStep2.frequency.setValueAtTime(10000,0);
  channels.manual.whistleFilterStep2.gain.setValueAtTime(-70,0);

  channels.manual.compressor = ctx.createDynamicsCompressor();

  channels.manual.compressor.attack.setValueAtTime(.1,0);
  channels.manual.compressor.knee.setValueAtTime(12,0);
  channels.manual.compressor.ratio.setValueAtTime(15,0);
  channels.manual.compressor.release.setValueAtTime(1,0);

  channels.manual.volumeManualNode.connect(channels.manual.whistleFilterStep1);
  channels.manual.whistleFilterStep1.connect(channels.manual.whistleFilterStep2);
  channels.manual.whistleFilterStep2.connect(channels.manual.compressor);
  channels.manual.compressor.connect(destination);
}

function initCpuSound(name){
  // cpu channel name from cpuPlayer

  channels.cpu[name] = {};
  channels.cpu[name].volumeCpuNode = ctx.createGain();
  channels.cpu[name].volumeCpuNode.gain.setValueAtTime(1,0);
  channels.cpu[name].osc = {};
  channels.cpu[name].gainNode = {};
  channels.cpu[name].lastPress = {};

  for(let keyNumber=1; keyNumber<=84;keyNumber++){
    let diffHalftones = keyNumber - STD_KEYNUMBER_A;
    let toneHz = Math.pow(2, diffHalftones/12) * STD_TUNING;
    channels.cpu[name].osc[keyNumber] = ctx.createOscillator();
    channels.cpu[name].osc[keyNumber].frequency.setValueAtTime(toneHz, 0);
    channels.cpu[name].osc[keyNumber].setPeriodicWave(pianoTable);
    channels.cpu[name].osc[keyNumber].keyNumber = keyNumber;
    channels.cpu[name].osc[keyNumber].start(0);

    channels.cpu[name].gainNode[keyNumber] = ctx.createGain();
    channels.cpu[name].gainNode[keyNumber].keyNumber = keyNumber;
    channels.cpu[name].gainNode[keyNumber].gain.setValueAtTime(0,0);

    channels.cpu[name].osc[keyNumber].connect(channels.cpu[name].gainNode[keyNumber]);
    channels.cpu[name].gainNode[keyNumber].connect(channels.cpu[name].volumeCpuNode);
  }

  channels.cpu[name].whistleFilterStep1 = ctx.createBiquadFilter();
  channels.cpu[name].whistleFilterStep1.type = 'highshelf';
  channels.cpu[name].whistleFilterStep1.Q.setValueAtTime(.05,0);
  channels.cpu[name].whistleFilterStep1.frequency.setValueAtTime(7000,0);
  channels.cpu[name].whistleFilterStep1.gain.setValueAtTime(-45,0);

  channels.cpu[name].whistleFilterStep2 = ctx.createBiquadFilter();
  channels.cpu[name].whistleFilterStep2.type = 'highshelf';
  channels.cpu[name].whistleFilterStep2.Q.setValueAtTime(.05,0);
  channels.cpu[name].whistleFilterStep2.frequency.setValueAtTime(10000,0);
  channels.cpu[name].whistleFilterStep2.gain.setValueAtTime(-70,0);

  channels.cpu[name].compressor = ctx.createDynamicsCompressor();

  channels.cpu[name].compressor.attack.setValueAtTime(.1,0);
  channels.cpu[name].compressor.knee.setValueAtTime(12,0);
  channels.cpu[name].compressor.ratio.setValueAtTime(15,0);
  channels.cpu[name].compressor.release.setValueAtTime(1,0);

  channels.cpu[name].volumeCpuNode.connect(channels.cpu[name].whistleFilterStep1);
  channels.cpu[name].whistleFilterStep1.connect(channels.cpu[name].whistleFilterStep2);
  channels.cpu[name].whistleFilterStep2.connect(channels.cpu[name].compressor);
  channels.cpu[name].compressor.connect(destination);
}

function initMetronome(){
  loadSample("metronome.mp3", "metronome");
  __WEBPACK_IMPORTED_MODULE_0__metronome_controls_js__["a" /* init */]();
  //initCpuSound();
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

function envelopePress(gainChannel, time, name){
  let pressTime = time || ctx.currentTime;
  let gain = gainChannel.gain;

  gain.cancelAndHoldAtTime(pressTime);
  gain.setValueAtTime(0, pressTime);
  gain.linearRampToValueAtTime(1, pressTime + 0.005);
  gain.setValueAtTime(1, pressTime + 0.005);
  gain.linearRampToValueAtTime(0.55, pressTime + 0.015);
  gain.setValueAtTime(0.55, pressTime + 0.015);

  gain.exponentialRampToValueAtTime(0.001, pressTime + SUSTAIN_TIME);

  if(time){
    channels.cpu[name].lastPress[gainChannel.keyNumber] = pressTime;
  }

}

function envelopeRelease(gainChannel, time){
  let unpressTime = time || ctx.currentTime;
  let gain = gainChannel.gain;
  gain.cancelAndHoldAtTime(unpressTime);

  gain.setTargetAtTime(0, unpressTime, SUSTAIN_TIME/ Math.log(0.55/0.001));

}

function soundPlay(key){

  let keyTone = +key.dataset.tone;
  let oct = +key.parentElement.dataset.oct+2;
  let keyNumber = oct*12+keyTone;

  if(!channels.manual.volumeManualNode){
    initManualSound();
  }


  envelopePress(channels.manual.gainNode[keyNumber]);




}

function soundStop(key){
  let keyTone = +key.dataset.tone;
  let oct = +key.parentElement.dataset.oct+2;
  let keyNumber = oct*12+keyTone;
  
  envelopeRelease(channels.manual.gainNode[keyNumber]);


}



function soundPlayCpu(name, keyNumber, time, duration){

  let stopTime = time + duration;

  envelopePress(channels.cpu[name].gainNode[keyNumber], time, name);
  envelopeRelease(channels.cpu[name].gainNode[keyNumber], stopTime);


}

function soundStopCpu(name, time){
  for( let keyNumber in channels.cpu[name].gainNode){

      if(channels.cpu[name].lastPress[keyNumber]){
        envelopeRelease(channels.cpu[name].gainNode[keyNumber], time);
      }

  }

}








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
  ' =solo t132 o2 16' +
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
  ' ab + c f d f ab +c - h +c -f gd 4 e',


  '2': '=chords t80 o0 4 _c e g h_  _c e g h_ _ a +c e g_ _ a +c e g_ _d f a +c_ _d f a +c_ _g f +c d_ _g h +d c_',

  '3' : '=solo t60 o-1 4 cdef %3  cde% 4 f g'

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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__cpuPlayer_js__ = __webpack_require__(7);









function ready(){
  __WEBPACK_IMPORTED_MODULE_3__sound_js__["f" /* initMetronome */]();
  __WEBPACK_IMPORTED_MODULE_1__keypress_visual_js__["b" /* enableVisualClick */]();
  __WEBPACK_IMPORTED_MODULE_0__board_js__["a" /* enableOctaveChange */]();
  __WEBPACK_IMPORTED_MODULE_2__keymap_js__["a" /* signKeys */]();
  __WEBPACK_IMPORTED_MODULE_1__keypress_visual_js__["a" /* enableKeyboardPress */]();
  __WEBPACK_IMPORTED_MODULE_4__examples_js__["b" /* renderExamples */]();
  __WEBPACK_IMPORTED_MODULE_5__cpuPlayer_js__["a" /* init */]();


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
  __WEBPACK_IMPORTED_MODULE_1__sound_js__["i" /* soundPlay */](this);

}

function stopKey(e) {

  if(e && isPressedOnKeyboard(this)){
    return;
  };

  this.dataset.isPressed = false;

  if(e && e.type=="mouseout" && !(e.buttons & 1)){
    return;
  }
  __WEBPACK_IMPORTED_MODULE_1__sound_js__["k" /* soundStop */](this);
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
    Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["h" /* setTempo */])(this.value);
  } else if(this.dataset.control=="volume")
  {
    Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["b" /* adjustMetronomeVolume */])(this.value);
  }
}

function togglePower(){
  if(!this.classList.contains('on')){
    document.querySelector('#tempo').classList.add('on');
    this.classList.add('on');
    Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["m" /* startMetronome */])();
  }else{
    document.querySelector('#tempo').classList.remove('on');
    this.classList.remove('on');
    Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["n" /* stopMetronome */])();
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


function playCommands(sequence) {

  let ctxTime = Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["d" /* getTime */])();
  let startTime = ctxTime + PROCESSING_TIME;

  for(let ch = 0;ch< sequence.length;ch++ ){

    let commands = sequence[ch].commands;
    let timings = sequence[ch].timings;

    let name = sequence[ch].name;
    Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["e" /* initCpuSound */])(name);


    let oct = 1;
    let outerTemp = Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["c" /* getTempo */])();


    let stdInnerTemp = outerTemp;
    let currentInnerTemp;
    let currentSpeed = 1;

    let keyEnd = {};
    let notesCount = 0;

    timings = timings.map( a=> {
      return {
        duration: a.end-a.start,
        start: a.start+SILENCE_INTRO_TICKS,
        end: a.end+SILENCE_INTRO_TICKS

      }
    });

    let breakPoints = [0];    // tacts in each tempo
    let breakTime = [0];      // seconds when change tempo
    let tempoZone = 0;        // increase in each tempo change
    let q = [60/outerTemp];   //  4th note in seconds
    let qSustain = __WEBPACK_IMPORTED_MODULE_0__sound_js__["a" /* SUSTAIN_TIME */]/q;


    for (let i = 0; i < commands.length; i++) {

      if (!timings[i].duration) {
        /* tempo change */
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
        /* octave change */
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
        /* chord mode */
        else if(commands[i] == '_'){
          let chordOct = oct;
          while(true){
            i++;
            if(commands[i] == '_'){
              break;
            }
            while(!NOTES[commands[i]]){
              if(commands[i].startsWith('+')){
                chordOct++;
              }
              else if(commands[i].startsWith('-')) {
                chordOct--;
              }
              else {
                console.log("unknown command");
                break;
              }
              commands[i] = commands[i].slice(1);
            }
            let key = NOTES[commands[i]] + (chordOct+2) * 12;
            notesCount++;

            let fingerRaiseTime = 0.04;
            if(keyEnd[key] && keyEnd[key] >= timings[i].start){      // duplicate note
              fingerRaiseTime = 0.08;
            }

            let pressTime = startTime + breakTime[tempoZone] + (timings[i].start - breakPoints[tempoZone])*q[tempoZone];
            let duration = timings[i].duration*q[tempoZone] - fingerRaiseTime;

            if(duration <= 0.04){
              duration = 0.04;
            }

            keyEnd[key] = timings[i].end + qSustain;
            Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["j" /* soundPlayCpu */])(name, key, pressTime , duration);


          }

        }
        else if(commands[i] == '@'){
          let stopTime = startTime+ breakTime[tempoZone] + timings[i].start*q[tempoZone];
          Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["l" /* soundStopCpu */])(name, stopTime);
        }
      }

      else {
        let key = NOTES[commands[i]] + (oct+2) * 12;
        notesCount++;

        let fingerRaiseTime = 0.04;
        if(keyEnd[key] && keyEnd[key] >= timings[i].start){      // duplicate note
          fingerRaiseTime = 0.08;
        }

        let pressTime = startTime + breakTime[tempoZone] + (timings[i].start - breakPoints[tempoZone])*q[tempoZone];
        let duration = timings[i].duration*q[tempoZone] - fingerRaiseTime;

        /* to prevent silence instead of 64th notes */
        if(duration <= 0.04){
          duration = 0.04;
        }

        keyEnd[key] = timings[i].end + qSustain;

        Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["j" /* soundPlayCpu */])(name, key, pressTime , duration);
      }

    }

    let lastNote = Math.floor(timings[timings.length-1].end);

    breakPoints.push(lastNote);

    if(ch == 0 ){
      for(let tzone=0; tzone<breakPoints.length ;tzone++){
        for(let j=breakPoints[tzone]; j<breakPoints[tzone+1]; j++){
          let metronomeHitTime = startTime+breakTime[tzone]+(j-breakPoints[tzone])*q[tzone];
          Object(__WEBPACK_IMPORTED_MODULE_0__sound_js__["g" /* playMetronomeSingle */])(metronomeHitTime);
        }
      }
    }
  }





}



/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = parse;
function parse(sheet){

  let sequence = [];

  let commentRegex = new RegExp('\\*.\*\?\\*', 'g');      //  remove all between    *    ...   *
  sheet = sheet.replace(commentRegex, '');

  sheet += " @";  // end

  let channels = sheet.trim().split("@")
      .map(text => text.trim())
      .filter(text => text.startsWith("="));
  //console.log("channels" + channels.length);

  for(let x=0; x<channels.length;x++){

    let channelObj = {};
    let quanted = channels[x].split(" ");
    channelObj.name = quanted[0].slice(1);

    let partSheet = quanted.slice(1).join(" ") + " @";        // removing name
    console.log(partSheet.length);
    let pos = 0;
    let next = 0;
    let dur = 4;
    let modifierDur = 1;
    let time = 0;
    let commands = [];
    let timings = [];    //{start: 0, end: 1} in 4th notes

    /*  parsing here    */
    while(true) {
      let c = partSheet[pos];

      /*    tempo change , octave change :     t60  o2     */
      if (c == "t" || c == 'o') {
        next = partSheet.slice(pos).indexOf(" ");
        let command = partSheet.substr(pos, next);


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
      else if (c == '+') {
        timings.push({start: time, end: time});
        commands.push('o+');
        pos ++;
      }
      else if(c == '%'){
        if(modifierDur == 1){
          next = partSheet.slice(pos).indexOf(" ");
          let number = parseInt(partSheet.slice(pos+1));
          modifierDur = number / (number-1);
          pos += next+1;
        }else{
          modifierDur = 1;
          pos++;
        }
      }

      /* note detect mode :   c d e f g a h; cb c# ; cdc ebdbc f#gh ;   pause detect : p  */
      else if ('cdefgahp'.indexOf(c) != -1) {
        let quitNoteMode = new RegExp("[^cdefgah#bp ]");
        quitNoteMode.lastIndex = pos;   // start scan note-adding mode sequence
        next = pos + quitNoteMode.exec(partSheet.slice(pos)).index;     // detect quit of note-adding mode
        /* buffer */
        let command = "";
        for(let i=pos; i<next; i++){
          if('cdefgah'.indexOf(partSheet[i]) != -1){

            if(!command){
              /* buffer empty - add note */
            command = partSheet[i];
            }else{
              /* note already exists in buffer  - play, clear buffer, add new note  */
              commands.push(command);
              timings.push({start: time, end: time + 4 / (dur * modifierDur)});
              time += 4 / (dur * modifierDur);
              command = partSheet[i];
            }
          }
          else if (command && '#b'.indexOf(partSheet[i]) != -1){
            /* note already exists in buffer - apply halftone up/down, play note, clear buffer, ready for next note  */
            command += partSheet[i];
            commands.push(command);
            timings.push({start: time, end: time + 4 / (dur * modifierDur)});
            time += 4 / (dur * modifierDur);
            command = "";
          }
          else if (partSheet[i] == 'p'){
            /* pause - add silence (no commands for pause dur)*/
            time += 4/(dur * modifierDur);
          }

          else if (partSheet[i] != ' '){
            /*  error  */
            console.log("Unknown command:" + partSheet[i]);
            console.log(partSheet.slice(pos, pos+10));
            commands.push("@");
            timings.push({start:time, end:time});
            break;
          }

          if(i == next-1 && command){
            commands.push(command);
            timings.push({start: time, end: time + 4 / (dur * modifierDur)});
            time += 4 / (dur * modifierDur);
          }
        }
        pos = next;

      }

      /*  dot -  last note duration x1.5  */
      else if(c == '.'){

        let lastDur = timings[timings.length-1].end - timings[timings.length-1].start;
        timings[timings.length-1].end += lastDur/2;
        time += lastDur/2;
        pos++;
      }
      else if (!isNaN(parseInt(c))) {
        next = partSheet.slice(pos).indexOf(" ");
        let newDur = +partSheet.substr(pos, next);
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
          if('cdefgah#b '.indexOf(partSheet[currentPos]) == -1){
            break;
          }

          if('cdefgah'.indexOf(partSheet[currentPos]) != -1){
            if(noteToFind){
              break;
            }
            else{
              noteToFind = partSheet[currentPos];
            }
          }else if('#b'.indexOf(partSheet[currentPos]) !=- 1){
            if(noteToFind){
              noteToFind += partSheet[currentPos];
            }
            break;
          }

        }

        let noteIndex = commands.lastIndexOf(noteToFind);
        time += 4/(dur * modifierDur);
        timings[noteIndex].end = time;

        pos = currentPos;
      }

      /*   enter chord mode   */
      else if (c == '_'){
        console.log(pos);
        function octaveModifier(note){
          let [modifier, k] = octaveChange >= 0 ? ["+", 1] : ["-",-1];
          let newNote = note;
          for(let i=0; i<Math.abs(octaveChange);i++){
            newNote = modifier + newNote;
          }
          octaveChange = 0;
          return newNote;

        }

        let next = pos + partSheet.slice(pos+1).indexOf('_')+1;    // chord mode exit
        let chord = [];      // to push notes
        let octaveChange = 0;
        console.log(partSheet.slice(pos+1));
        //console.log(partSheet.slice(pos+1, next));
        let note = "";

        for(let i=pos+1; i<next; i++){



          if('cdefgah'.indexOf(partSheet[i]) != -1){
            if(!note){
              /* buffer empty - add note */
              note = partSheet[i];
            }else{
              /* note already exists in buffer  - add to chord, clear buffer, look new note  */
              chord.push(octaveModifier(note));
              //timings.push({start: time, end: time + 4 / dur});
              note = partSheet[i];
            }
          }
          else if (note && '#b'.indexOf(partSheet[i]) != -1){
            /* note already exists in buffer - apply halftone up/down, add note to chord, clear buffer, ready for next note  */
            note += partSheet[i];
            chord.push(octaveModifier(note));
            //timings.push({start: time, end: time + 4 / dur});
            note = "";
          }
          else if(partSheet[i] == '+'){
            if(note){
              chord.push(octaveModifier(note));
              note = "";
            }
            octaveChange++;

          }
          else if(partSheet[i] == '-'){
            if(note){
              chord.push(octaveModifier(note));
              note = "";
            }
            octaveChange--;
          }


          else if (partSheet[i] != ' '){
            /*  error  */
            console.log("Unknown command:" + partSheet[i]);
            console.log(partSheet.slice(pos, pos+10));
            commands.push("@");
            timings.push({start:time, end:time});
            break;
          }
          if(i == next-1 && note){
            chord.push(note);
          }

        }
        /* enter chord mode in player */
        commands.push("_");
        timings.push({start: time, end: time});
        for(let i=0; i<chord.length;i++){
          commands.push(chord[i]);
          timings.push({start: time, end: time + 4/(dur * modifierDur)});
        }

        /* exit chord mode in player */
        time += 4/(dur * modifierDur);
        commands.push("_");
        timings.push({start: time, end: time});
        pos = next+1;

      }

      else if(c == '@'){
        commands.push("@");
        timings.push({start:time, end:time});
        break;
      }
      else{
        console.log("Unknown command:" + c);
        console.log(partSheet.slice(pos, pos+10));
        commands.push("@");
        timings.push({start:time, end:time});
        break;
      }

      if(pos>=partSheet.length){
        break;
      }
    }

    console.log(commands);
    console.log(timings.map ((a,i)=> Object.assign(a,{command: commands[i]})) );

    channelObj.commands = commands;
    channelObj.timings = timings;

    sequence.push(channelObj);
  }



  return sequence;
}

/***/ })
/******/ ]);