import * as board from './board.js';
import * as keyPressVisual from './keypress-visual.js';
import * as keyMap from './keymap.js';

function ready(){
  keyPressVisual.enableVisualClick();
  board.enableOctaveChange();
  keyMap.signKeys();
  keyPressVisual.enableKeyboardPress();

}

document.addEventListener('DOMContentLoaded', ready);
