export function parse(sheet){

  sheet += " ";  // end
  let pos = 0;
  let next = 0;
  let dur = 4;
  let time = 0;
  let commands = [];
  let timings = [];    //{start: 0, end: 1} in 4th notes


  while(true) {
    let c = sheet[pos];
    if (c == "t" || c == 'o') {
      next = sheet.slice(pos).indexOf(" ");
      let command = sheet.substr(pos, next);

      timings.push({start: time, end: time});
      commands.push(command);
      pos += next+1;
    }
    else if (c == '-') {
      timings.push({start: time, end: time});
      commands.push('o-');
      pos += 2;
    }
    else if (c == '+') {
      timings.push({start: time, end: time});
      commands.push('o+');
      pos += 2;
    }
    else if ('cdefgah'.indexOf(c) != -1) {
      next = sheet.slice(pos).indexOf(" ");
      let command = sheet.substr(pos, next);
      timings.push({start: time, end: time + 4 / dur});
      time += 4 / dur;
      commands.push(command);
      pos += next+1;
    }
    else if (!isNaN(parseInt(c))) {
      next = sheet.slice(pos).indexOf(" ");
      let newDur = +sheet.substr(pos, next);
      dur = newDur;
      pos += next+1;
    }

    if(pos>=sheet.length){
      break;
    }
  }

  return {
    commands: commands,
    timings: timings
  };

}