export function renderExamples(){
  let select = document.querySelector("#examples");
  let examplesArray = [...Object.keys(examples)];
  select.innerHTML = examplesArray.map((a,i) => {
    return `
      <option value="${a}">${a}</option>
    `
  }).join("");

}

export let examples = {
  '1' : '* this is a comment. Song: Bach Prelude C-moll  * ' +
  ' =solo t132 o2 16' +
  ' c - eb d eb c eb d eb + c - eb d eb c eb d eb' +
  ' ab f e f c f e f ab f e f c f e f' +
  ' h f eb f d f eb f h f eb f d f eb f' +
  ' + c - g f g eb g f g + c - g f g eb g f g' +
  ' + eb - ab g ab eb ab g ab + eb - ab g ab eb ab g ab' +
  ' + d - f# e f# d f# e f# + d - f# e f# d f# e f#' +
  ' + d - g f# g d g f# g + d - g f# g d g f# g' +
  ' + c - e d e c e d e + c - e d e c e d e' +
  ' + c - f e f c f e f + c - f e f c f e f' +
  ' hb f eb f d f eb f hb f eb f d f eb f' +
  ' hb g f g eb g f g hb g f g eb g f g' +
  ' ab g f g eb g f g ab g f g eb g f g' +
  ' ab d c d - hb + d c d ab d c d - hb + d c d' +
  ' g - hb ab hb + eb - hb ab hb + g - hb ab hb + eb - hb ab hb' +
  ' + f c - hb + c - a + c - hb + c f c - hb + c - a + c - hb + c' +
  ' f d c d - h + d c d f d c d - h + d c d' +
  ' f d c d - h + d c d f d c d - h + d c d' +
  ' eb c - h + c - g + c - h + c eb c - h + c - g + c - h + c' +
  ' - f + eb d eb f eb d eb - f + eb d eb f eb d eb' +
  ' - f# + c - h + c eb c - h + c - f# + c - h + c eb c - h + c' +
  ' eb c - h + c - g + c - h + c eb c - h + c - g + c - h + c' +
  ' f# c - h + c - a + c - h + c f# c - h + c - a + c - h + c' +
  ' g c - h + c d c - h + c g c - h + c d c - h + c' +
  ' ab c - h + c d c - h + c ab c - h + c d c - h + c' +

  ' *  PART 2 * +' +
  ' o-1 ' +
  ' g h + d f ab f e f h f + d - h ab f e f ' +
  ' o-1 ' +
  ' g +c eb g + c -g f# g + eb c g eb c - ab g ab' +
  'o-1 ' +
  ' g a + f# + c + eb c - h + c f# c a f# eb c - h +c' +
  ' *PART 3*' +
  ' o2 p d c d eb c - h + c - a +c -h + c d - h a h' +
  ' g h a h +c  -a g a f# a g a h g f# g' +
  ' d +g f g ab f eb f d f eb f g eb d eb' +
  'c eb d eb f d c d - h + dc d eb c -h +c' +
  '- g + c - h +c - ab + f eb f - g + eb d eb - f + d c d' +
  ' - eb +c -hb +c - ab f eb f g eb d eb f d c d ' +
  '    *ADAGIO*     ' +
  't60 8 e 32 ^e c d e 64 f g ab hb + c - hb ab g 32 f g e f e f 16 ^f g 32 f e f g ab g 64 f eb d eb f d eb f' +
  ' *ALLEGRO*  ' +
  't132 8 - h. 16 d f ab g f h f + d  -f h ab g f' +
  ' e + db -hb g +c -ab  f ab g hb g eb ab f d f' +
  ' e g e c f d - h +d 8 c. 16 d g hb g ' +
  ' ab + c f d f ab +c - h +c -f gd 4 e',


  '2': '=chords t80 o0 4 _c e g h_  _c e g h_ _ a +c e g_ _ a +c e g_ _d f a +c_ _d f a +c_ _g f +c d_ _g h +d c_',

  '3' : '=solo t60 o-1 4 %3 cdef   cde%  f g',

  'maybe next time' : '=solo t60 o1 4 p p e. 8 a ' +
  ' 4 +d 2 c 8 -h +c - 4 h 2 a 8 e a 4 +d 2 c 8 -h +c 16 -h +c 8 -h 2 ^h 8 %3 g +c e %' +
  '4 f 2 e 8 -g +c 4 e 2 d 8 ed d c 2 c 4 -h 2 a 8 ^a 8 p a +c' +
  '4 d %3 8 ^d d e% 4 f 16 p 8 g 16 f 8f 4 e. 8 ^e. 16 e 8 %3 a h +c % 2 -h. 8 +c-h 4 h 2a 8 -e a' +
  '  * B  *' +
  '4 +d 2 c 8 -h +c - 4 h 2 a 8 e a 4 +d 2 c 8 -h +c 16 -h +c 8 -h 2 ^h 8 g 16 +c e' +
  '%3 8 fefefe % 4 f e %3 8 eee % 16 e 8d 16e 4 d 16 ^d 8 e. 4 ^e 8 d 16cc 4 ^c 16 ^c c de 4 f %3 8 ^f f g%  4 a 8 a+c' +
  ' 4 d 8d 16 cd 4 d. 16 dd 8d 16cc 8c -h h. 16e a -h +h -h 8 ++c - 4 h. 8 ^h h + c- h 4 h  2a. ' +
      '  *  PART 2 *   '+
  ' o0 2 d. 8 d e 2 f. 8 f g 2 a %3 4 a +c# d % 8 d. 32 c# d 2 c# 8 c#d' +
  ' - 2 d. 8 d e 2 f. 8 g +a + %3 c# d c# d c#d % 2 c# 1 -a ' +
  ' 8 - hb a g e d c# d e g a 4 g 2 _d f#_ + 4c 8 -a f# e d# e f# 4 h. 8 a 2 g#' +
  '2 _h +d f_ 4 _h +d f_ _a +c e_ 1 _g# h +d_ 2 f 4 f e 2 dc - 1 e 2 ^e p' +
  ' @' +
  ' *CHORD*  ' +
  '=chord o0 t60 1 p ' +
  '2 _a +c e_ _g a +c e_ _f a +c e_ _e a +c e_ _d f a_ _c d f a_ _g h d_ _g h d_' +
  '_c e g _ _c e g_ _e g# h +d _ _e g# h +d _ _a +c e_ _g a +c e_ _f a +c e_ _f a +d_' +
  '_d f a_ _d f a_ _a +c e_ _a +c e_ _g h d_ _g h d_ _a +c e_ _e g# h +d _' +
  ' *  PART 2 * ' +
  ' _a +c e_ _g a +c e_ _f a +c e_ _e a +c e_ _d f a_ _c d f a_ _g h d_ _g h d_' +
      '_c e g _ _c e g_ _e g# h +d _ _e g# h +d _ _a +c e_ _g a +c e_ _f a +c e_ _f a +d_' +
  '_d f a_ _d f a_ _a +c e_ _a +c e_ _g h d_ _c e g_ _a +c e_ _a +c e g -c#_'

};