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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__board_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__keypress_visual_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__keymap_js__ = __webpack_require__(3);




function ready(){
  __WEBPACK_IMPORTED_MODULE_1__keypress_visual_js__["b" /* enableVisualClick */]();
  __WEBPACK_IMPORTED_MODULE_0__board_js__["a" /* enableOctaveChange */]();
  __WEBPACK_IMPORTED_MODULE_2__keymap_js__["a" /* signKeys */]();
  __WEBPACK_IMPORTED_MODULE_1__keypress_visual_js__["a" /* enableKeyboardPress */]();

}

document.addEventListener('DOMContentLoaded', ready);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = enableOctaveChange;
/* harmony export (immutable) */ __webpack_exports__["b"] = offset;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__keymap_js__ = __webpack_require__(3);


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
/* harmony export (immutable) */ __webpack_exports__["b"] = enableVisualClick;
/* harmony export (immutable) */ __webpack_exports__["a"] = enableKeyboardPress;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__board_js__ = __webpack_require__(1);


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
  if(e && isPressedOnKeyboard(this)){
    return;
  };
  this.dataset.isPressed = true;

}

function stopKey(e) {
  if(e && isPressedOnKeyboard(this)){
    return;
  };
  this.dataset.isPressed = false;

}

function slideToKey(e) {
  if(e && isPressedOnKeyboard(this)){
    return;
  };
  if (e.buttons & 1) {
    playKey.call(e.target);
  }
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
  pianoKeys.forEach(key=> key.addEventListener("mouseenter", slideToKey));




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
/* 3 */
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

/***/ })
/******/ ]);