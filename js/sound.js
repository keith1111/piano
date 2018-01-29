let STD_TUNING = 440;    // tuning A 1-st oct  std == 440Hz
let STD_KEYNUMBER_A = 46; // place of A-note 1-st oct on piano board
let SUSTAIN_TIME = 1.5;

let ctx = new AudioContext();
let buffer = {};   // buffer.metronome etc
let source ,destination ;
let osc = {};  //for 84 keys
let gainNode = {};
let startedSustain = {};
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
  osc[keyNumber].onended = testEnded;
  osc[keyNumber].keyNumber = keyNumber;

  gainNode[keyNumber] = ctx.createGain();
  gainNode[keyNumber].gain.setValueAtTime(1,0);
  gainNode[keyNumber].connect(destination);

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
  console.log("stop");

}



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
//// ����������� �������������� �����
//// ���� �� ���������, ��� ��� ����� - ������� 512, 1024 ��� 2048 ;)
//  analyser.fftSize = 2048;
//// ������� ������� ��� �������� ������
//  fFrequencyData = new Float32Array(analyser.frequencyBinCount);
//  bFrequencyData = new Uint8Array(analyser.frequencyBinCount);
//  bTimeData = new Uint8Array(analyser.frequencyBinCount);
//// �������� ������
//  analyser.getFloatFrequencyData(fFrequencyData);
//  analyser.getByteFrequencyData(bFrequencyData);
//  analyser.getByteTimeDomainData(bTimeData);
//// ������ � ��� ���� ������� fFrequencyData, bFrequencyData, bTimeData, � �������� ����� ������ ���, ��� ����������


//source.connect(filterNode);

//filterNode.connect(destination);

//let now = ctx.currentTime;
//source.start(0);