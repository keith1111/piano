import {soundPlayCpu, soundStopCpu, getTempo, playMetronomeSingle, getTime, SUSTAIN_TIME} from './sound.js';
import * as sequenceParser from './sequenceParser.js';
import {examples} from './examples.js';


let NOTES = {
  'c': 1,
  'c#': 2,
  'db': 2,
  'd': 3,
  'd#': 4,
  'eb': 4,
  'e': 5,
  'f': 6,
  'f#': 7,
  'gb': 7,
  'g': 8,
  'g#': 9,
  'ab': 9,
  'a': 10,
  'a#': 11,
  'hb': 11,
  'h': 12
};
let SILENCE_INTRO_TICKS = 4;

let PROCESSING_TIME = 1; // seconds


export function init(){
  document.querySelector(".player .start").addEventListener("click", takeNotes);
}


function takeNotes() {

  let selected = document.querySelector('#examples').value;
  let notesString = examples[selected];
  playCommands(sequenceParser.parse(notesString));
}


function playCommands(sequenceObj) {

  let commands = sequenceObj.commands;
  let timings = sequenceObj.timings;
  let oct = 1;
  let outerTemp = getTempo();


  let stdInnerTemp = outerTemp;
  let currentInnerTemp;
  let currentSpeed = 1;

  let keyEnd = {};
  let notesCount = 0;

  timings = timings.map( a=> {
    return {
      duration: a.end-a.start,
      start: a.start+SILENCE_INTRO_TICKS,
      end: a.end+SILENCE_INTRO_TICKS

    }
  });

  let ctxTime = getTime();
  let startTime = ctxTime + PROCESSING_TIME;

  let breakPoints = [0];    // tacts in each tempo
  let breakTime = [0];      // seconds when change tempo
  let tempoZone = 0;        // increase in each tempo change
  let q = [60/outerTemp];   //  4th note in seconds
  let qSustain = SUSTAIN_TIME/q;


  for (let i = 0; i < commands.length; i++) {

    if (!timings[i].duration) {
      /* tempo change */
      if (commands[i].startsWith('t')) {
        let newInnerTemp = parseInt(commands[i].slice(1));
        if(!notesCount){
          stdInnerTemp = newInnerTemp;
        }
        if(timings[i].start > SILENCE_INTRO_TICKS){
          let prevTempoSeconds = (timings[i].start - breakPoints[breakPoints.length-1])*q[tempoZone];

          breakPoints.push(timings[i].start);

          breakTime.push(breakTime[breakTime.length-1] + prevTempoSeconds);
          tempoZone++;
          q.push(60/(outerTemp*newInnerTemp/stdInnerTemp));
        }
        currentInnerTemp = newInnerTemp;
        currentSpeed = newInnerTemp/stdInnerTemp;

      }
      /* octave change */
      else if (commands[i].startsWith('o')) {
        let nextOct = parseInt(commands[i].slice(1));
        if (!isNaN(nextOct)) {
          oct = nextOct;

        }
        else if (commands[i][1] == '-') {
          oct--;
        } else if (commands[i][1] == '+') {
          oct++;
        }
      }
      /* chord mode */
      else if(commands[i] == '_'){
        let chordOct = oct;
        while(true){
          i++;
          if(commands[i] == '_'){
            break;
          }
          while(!NOTES[commands[i]]){
            if(commands[i].startsWith('+')){
              chordOct++;
            }
            else if(commands[i].startsWith('-')) {
              chordOct--;
            }
            else {
              console.log("unknown command");
              break;
            }
            commands[i] = commands[i].slice(1);
          }
          let key = NOTES[commands[i]] + (chordOct+2) * 12;
          notesCount++;

          let fingerRaiseTime = 0.04;
          if(keyEnd[key] && keyEnd[key] >= timings[i].start){      // duplicate note
            fingerRaiseTime = 0.08;
          }

          keyEnd[key] = timings[i].end + qSustain;
          soundPlayCpu(key, startTime + breakTime[tempoZone] + (timings[i].start - breakPoints[tempoZone])*q[tempoZone], timings[i].duration*q[tempoZone] - fingerRaiseTime);


        }

      }
      else if(commands[i] == '@'){
        soundStopCpu(startTime+ breakTime[tempoZone] +  timings[i].start*q[tempoZone]);
      }
    }

    else {
      let key = NOTES[commands[i]] + (oct+2) * 12;
      notesCount++;

      let fingerRaiseTime = 0.04;
      if(keyEnd[key] && keyEnd[key] >= timings[i].start){      // duplicate note
        fingerRaiseTime = 0.08;
      }

      let pressTime = startTime + breakTime[tempoZone] + (timings[i].start - breakPoints[tempoZone])*q[tempoZone];
      let duration = timings[i].duration*q[tempoZone] - fingerRaiseTime;

      /* to prevent silence instead of 64th notes */
      if(duration <= 0.04){
        duration = 0.04;
      }

      keyEnd[key] = timings[i].end + qSustain;

      soundPlayCpu(key, pressTime , duration);
    }

  }

  let lastNote = Math.floor(timings[timings.length-1].end);

  breakPoints.push(lastNote);


  for(let tzone=0; tzone<breakPoints.length ;tzone++){
    for(let j=breakPoints[tzone]; j<breakPoints[tzone+1]; j++){
      let metronomeHitTime = startTime+breakTime[tzone]+(j-breakPoints[tzone])*q[tzone];
      playMetronomeSingle(metronomeHitTime);
    }
  }





}

