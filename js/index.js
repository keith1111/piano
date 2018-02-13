import * as board from './board.js';
import * as keyPressVisual from './keypress-visual.js';
import * as keyMap from './keymap.js';
import * as sound from './sound.js';
import * as examples from './examples.js';
import * as cpuPlayer from './cpuPlayer.js';



function ready(){
  sound.initMetronome();
  keyPressVisual.enableVisualClick();
  board.enableOctaveChange();
  keyMap.signKeys();
  keyPressVisual.enableKeyboardPress();
  examples.renderExamples();
  cpuPlayer.init();


}

document.addEventListener('DOMContentLoaded', ready);
