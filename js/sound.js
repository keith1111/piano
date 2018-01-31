import * as metronomeControls from './metronome-controls.js';
import * as cpuPlayer from './cpuPlayer.js';

let STD_TUNING = 440;    // tuning A 1-st oct  std == 440Hz
let STD_KEYNUMBER_A = 46; // place of A-note 1-st oct on piano board
let SUSTAIN_TIME = 2;
let tempo = 70;

let ctx = new AudioContext();
let buffer = {};   // buffer.metronome etc
let destination = ctx.destination;;
let osc = {};  //for 84 keys
let gainNode = {};
let volumeManualNode, whistleFilterStep1, whistleFilterStep2, compressor;   //  manual sound nodes
let startedSustain = {};


let oscCpu = {};
let gainNodeCpu = {};
let volumeCpu, whistleFilterCpuStep1, whistleFilterCpuStep2, compressorCpu;   //  auto sound nodes
let startedSustainCpu = {};

let metronomeSource, metronomeGain;
let metronomeTimer;
let metronomeOn = false;


let overtones = [0, 1, .562, .282, .251, .282, .158, .100, .251, .002, .100];
let real = [];
let imag = [];
for(let i=0;i<overtones.length;i++){
  real[i] = overtones[i];
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
  volumeManualNode = ctx.createGain();
  volumeManualNode.gain.setValueAtTime(1,0);

  whistleFilterStep1 = ctx.createBiquadFilter();
  whistleFilterStep1.type = 'highshelf';
  whistleFilterStep1.Q.setValueAtTime(.05,0);
  whistleFilterStep1.frequency.setValueAtTime(7000,0);
  whistleFilterStep1.gain.setValueAtTime(-45,0);

  whistleFilterStep2 = ctx.createBiquadFilter();
  whistleFilterStep2.type = 'highshelf';
  whistleFilterStep2.Q.setValueAtTime(.05,0);
  whistleFilterStep2.frequency.setValueAtTime(10000,0);
  whistleFilterStep2.gain.setValueAtTime(-70,0);

  compressor = ctx.createDynamicsCompressor();

  compressor.attack.setValueAtTime(.1,0);
  compressor.knee.setValueAtTime(12,0);
  compressor.ratio.setValueAtTime(15,0);
  compressor.release.setValueAtTime(1,0);

  volumeManualNode.connect(whistleFilterStep1);
  whistleFilterStep1.connect(whistleFilterStep2);
  whistleFilterStep2.connect(compressor);
  compressor.connect(destination);
}

function initCpuSound(){
  cpuPlayer.init();

  volumeCpu = ctx.createGain();
  volumeCpu.gain.setValueAtTime(1,0);

  whistleFilterCpuStep1 = ctx.createBiquadFilter();
  whistleFilterCpuStep1.type = 'highshelf';
  whistleFilterCpuStep1.Q.setValueAtTime(.05,0);
  whistleFilterCpuStep1.frequency.setValueAtTime(7000,0);
  whistleFilterCpuStep1.gain.setValueAtTime(-45,0);

  whistleFilterCpuStep2 = ctx.createBiquadFilter();
  whistleFilterCpuStep2.type = 'highshelf';
  whistleFilterCpuStep2.Q.setValueAtTime(.05,0);
  whistleFilterCpuStep2.frequency.setValueAtTime(10000,0);
  whistleFilterCpuStep2.gain.setValueAtTime(-70,0);

  compressorCpu = ctx.createDynamicsCompressor();

  compressorCpu.attack.setValueAtTime(.1,0);
  compressorCpu.knee.setValueAtTime(12,0);
  compressorCpu.ratio.setValueAtTime(15,0);
  compressorCpu.release.setValueAtTime(1,0);

  volumeCpu.connect(whistleFilterCpuStep1);
  whistleFilterCpuStep1.connect(whistleFilterCpuStep2);
  whistleFilterCpuStep2.connect(compressorCpu);
  compressorCpu.connect(destination);
}

