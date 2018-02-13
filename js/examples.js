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
  ' t132 o2 16' +
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


  '2': 't80 o1 4 _c e g_  _c e g_ _ a +c e_ _ a +c e_ _d f a_ _d f a_ _g h +d_ _g h +d_',

  '3' : 't60 o1 64 cccc'

};