export function offset(){
  let piano = document.querySelector(".piano");
  let keys = document.querySelector(".board");

  document.addEventListener("click", function(){
    keys.style.transform = "translate(400px, 140px)";
  });

  if(arguments.length){
    let newOffset = arguments[0];

    return newOffset;
    }




  return +piano.getAttribute("viewBox").split(' ')[0];


}


