// ======================
// ORIGINAL LOAD WORDS
// ======================

// generate and scatter words on screen when screen loads 
function loadWords() {   
   let left_col_w = document.getElementById("page-left").offsetWidth;
   let right_page_w = document.getElementById("page-right").offsetWidth;
   let right_page_h = window.innerHeight;
   let w_offset = 120;
   let h_offset = 15;

   let articles = ['a','an', 'and', 'some', 'that', 'the', 'then', 'there', 
   'to', 'of'];

   // generate random words and scatter on page
   for (let i = 0; i < NUM_WORDS; i++) {
      let word = RiTa.randomWord();
      WORDS_STR.push(word);

      let elem = document.createElement("button");
      elem.className = "gen-word";
      elem.textContent = word;
      elem.style.position = "absolute";
      elem.style.color = GENWORD_COLOUR;
      elem.style.borderStyle = "solid";
      elem.style.borderColor = GENWORD_BORDER;
      elem.style.borderWidth = '1.25px';
      // elem.style.border = "none";
      elem.style.background = "none";// GENWORD_COLOUR;
      elem.style.backgroundImage = GENWORD_BG_GRADIENT;
      //elem.style.borderRadius = "0px";
      //elem.style.backgroundColor = GENWORD_BG;
      elem.style.padding = "4px";
      
      let x_coord = Math.round(randomNum(0, right_page_w - w_offset));
      let y_coord = Math.round(randomNum(h_offset, right_page_h - h_offset))
      elem.style.left = x_coord + "px";
      elem.style.top = y_coord + "px";
      // let elem_id ; 
      // elem.setAttribute('id', )
      document.getElementById('page-right').appendChild(elem);
      WORDS_ELEM.push(elem);
   }
   for (let j = 0; j < articles.length; j++) {
      let word = articles[j];
      WORDS_STR.push(word);

      let elem = document.createElement("button");
      elem.className = "gen-word";
      elem.textContent = word;
      elem.style.position = "absolute";
      elem.style.color = GENWORD_COLOUR;
      elem.style.borderStyle = "dotted";
      elem.style.borderColor = GENWORD_BORDER;
      // elem.style.border = "none";
      // elem.style.background = "none";
      //elem.style.borderRadius = "3px";
      //elem.style.backgroundColor = GENWORD_BG;
      elem.style.padding = "4px";
      let x_coord = Math.round(randomNum(0, right_page_w - w_offset));
      let y_coord = Math.round(randomNum(h_offset, right_page_h - h_offset))
      elem.style.left = x_coord + "px";
      elem.style.top = y_coord + "px";
      document.getElementById('page-right').appendChild(elem);
      WORDS_ELEM.push(elem);
   }
}
// loadWords();
// console.log(WORDS_ELEM)
//console.log($(WORDS_ELEM[0]).position())
