let STD_TUNING = 440;    // tuning A 1-st oct  std == 440Hz
let STD_KEYNUMBER_A = 46; // place of A-note 1-st oct on piano board
let SUSTAIN_TIME = 2;

let ctx = new AudioContext();
let buffer = {};   // buffer.metronome etc
let source ,destination ;
let osc = {};  //for 84 keys
let gainNode = {};
let startedSustain = {};
destination = ctx.destination;

//let overtones = [0, .891, 1, .631, .282, .501, .224, .200, .100, .708, .447];

let overtones = [0, 1, .562, .282, .251, .282, .158, .100, .251, .002, .100];
let real = [];
let imag = [];
for(let i=0;i<overtones.length;i++){
  real[i] = overtones[i];
  imag[i] = 0;
}
let pianoTable = ctx.createPeriodicWave(real, imag);

let filterNode = ctx.createGain();
filterNode.gain.setValueAtTime(1,0);

let filter2 = ctx.createBiquadFilter();
filter2.type = 'highshelf';
filter2.Q.setValueAtTime(.05,0);
filter2.frequency.setValueAtTime(7000,0);
filter2.gain.setValueAtTime(-45,0);

let filter3 = ctx.createBiquadFilter();
filter3.type = 'highshelf';
filter3.Q.setValueAtTime(.05,0);
filter3.frequency.setValueAtTime(10000,0);
filter3.gain.setValueAtTime(-70,0);

let compressor = ctx.createDynamicsCompressor();

compressor.attack.setValueAtTime(.1,0);
compressor.knee.setValueAtTime(12,0);
compressor.ratio.setValueAtTime(15,0);
compressor.release.setValueAtTime(1,0);

console.log(compressor);


filterNode.connect(filter2);
filterNode.connect(filter3);
filter3.connect(compressor);
compressor.connect(destination);

export function initMetronome(){
  loadSample("metronome.mp3", "metronome");
}

function loadSample(filename, bufferProp){
  let req = new XMLHttpRequest();
  req.open('GET', `./sample/${filename}`, true);
  req.responseType = 'arraybuffer';
  req.onload = function(e) {
     ctx.decodeAudioData(this.response,function(decodedArrayBuffer) {
        buffer[bufferProp] = decodedArrayBuffer;

        }, function(e) {
        console.log('Error decoding file', e);
        });
  };
  req.send();
}

function testEnded(e){
  //console.log(ctx.currentTime - startedSustain[e.target.keyNumber]);
  startedSustain[e.target.keyNumber] = 0;
}


function generateSound(keyNumber){

  let diffHalftones = keyNumber - STD_KEYNUMBER_A;
  let toneHz = Math.pow(2, diffHalftones/12) * STD_TUNING;

  if(startedSustain[keyNumber]){
    osc[keyNumber].disconnect();
  }

  osc[keyNumber] = ctx.createOscillator();
  osc[keyNumber].frequency.setValueAtTime(toneHz, 0);
  osc[keyNumber].setPeriodicWave(pianoTable);

  osc[keyNumber].onended = testEnded;
  osc[keyNumber].keyNumber = keyNumber;

  gainNode[keyNumber] = ctx.createGain();
  gainNode[keyNumber].gain.setValueAtTime(1,0);
  gainNode[keyNumber].connect(filterNode);

  osc[keyNumber].connect(gainNode[keyNumber]);
  gainNode[keyNumber].gain.linearRampToValueAtTime(0, ctx.currentTime + SUSTAIN_TIME);
  osc[keyNumber].start(0);


}

export function soundPlay(key){
  source = ctx.createBufferSource();
  source.buffer = buffer.metronome;



  let keyTone = +key.dataset.tone;
  let oct = +key.parentElement.dataset.oct+2;
  let keyNumber = oct*12+keyTone;

  generateSound(keyNumber);


}

export function soundStop(key){
 // let cur = ctx.currentTime;
  let keyTone = +key.dataset.tone;
  let oct = +key.parentElement.dataset.oct+2;
  let keyNumber = oct*12+keyTone;
  let diffHalftones = keyNumber - STD_KEYNUMBER_A;

  if(!osc[keyNumber]){
    return;
  }

  startedSustain[keyNumber] = ctx.currentTime;
  osc[keyNumber].stop(ctx.currentTime+SUSTAIN_TIME);


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


//source.connect(filterNode);

//filterNode.connect(destination);

//let now = ctx.currentTime;
//source.start(0);