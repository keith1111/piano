export function enableVisualClick() {

  //document.addEventListener("dragstart", ()=> false);

  let pianoKeys = document.querySelectorAll(".piano-key");
  pianoKeys.forEach(key=> key.addEventListener("mousedown", playKey));
  pianoKeys.forEach(key=> key.addEventListener("mouseup", stopKey));
  pianoKeys.forEach(key=> key.addEventListener("mouseout", stopKey));
  pianoKeys.forEach(key=> key.addEventListener("mouseenter", slideToKey));

  function playKey() {
    this.dataset.isPressed = true;

  }

  function stopKey() {
    this.dataset.isPressed = false;

  }

  function slideToKey(e) {

    if (e.buttons & 1) {
      playKey.call(e.target);
    }
  }

  const TONE_VISUAL_OFFSET = {
    1: 0,
    2: 55,
    3: 70,
    4: 125,
    5: 140,
    6: 210,
    7: 265,
    8: 280,
    9: 335,
    10: 350,
    11: 405,
    12: 420
  };
}

