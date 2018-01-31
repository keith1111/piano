import {startMetronome, stopMetronome, adjustMetronomeVolume, setTempo} from './sound.js';

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
    setTempo(this.value);
  } else if(this.dataset.control=="volume")
  {
    adjustMetronomeVolume(this.value);
  }
}

function togglePower(){
  if(!this.classList.contains('on')){
    document.querySelector('#tempo').classList.add('on');
    this.classList.add('on');
    startMetronome();
  }else{
    document.querySelector('#tempo').classList.remove('on');
    this.classList.remove('on');
    stopMetronome();
  }


}