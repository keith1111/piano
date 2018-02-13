import * as metronomeControls from './metronome-controls.js';


let STD_TUNING = 440;    // tuning A 1-st oct  std == 440Hz
let STD_KEYNUMBER_A = 46; // place of A-note 1-st oct on piano board
export let SUSTAIN_TIME = 2;
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


export function getTempo(){
  return tempo;
}

export function setTempo(newTempo){
  tempo = newTempo;
}

export function getTime(){
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

export function initCpuSound(name){
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

export function initMetronome(){
  loadSample("metronome.mp3", "metronome");
  metronomeControls.init();
  //initCpuSound();
}

export function startMetronome(){

  document.querySelector('#tempo').classList.add('on');
  document.querySelector('.power').classList.add('on');
  metronomeOn = true;
  playMetronome();


}

export function adjustMetronomeVolume(vol){
  metronomeGain.gain.setValueAtTime(vol,0);
}

export function stopMetronome(){

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

export function playMetronomeSingle(time){
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

export function soundPlay(key){

  let keyTone = +key.dataset.tone;
  let oct = +key.parentElement.dataset.oct+2;
  let keyNumber = oct*12+keyTone;

  if(!channels.manual.volumeManualNode){
    initManualSound();
  }


  envelopePress(channels.manual.gainNode[keyNumber]);




}

export function soundStop(key){
  let keyTone = +key.dataset.tone;
  let oct = +key.parentElement.dataset.oct+2;
  let keyNumber = oct*12+keyTone;
  
  envelopeRelease(channels.manual.gainNode[keyNumber]);


}



export function soundPlayCpu(name, keyNumber, time, duration){

  let stopTime = time + duration;

  envelopePress(channels.cpu[name].gainNode[keyNumber], time, name);
  envelopeRelease(channels.cpu[name].gainNode[keyNumber], stopTime);


}

export function soundStopCpu(name, time){
  for( let keyNumber in channels.cpu[name].gainNode){

      if(channels.cpu[name].lastPress[keyNumber]){
        envelopeRelease(channels.cpu[name].gainNode[keyNumber], time);
      }

  }

}






