import {toggleMetronome} from './sound.js';

export function init(){
  let controls = document.querySelectorAll(".metronome-controls");

  controls.forEach( c=> c.addEventListener("input", setControl));

  let power = document.querySelector(".power");
  power.addEventListener("click", togglePower);
}

function setControl(){
  this.setAttribute('value', this.value);
  if(this.dataset.control == "speed"){
    document.querySelector("#tempo").textContent = this.value;
  }
}

function togglePower(){
  this.classList.toggle('on');
  document.querySelector('#tempo').classList.toggle('on');
  toggleMetronome(this.classList.contains('on'));
}