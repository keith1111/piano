import * as board from './board.js';

function ready(){
  let offset = board.offset(100);
  console.log(offset);

}

document.addEventListener('DOMContentLoaded', ready);
