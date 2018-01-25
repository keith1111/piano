import {offset} from './board.js';

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

export function enableVisualClick() {

  //document.addEventListener("dragstart", ()=> false);

  let pianoKeys = document.querySelectorAll(".piano-key");
  pianoKeys.forEach(key=> key.addEventListener("mousedown", playKey));
  pianoKeys.forEach(key=> key.addEventListener("mouseup", stopKey));
  pianoKeys.forEach(key=> key.addEventListener("mouseout", stopKey));
  pianoKeys.forEach(key=> key.addEventListener("mouseenter", slideToKey));




}

export function enableKeyboardPress(){

  document.addEventListener("keydown", function(e){
    if(!KEYCODE_TONE[e.keyCode] || activatedKeys[e.keyCode] != -1){
      return;
    }
    let OCT_WIDTH = -490;
    let currentOffset = offset();
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

