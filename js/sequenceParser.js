export function parse(sheet){

  let commentRegex = new RegExp('\\*.\*\?\\*', 'g');      //  remove all between    *    ...   *
  sheet = sheet.replace(commentRegex, '');
  alert(sheet);
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
    /* note detect mode :   c d e f g a h; cb c# ...;  cdc   */
    else if ('cdefgah'.indexOf(c) != -1) {
      let quitNoteMode = new RegExp("[^cdefgah#b ]");
      quitNoteMode.lastIndex = pos;
      next = pos + quitNoteMode.exec(sheet.slice(pos)).index;
      let command = "";
      for(let i=pos; i<next; i++){
        if('cdefgah'.indexOf(sheet[i]) != -1){
          if(!command){
            command = sheet[i];
          }else{
            commands.push(command);
            timings.push({start: time, end: time + 4 / dur});
            time += 4 / dur;
            command = sheet[i];
          }
        }else if (command && '#b'.indexOf(sheet[i]) != -1){
          command += sheet[i];
          commands.push(command);
          timings.push({start: time, end: time + 4 / dur});
          time += 4 / dur;
          command = "";
        }else if (sheet[i] != ' '){
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
    else if (!isNaN(parseInt(c))) {
      next = sheet.slice(pos).indexOf(" ");
      let newDur = +sheet.substr(pos, next);
      dur = newDur;
      pos += next+1;
    }
    else if(c == ' '){
      pos++;
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