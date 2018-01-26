let STD_TUNING = 440;    // tuning A 1-st oct  std == 440Hz
let STD_KEYNUMBER_A = 46; // place of A-note 1-st oct on piano board
let ctx = new AudioContext();
let buffer = {};   // buffer.metronome etc
let source ,destination ;
let osc = {};  //for 84 keys
let gainNode = {};
destination = ctx.destination;



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

function generateSound(keyNumber){

  let diffHalftones = keyNumber - STD_KEYNUMBER_A;
  let toneHz = Math.pow(2, diffHalftones/12) * STD_TUNING;

  osc[keyNumber] = ctx.createOscillator();
  osc[keyNumber].frequency.setValueAtTime(toneHz, 0);

  gainNode[keyNumber] = ctx.createGain();
  osc[keyNumber].connect(gainNode[keyNumber]);

  gainNode[keyNumber].connect(destination);
  gainNode[keyNumber].gain.setValueAtTime(.4,ctx.currentTime);
  gainNode[keyNumber].gain.linearRampToValueAtTime(0, ctx.currentTime + 2);


  osc[keyNumber].start(0);
  console.log(keyNumber);
}

export function soundPlay(key){
  source = ctx.createBufferSource();
  source.buffer = buffer.metronome;



 // let gainNode =  ctx.createGain();
  //let delayNode = ctx.createDelay();


  //delayNode.delayTime.setValueAtTime(.5,0);
  //let convolverNode = ctx.createConvolver();   //impulse response

  //let filterNode = ctx.createBiquadFilter();
  //filterNode.type = "peaking";
  //filterNode.frequency.setValueAtTime(64,0);
  //filterNode.Q.setValueAtTime(10,0);
  //filterNode.gain.setValueAtTime(35,0);
  //console.log(filterNode);


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
  let keyTone = +key.dataset.tone;
  let oct = +key.parentElement.dataset.oct+2;
  let keyNumber = oct*12+keyTone;


  generateSound(keyNumber);






  //source.stop(now+1);

  //console.log(toneHz);
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
  osc[keyNumber].stop(ctx.currentTime+2);

}