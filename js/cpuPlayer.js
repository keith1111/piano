import {soundPlayCpu, soundStopCpu, getTempo, playMetronomeSingle, getTime} from './sound.js';
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

let PROCESSING_TIME = 1; // seconds

export function init(){
  document.querySelector(".example .start").addEventListener("click", takeNotes);
}


function takeNotes() {
  let notesString = examples[1];

  playCommands(sequenceParser.parse(notesString));
}


function playCommands(sequenceObj) {

  let commands = sequenceObj.commands;
  let timings = sequenceObj.timings;
  let oct = 1;
  let outerTemp = getTempo();
  let q = 60/outerTemp;     //  4th note of outer tempo in seconds
  let stdInnerTemp = outerTemp;
  let currentInnerTemp = outerTemp;



  timings = timings.map( a=> {
    return {
      start: a.start+4,
      end: a.end+4,
      duration: a.end-a.start
    }
  });

  let ctxTime = getTime();
  let startTime = ctxTime + PROCESSING_TIME;

  let lastTact = Math.floor(timings[timings.length-1].end)+1;
  for(let i=0; i<lastTact; i++){
    playMetronomeSingle(startTime+i*q);
  }

  for (let i = 0; i < commands.length; i++) {

    if (!timings[i].duration) {
      if (commands[i].startsWith('t')) {
        let newInnerTemp = parseInt(commands[i].slice(1));
        if(stdInnerTemp == outerTemp){
          stdInnerTemp = newInnerTemp;
        }
        currentInnerTemp = newInnerTemp;
      }
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
      else if(commands[i] == '@'){
        soundStopCpu(startTime+timings[i].start*q);
      }
    }

    else {
      let key = NOTES[commands[i]] + (oct+2) * 12;
      soundPlayCpu(key, startTime + timings[i].start*q, timings[i].duration*q);
    }

  }




}