export function initMetronome(){
  loadSample("metronome.mp3", "metronome");
  metronomeControls.init();
  initCpuSound();
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

function resetSustain(e){
  //console.log(ctx.currentTime - startedSustain[e.target.keyNumber]);
  startedSustain[e.target.keyNumber] = 0;
}

function resetSustainCpu(keyNumber){
  //console.log(ctx.currentTime - startedSustain[e.target.keyNumber]);
  startedSustainCpu[keyNumber] = 0;

}


function generateManualSound(keyNumber){

  let diffHalftones = keyNumber - STD_KEYNUMBER_A;
  let toneHz = Math.pow(2, diffHalftones/12) * STD_TUNING;

  if(startedSustain[keyNumber]){
    osc[keyNumber].disconnect();
  }

  osc[keyNumber] = ctx.createOscillator();
  osc[keyNumber].frequency.setValueAtTime(toneHz, 0);
  osc[keyNumber].setPeriodicWave(pianoTable);

  osc[keyNumber].onended = resetSustain;
  osc[keyNumber].keyNumber = keyNumber;

  gainNode[keyNumber] = ctx.createGain();
  gainNode[keyNumber].gain.setValueAtTime(1,0);
  if(!volumeManualNode){
    initManualSound();
  }

  gainNode[keyNumber].connect(volumeManualNode);

  osc[keyNumber].connect(gainNode[keyNumber]);
  gainNode[keyNumber].gain.linearRampToValueAtTime(0, ctx.currentTime + SUSTAIN_TIME);
  osc[keyNumber].start(0);


}

export function soundPlay(key){

  let keyTone = +key.dataset.tone;
  let oct = +key.parentElement.dataset.oct+2;
  let keyNumber = oct*12+keyTone;

  generateManualSound(keyNumber);


}

export function soundStop(key){
  let keyTone = +key.dataset.tone;
  let oct = +key.parentElement.dataset.oct+2;
  let keyNumber = oct*12+keyTone;
  
  if(!osc[keyNumber]){
    return;
  }

  startedSustain[keyNumber] = ctx.currentTime;
  osc[keyNumber].stop(ctx.currentTime+SUSTAIN_TIME);


}



export function soundPlayCpu(keyNumber, time, duration){
  let diffHalftones = keyNumber - STD_KEYNUMBER_A;
  let toneHz = Math.pow(2, diffHalftones/12) * STD_TUNING;


  oscCpu[keyNumber] = ctx.createOscillator();
  oscCpu[keyNumber].frequency.setValueAtTime(toneHz, 0);
  oscCpu[keyNumber].setPeriodicWave(pianoTable);

  //oscCpu[keyNumber].onended = resetSustainCpu(keyNumber);

  gainNodeCpu[keyNumber] = ctx.createGain();
  gainNodeCpu[keyNumber].gain.setValueAtTime(1,0);

  gainNodeCpu[keyNumber].connect(volumeCpu);

  oscCpu[keyNumber].connect(gainNodeCpu[keyNumber]);
  gainNodeCpu[keyNumber].gain.linearRampToValueAtTime(0, time + duration + SUSTAIN_TIME/4);
  oscCpu[keyNumber].start(time);
}



// let gainNode =  ctx.createGain();
//let delayNode = ctx.createDelay();


//delayNode.delayTime.setValueAtTime(.5,0);
//let convolverNode = ctx.createConvolver();   //impulse response




//  var analyser = context.createAnalyser();
//// Размерность преобразования Фурье
//// Если не понимаете, что это такое - ставьте 512, 1024 или 2048 ;)
//  analyser.fftSize = 2048;
//// Создаем массивы для хранения данных
//  fFrequencyData = new Float32Array(analyser.frequencyBinCount);
//  bFrequencyData = new Uint8Array(analyser.frequencyBinCount);
//  bTimeData = new Uint8Array(analyser.frequencyBinCount);
//// Получаем данные
//  analyser.getFloatFrequencyData(fFrequencyData);
//  analyser.getByteFrequencyData(bFrequencyData);
//  analyser.getByteTimeDomainData(bTimeData);
//// дальше у Вас есть массивы fFrequencyData, bFrequencyData, bTimeData, с которыми можно делать все, что вздумается

