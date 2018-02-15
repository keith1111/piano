export function parse(sheet){

  let sequence = [];

  let commentRegex = new RegExp('\\*.\*\?\\*', 'g');      //  remove all between    *    ...   *
  sheet = sheet.replace(commentRegex, '');

  sheet += " @";  // end

  let channels = sheet.trim().split("@")
      .map(text => text.trim())
      .filter(text => text.startsWith("="));
  //console.log("channels" + channels.length);

  for(let x=0; x<channels.length;x++){

    let channelObj = {};
    let quanted = channels[x].split(" ");
    channelObj.name = quanted[0].slice(1);

    let partSheet = quanted.slice(1).join(" ") + " @";        // removing name
    console.log(partSheet.length);
    let pos = 0;
    let next = 0;
    let dur = 4;
    let modifierDur = 1;
    let time = 0;
    let commands = [];
    let timings = [];    //{start: 0, end: 1} in 4th notes

    /*  parsing here    */
    while(true) {
      let c = partSheet[pos];

      /*    tempo change , octave change :     t60  o2     */
      if (c == "t" || c == 'o') {
        next = partSheet.slice(pos).indexOf(" ");
        let command = partSheet.substr(pos, next);


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

      /*  triplets mode  enter/exit   %3  .....   %   */
      else if(c == '%'){
        if(modifierDur == 1){
          next = partSheet.slice(pos).indexOf(" ");
          let number = parseInt(partSheet.slice(pos+1));
          modifierDur = number / (number-1);
          pos += next+1;
        }else{
          modifierDur = 1;
          pos++;
        }
      }

      /* note detect mode :   c d e f g a h; cb c# ; cdc ebdbc f#gh ;   pause detect : p  */
      else if ('cdefgahp'.indexOf(c) != -1) {
        let quitNoteMode = new RegExp("[^cdefgah#bp ]");
        quitNoteMode.lastIndex = pos;   // start scan note-adding mode sequence
        next = pos + quitNoteMode.exec(partSheet.slice(pos)).index;     // detect quit of note-adding mode
        /* buffer */
        let command = "";
        for(let i=pos; i<next; i++){
          if('cdefgah'.indexOf(partSheet[i]) != -1){

            if(!command){
              /* buffer empty - add note */
            command = partSheet[i];
            }else{
              /* note already exists in buffer  - play, clear buffer, add new note  */
              commands.push(command);
              timings.push({start: time, end: time + 4 / (dur * modifierDur)});
              time += 4 / (dur * modifierDur);
              command = partSheet[i];
            }
          }
          else if (command && '#b'.indexOf(partSheet[i]) != -1){
            /* note already exists in buffer - apply halftone up/down, play note, clear buffer, ready for next note  */
            command += partSheet[i];
            commands.push(command);
            timings.push({start: time, end: time + 4 / (dur * modifierDur)});
            time += 4 / (dur * modifierDur);
            command = "";
          }
          else if (partSheet[i] == 'p'){
            /* pause - add silence (no commands for pause dur)*/
            time += 4/(dur * modifierDur);
          }

          else if (partSheet[i] != ' '){
            /*  error  */
            console.log("Unknown command:" + partSheet[i]);
            console.log(partSheet.slice(pos, pos+10));
            commands.push("@");
            timings.push({start:time, end:time});
            break;
          }

          if(i == next-1 && command){
            commands.push(command);
            timings.push({start: time, end: time + 4 / (dur * modifierDur)});
            time += 4 / (dur * modifierDur);
          }
        }
        pos = next;

      }

      /*  dot -  last note duration x1.5  */
      else if(c == '.'){

        let lastDur = timings[timings.length-1].end - timings[timings.length-1].start;
        timings[timings.length-1].end += lastDur/2;
        time += lastDur/2;
        pos++;
      }
      else if (!isNaN(parseInt(c))) {
        next = partSheet.slice(pos).search(/\D/);
        let newDur = +partSheet.substr(pos, next);
        dur = newDur;
        pos += next;
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
          if('cdefgah#b '.indexOf(partSheet[currentPos]) == -1){
            break;
          }

          if('cdefgah'.indexOf(partSheet[currentPos]) != -1){
            if(noteToFind){
              break;
            }
            else{
              noteToFind = partSheet[currentPos];
            }
          }else if('#b'.indexOf(partSheet[currentPos]) !=- 1){
            if(noteToFind){
              noteToFind += partSheet[currentPos];
            }
            break;
          }

        }

        let mult = 1;    // dot notes
        if(partSheet[currentPos] == '.'){
          mult = 1.5;
          currentPos++;
        }

        let noteIndex = commands.lastIndexOf(noteToFind);

        time += (4/(dur * modifierDur)) * mult;
        timings[noteIndex].end = time;

        pos = currentPos;
      }

      /*   enter chord mode   */
      else if (c == '_'){
        console.log(pos);
        function octaveModifier(note){
          let [modifier, k] = octaveChange >= 0 ? ["+", 1] : ["-",-1];
          let newNote = note;
          for(let i=0; i<Math.abs(octaveChange);i++){
            newNote = modifier + newNote;
          }
          octaveChange = 0;
          return newNote;

        }

        let next = pos + partSheet.slice(pos+1).indexOf('_')+1;    // chord mode exit
        let chord = [];      // to push notes
        let octaveChange = 0;
        console.log(partSheet.slice(pos+1));
        //console.log(partSheet.slice(pos+1, next));
        let note = "";

        for(let i=pos+1; i<next; i++){



          if('cdefgah'.indexOf(partSheet[i]) != -1){
            if(!note){
              /* buffer empty - add note */
              note = partSheet[i];
            }else{
              /* note already exists in buffer  - add to chord, clear buffer, look new note  */
              chord.push(octaveModifier(note));
              //timings.push({start: time, end: time + 4 / dur});
              note = partSheet[i];
            }
          }
          else if (note && '#b'.indexOf(partSheet[i]) != -1){
            /* note already exists in buffer - apply halftone up/down, add note to chord, clear buffer, ready for next note  */
            note += partSheet[i];
            chord.push(octaveModifier(note));
            //timings.push({start: time, end: time + 4 / dur});
            note = "";
          }
          else if(partSheet[i] == '+'){
            if(note){
              chord.push(octaveModifier(note));
              note = "";
            }
            octaveChange++;

          }
          else if(partSheet[i] == '-'){
            if(note){
              chord.push(octaveModifier(note));
              note = "";
            }
            octaveChange--;
          }


          else if (partSheet[i] != ' '){
            /*  error  */
            console.log("Unknown command:" + partSheet[i]);
            console.log(partSheet.slice(pos, pos+10));
            commands.push("@");
            timings.push({start:time, end:time});
            break;
          }
          if(i == next-1 && note){
            chord.push(note);
          }

        }
        /* enter chord mode in player */
        commands.push("_");
        timings.push({start: time, end: time});
        for(let i=0; i<chord.length;i++){
          commands.push(chord[i]);
          timings.push({start: time, end: time + 4/(dur * modifierDur)});
        }

        /* exit chord mode in player */
        time += 4/(dur * modifierDur);
        commands.push("_");
        timings.push({start: time, end: time});
        pos = next+1;

      }

      else if(c == '@'){
        commands.push("@");
        timings.push({start:time, end:time});
        break;
      }
      else{
        console.log("Unknown command:" + c);
        console.log(partSheet.slice(pos, pos+10));
        commands.push("@");
        timings.push({start:time, end:time});
        break;
      }

      if(pos>=partSheet.length){
        break;
      }
    }

    console.log(commands);
    console.log(timings.map ((a,i)=> Object.assign(a,{command: commands[i]})) );

    channelObj.commands = commands;
    channelObj.timings = timings;

    sequence.push(channelObj);
  }



  return sequence;
}