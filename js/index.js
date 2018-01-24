import * as board from './board.js';
import * as keyPressVisual from './keypress-visual.js';

function ready(){
  keyPressVisual.enableVisualClick();

}

document.addEventListener('DOMContentLoaded', ready);
