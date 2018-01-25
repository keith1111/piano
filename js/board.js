export function enableOctaveChange(){


  document.addEventListener("keydown", moveBoard);

  function moveBoard(e){
    if(e.keyCode == 33){
      octaveMove(-1);

    }else if(e.keyCode==34){
      octaveMove(1);
    }
  }
}

function offset(){
  let keys = document.querySelector(".board");

  if(arguments.length){
    let newOffset = arguments[0];
    keys.setAttribute("transform", `translate(${newOffset},140)`);
    return newOffset;
  }
  return offsetFromAttr(keys.getAttribute("transform"));
}

function offsetFromAttr(transform){
  let pos = transform.indexOf('(');
  let trimmedAttr = transform.slice(pos+1);
  return parseInt(trimmedAttr);
}

function octaveMove(change){
  let OCT_WIDTH = -490;
  let currentOffset = offset();
  let currentOct = currentOffset/OCT_WIDTH - 2;

  if(change == 1 && currentOct < 3){
    offset( currentOffset +=OCT_WIDTH );
  } else if( change == -1 && currentOct > -2){
    offset( currentOffset -=OCT_WIDTH );
  }
}