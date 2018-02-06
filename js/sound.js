import * as metronomeControls from './metronome-controls.js';
import * as cpuPlayer from './cpuPlayer.js';

let STD_TUNING = 440;    // tuning A 1-st oct  std == 440Hz
let STD_KEYNUMBER_A = 46; // place of A-note 1-st oct on piano board
export let SUSTAIN_TIME = 2;
let tempo = 70;

let ctx = new AudioContext();
let buffer = {};   // buffer.metronome etc
let destination = ctx.destination;;
let osc = {};  //for 84 keys
let gainNode = {};
let volumeManualNode, whistleFilterStep1, whistleFilterStep2, compressor;   //  manual sound nodes



let oscCpu = {};
let gainNodeCpu = {};
let volumeCpu, whistleFilterCpuStep1, whistleFilterCpuStep2, compressorCpu;   //  auto sound nodes
let lastPressCpu = {};

let metronomeSource, metronomeGain;
let metronomeTimer;
let metronomeOn = false;


let overtones = [0, 1, .562, .282, .251, .282, .158, .100, .251, .002, .100, 0,0,0,0];   // old
let overtonesLOW = [0, .089, .562, 2.818, .501, 1, .178, .355, .100, .089, .050, .022, .071, .045, .126];
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

  volumeManualNode = ctx.createGain();
  volumeManualNode.gain.setValueAtTime(1,0);

  for(let keyNumber=1; keyNumber<=84;keyNumber++){
    let diffHalftones = keyNumber - STD_KEYNUMBER_A;
    let toneHz = Math.pow(2, diffHalftones/12) * STD_TUNING;
    osc[keyNumber] = ctx.createOscillator();
    osc[keyNumber].frequency.setValueAtTime(toneHz, 0);
    osc[keyNumber].setPeriodicWave(pianoTable);
    osc[keyNumber].keyNumber = keyNumber;
    osc[keyNumber].start(0);

    gainNode[keyNumber] = ctx.createGain();
    gainNode[keyNumber].gain.setValueAtTime(0,0);

    osc[keyNumber].connect(gainNode[keyNumber]);
    gainNode[keyNumber].connect(volumeManualNode);
  }

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
  // launches after init metronome
  cpuPlayer.init();

  volumeCpu = ctx.createGain();
  volumeCpu.gain.setValueAtTime(1,0);

  for(let keyNumber=1; keyNumber<=84;keyNumber++){
    let diffHalftones = keyNumber - STD_KEYNUMBER_A;
    let toneHz = Math.pow(2, diffHalftones/12) * STD_TUNING;
    oscCpu[keyNumber] = ctx.createOscillator();
    oscCpu[keyNumber].frequency.setValueAtTime(toneHz, 0);
    oscCpu[keyNumber].setPeriodicWave(pianoTable);
    oscCpu[keyNumber].keyNumber = keyNumber;
    oscCpu[keyNumber].start(0);

    gainNodeCpu[keyNumber] = ctx.createGain();
    gainNodeCpu[keyNumber].keyNumber = keyNumber;
    gainNodeCpu[keyNumber].gain.setValueAtTime(0,0);

    oscCpu[keyNumber].connect(gainNodeCpu[keyNumber]);
    gainNodeCpu[keyNumber].connect(volumeCpu);
  }

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

function envelopePress(gainChannel, time){
  let pressTime = time || ctx.currentTime;
  let gain = gainChannel.gain;
  console.log(gainChannel);
  if(lastPressCpu[gainChannel.keyNumber] && pressTime - lastPressCpu[gainChannel.keyNumber] < SUSTAIN_TIME ){
    //envelopeRelease(gainChannel, time-0.025);
  }

  gain.cancelScheduledValues(pressTime);
  gain.setValueAtTime(1, pressTime);
  //gain.linearRampToValueAtTime(1, pressTime + 0.001);
  gain.linearRampToValueAtTime(0.75, pressTime + 0.015);
  gain.exponentialRampToValueAtTime(0.001, pressTime + SUSTAIN_TIME);
  if(time){
    lastPressCpu[gainChannel.keyNumber] = pressTime;
  }

}

function envelopeRelease(gainChannel, time){
  let unpressTime = time || ctx.currentTime;
  let gain = gainChannel.gain;
  gain.cancelScheduledValues(unpressTime);

  if(!time){
    let cur = gain.value;
    gain.setValueAtTime(cur, unpressTime);
  }
  else if(time && lastPressCpu[gainChannel.keyNumber]){
    let long = time - lastPressCpu[gainChannel.keyNumber];

    if(long < SUSTAIN_TIME){
      if(long <= 0.015){
        let cur = 0.75 + (1 - (long/0.015))*0.25;
        gain.setValueAtTime(cur, unpressTime);
      }
      else {
        let cur = 0.75 * Math.pow(1/75 , ( (long-0.015)  / (SUSTAIN_TIME-0.015) ));
        gain.setValueAtTime(cur, unpressTime);

      }
    }
  }


  gain.setTargetAtTime(0, unpressTime, 0.15);

}

export function soundPlay(key){

  let keyTone = +key.dataset.tone;
  let oct = +key.parentElement.dataset.oct+2;
  let keyNumber = oct*12+keyTone;

  if(!volumeManualNode){
    initManualSound();
  }


  envelopePress(gainNode[keyNumber]);




}

export function soundStop(key){
  let keyTone = +key.dataset.tone;
  let oct = +key.parentElement.dataset.oct+2;
  let keyNumber = oct*12+keyTone;
  
  envelopeRelease(gainNode[keyNumber]);


}



export function soundPlayCpu(keyNumber, time, duration){

  let stopTime = time + duration;
  //console.log(keyNumber + "   " + time + "   "+ stopTime);
  envelopePress(gainNodeCpu[keyNumber], time);
  envelopeRelease(gainNodeCpu[keyNumber], stopTime);


}

export function soundStopCpu(time){
  for( let key in gainNodeCpu){

      if(lastPressCpu[key]){
        envelopeRelease(gainNodeCpu[key], time);
      }

  }

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

