import * as board from './board.js';
import * as keyPressVisual from './keypress-visual.js';

function ready(){
  keyPressVisual.enableVisualClick();
  board.enableOctaveChange();

}

document.addEventListener('DOMContentLoaded', ready);
