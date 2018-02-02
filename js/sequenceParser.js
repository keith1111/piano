export function parse(sheet){

  let commentRegex = new RegExp('\\*.\*\?\\*', 'g');      //  remove all between    *    ...   *
  sheet = sheet.replace(commentRegex, '');

  sheet += " @";  // end

  let pos = 0;
  let next = 0;
  let dur = 4;
  let time = 0;
  let commands = [];
  let timings = [];    //{start: 0, end: 1} in 4th notes


  while(true) {
    let c = sheet[pos];
    /*    tempo change , octave change :     t60  o2     */
    if (c == "t" || c == 'o') {
      next = sheet.slice(pos).indexOf(" ");
      let command = sheet.substr(pos, next);


      timings.push({start: time, end: time});
      commands.push(command);
      pos += next+1;
    }
    /*  1 octave down    :     -    */
    else if (c == '-') {
      timings.push({start: time, end: time});
      commands.push('o-');
      pos ++;
    }
    /*  1 octave up    :     +     */
    else if (c == '+') {
      timings.push({start: time, end: time});
      commands.push('o+');
      pos ++;
    }
    /* note detect mode :   c d e f g a h; cb c# ; cdc ebdbc f#gh ;   pause detect : p  */
    else if ('cdefgahp'.indexOf(c) != -1) {
      let quitNoteMode = new RegExp("[^cdefgah#bp ]");
      quitNoteMode.lastIndex = pos;   // start scan note-adding mode sequence
      next = pos + quitNoteMode.exec(sheet.slice(pos)).index;     // detect quit of note-adding mode
      /* buffer */
      let command = "";
      for(let i=pos; i<next; i++){
        if('cdefgah'.indexOf(sheet[i]) != -1){

          if(!command){
            /* buffer empty - add note */
          command = sheet[i];
          }else{
            /* note already exists in buffer  - play, clear buffer, add new note  */
            commands.push(command);
            timings.push({start: time, end: time + 4 / dur});
            time += 4 / dur;
            command = sheet[i];
          }
        }
        else if (command && '#b'.indexOf(sheet[i]) != -1){
          /* note already exists in buffer - apply halftone up/down, play note, clear buffer, ready for next note  */
          command += sheet[i];
          commands.push(command);
          timings.push({start: time, end: time + 4 / dur});
          time += 4 / dur;
          command = "";
        }
        else if (sheet[i] == 'p'){
          /* pause - add silence (no commands for pause dur)*/
          time += 4/dur;
        }

        else if (sheet[i] != ' '){
          /*  error  */
          console.log("Unknown command:" + sheet[i]);
          console.log(sheet.slice(pos, pos+10));
          commands.push("@");
          timings.push({start:time, end:time});
          break;
        }

        if(i == next-1 && command){
          commands.push(command);
          timings.push({start: time, end: time + 4 / dur});
          time += 4 / dur;
        }
      }
      pos = next;

    }
    else if(c == '.'){
      /*  dot -  last note duration x1.5  */
      let lastDur = timings[timings.length-1].end - timings[timings.length-1].start;
      timings[timings.length-1].end += lastDur/2;
      time += lastDur/2;
      pos++;
    }
    else if (!isNaN(parseInt(c))) {
      next = sheet.slice(pos).indexOf(" ");
      let newDur = +sheet.substr(pos, next);
      dur = newDur;
      pos += next+1;
    }
    /* ignore whitespace */
    else if(c == ' '){
      pos++;
    }
    /*   merge note length  */
    else if (c == '^'){
      let noteToFind = '';
      let currentPos = pos;
      while(true){
        currentPos++;
        if('cdefgah#b '.indexOf(sheet[currentPos]) == -1){
          break;
        }

        if('cdefgah'.indexOf(sheet[currentPos]) != -1){
          if(noteToFind){
            break;
          }
          else{
            noteToFind = sheet[currentPos];
          }
        }else if('#b'.indexOf(sheet[currentPos]) !=- 1){
          if(noteToFind){
            noteToFind += sheet[currentPos];
          }
          break;
        }

      }

      let noteIndex = commands.lastIndexOf(noteToFind);
      time += 4/dur;
      timings[noteIndex].end = time;

      pos = currentPos;
    }

    else if(c == '@'){
      commands.push("@");
      timings.push({start:time, end:time});
      break;
    }
    else{
      console.log("Unknown command:" + c);
      console.log(sheet.slice(pos, pos+10));
      commands.push("@");
      timings.push({start:time, end:time});
      break;
    }

    if(pos>=sheet.length){
      break;
    }
  }

  console.log(commands);
  console.log(timings.map ((a,i)=> Object.assign(a,{command: commands[i]})) );

  return {
    commands: commands,
    timings: timings
  };

}