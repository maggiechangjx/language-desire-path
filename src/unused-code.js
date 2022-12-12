// all the written but unused code 


// previous mouseInteractions() pertaining to page-right only
function mouseInteractions() {
   // color changes when mouse clicks or hovers over word boxes
   WORDS_ELEM.forEach((elem) => {      
      /*
      elem.addEventListener('mouseover', () => {
         elem.style.color = GENWORD_COLOUR_HOV;
         elem.style.borderColor = GENWORD_BORDER_HOV;
         elem.style.backgroundColor = GENWORD_BG_HOV;
      });
      elem.addEventListener('mouseout', () => {
         if (elem.style.color != GENWORD_COLOUR_CLK) {
            elem.style.color = GENWORD_COLOUR;
            elem.style.borderColor = GENWORD_BORDER;
            elem.style.backgroundColor = GENWORD_BG;
         }
      });
      */
      elem.addEventListener('click', () => {
         // elem.style.color = GENWORD_COLOUR_CLK;
         // elem.style.borderColor = GENWORD_BORDER_CLK;
         // elem.style.backgroundColor = GENWORD_BG_CLK;
         elem.style.backgroundImage = "none";
         SEL_WORDS.push(elem);
         updateWordClick(elem, elem.textContent)


         // HOW TO INTEGRATE PAGE-LEFT WITH THESE CLICK INTERACTIONS??

         // console.log('click');
         // update position of mouse and draw paths on canvas
         if (SEL_WORDS.length <= 1) {
            MOUSE_POS_CUR.x = window.event.clientX; 
            MOUSE_POS_CUR.y = window.event.clientY;
            MOUSE_POS_PRE.x = window.event.clientX; 
            MOUSE_POS_PRE.y = window.event.clientY; 
         }
         // update firebase with clicked words
         // draw line
         // display on page-left
         else if (SEL_WORDS.length > 1) {
            MOUSE_POS_CUR.x = window.event.clientX; 
            MOUSE_POS_CUR.y = window.event.clientY;

            let word1 = SEL_WORDS[SEL_WORDS.length - 2].textContent;
            let word2 = SEL_WORDS[SEL_WORDS.length - 1].textContent;

            //storeLine(word1, word2, x1, y1, ctrl1x, ctrl1y, ctrl2x, ctrl2y, x2, y2);
            calcStoreLine(MOUSE_POS_CUR, MOUSE_POS_PRE, word1, word2);
            // drawPath(MOUSE_POS_CUR, MOUSE_POS_PRE);
            // update previous mouse pos to current in preparation for
            // the next click
            MOUSE_POS_PRE.x = window.event.clientX; 
            MOUSE_POS_PRE.y = window.event.clientY; 

            console.log(SEL_WORDS[SEL_WORDS.length - 1].textContent);

            // store the selected words in firebase when 5 words are selected
            if (SEL_WORDS.length == 5) {
               storeSentence(SEL_WORDS[0].textContent,
                  SEL_WORDS[1].textContent,
                  SEL_WORDS[2].textContent,
                  SEL_WORDS[3].textContent,
                  SEL_WORDS[4].textContent);             
               SEL_WORDS = [];
               POST_ID = uuidv4();

               // clear page left bottom display
               // and let message display for 2 seconds before clearing
               // the message is displayed in a different color
               // color changes back after message is gone
               document.getElementById('forming-sentence').style.color = PL_PROMPT;
               document.getElementById('forming-sentence').innerText = 'Partial sentence recorded!'
               setTimeout(function() {
                  document.getElementById('forming-sentence').innerText = '';
                  document.getElementById('forming-sentence').style.color = 'rgb(219, 255, 126)';
               }, 900);
            }
            console.log(SEL_WORDS);
         }
         // DISPLAY WORDS ON PAGE LEFT
         // CHANGE TO REFER TO FIREBASE AND DIFFERENT SENTENCES!!!!!!!!!!!
         if (SEL_WORDS.length > 0 && SEL_WORDS.length < 5) {
            displaySelWord(elem);
         }         
      }); 
   });
}





// ==========================
// PAGE LEFT INTERACTIONS
// ==========================
function pageLeftInteractions2(w1,w2,w3,w4,w5) {
   // click on a sentence on page left to add to it 
   // sentences can be indexed because this function is plugged into another 
   // function that connects to firebase
   let sentences = document.getElementsByClassName('logged-sentence');
   console.log(sentences);
   console.log(sentences.length);
   console.log(sentences[0]);
   
   for (let i = 0; i < sentences.length; i++) {
      let sentence = sentences[i];
      sentence.addEventListener('click', function() {
         let post_key = sentence.id;
         let prompt_box = document.getElementById('forming-sentence');
         prompt_box.style.color = PL_PROMPT;
         prompt_box.innerText = "Add 5 more words to this sentence:";
         //prompt_box.style.color = PL_REG;
         // push into firebase after checking iud 
         storeSentence(w1,w2,w3,w4,w5);



         console.log(sentence);
      });
   }
}


/*
HAS BEEN INTEGRATED INTO UPDATEPAGE() WITHOUT PAGELEFTINTERACTIONS() IN IT
function updatePageLeft() {
   // TAP INTO FIREBASE AND DISPLAY EACH IN A SEPARATE DIV ON PAGE LEFT 
   onChildAdded(ref(db, 'sentences'), (snapshot) => {
      let p_elem = document.createElement('p');
      p_elem.classList.add('logged-sentence');
      snapshot.forEach((post) => {
         let key = post.key;
         p_elem.setAttribute('id', key);
         // console.log(key);
         // assign key as div ID
         post.forEach((word) => {
            // PUT WORDS IN DIV
            // PUT DIV ON PAGE LEFT 
            p_elem.insertAdjacentText('beforeend', word.val() + ' ');
            console.log(word.val());
         });
      document.getElementById('sentences').appendChild(p_elem);
      });
     //  SENTENCES_ELEM.push(p_elem);
     pageLeftInteractions()
   });
}
*/
//updatePageLeft()





function drawPath(cur_pos, pre_pos) {
   // draw a path from previous mouse position (js object) to
   // current mouse position (js object)
   // THIS PROBABLY WILL BE CHANGED SO THAT IT ACCESSES THE DATABASE FOR 
   // POINTS INSTEAD, BY LISTENING TO CHANGES IN CHILDREN

   /*
   let ctrl1 = getCtrlCoord(pre_pos, cur_pos); 
   let ctrl2 = getCtrlCoord(pre_pos, cur_pos);

   // create more variation in the curve if difference in ctrl pts is small 
   if (Math.abs(ctrl1[0]-ctrl2[0] < 10)) {
      ctrl2[0] += randomNum(30,100);
   }
   if (Math.abs(ctrl1[1]-ctrl2[1] < 10)) {
      ctrl2[1] += randomNum(30,100);
   }

   // scale ctrl pts to create more difference in the curve 
   // scale according to how far the control points are from each other
   let scale_val = 1.35;
   ctrl2[0] += Math.abs(ctrl1[0]-ctrl2[0]) * scale_val; 
   ctrl2[1] += Math.abs(ctrl1[1]-ctrl2[1]) * scale_val;

   // WHY IS OFFSET NEEDED QAQ
   let x_offset = 335;  // corrects the strange gap between canvas and generated words
   let x1 = Math.round(pre_pos.x - x_offset);
   let y1 = Math.round(pre_pos.y); 
   let ctrl1x = Math.round(ctrl1[0] - x_offset);
   let ctrl1y = Math.round(ctrl1[1]);
   let ctrl2x = Math.round(ctrl2[0] - x_offset);
   let ctrl2y = Math.round(ctrl2[1]);
   let x2 = Math.round(cur_pos.x - x_offset);
   let y2 = Math.round(cur_pos.y);
   */
   let [x1, y1, ctrl1x, ctrl1y, ctrl2x, ctrl2y, x2, y2] = getPathCoords(cur_pos, pre_pos);

   ctx.beginPath(); 
   ctx.moveTo(x1, y1);
   //ctx.lineTo(cur_pos.x-x_offset, cur_pos.y);
   ctx.bezierCurveTo(ctrl1x, ctrl1y, ctrl2x, ctrl2y, x2, y2);
   ctx.stroke();
   // showPt(ctrl1[0]-x_offset, ctrl1[1]);
   // showPt(ctrl2[0]-x_offset, ctrl2[1]);
   
   // console.log("drawPath working");
}

// press space to start a new path drawing 
// WHY DO I NEED TO CLICK AN EMPTY SPACE FIRST TO CLEAR??
// CHANGE THIS TO ENTER AND ADD BR IN PAGE-LEFT TEXT
/*
document.body.onkeyup = function(e) {
   if (e.key == " " || e.code == "Space" || e.keyCode == 32) {
      SEL_WORDS = [];
      // ctx.beginPath();
      //MOUSE_POS_CUR.x = 0; 
      //MOUSE_POS_CUR.y = 0;
      //MOUSE_POS_PRE.x = 0; 
      //MOUSE_POS_PRE.y = 0; 
      console.log(SEL_WORDS);
      console.log(SEL_WORDS.length);
   }  
}
*/




// console.log('num children: ' + ALL_WORDS_REF.size);
/*
get(ref(db, ALL_WORDS_REF)).then((snapshot) => {
   if (snapshot.exists()) {
     console.log(snapshot.val());
   } else {
     console.log("No data available");
   }
 }).catch((error) => {
   console.error(error);
 });
*/

// DOESN'T REALLY WORK 
onValue(ALL_WORDS_REF, (snapshot) => {
   console.log(snapshot.size())
 }, {
   onlyOnce: true
 });


 function newID(id) {
   // generate a user ID by checking firebase and adding 1 to the existing number
   get(ref(db, 'users/' + ID.toString())).then((snapshot) => {
      if (snapshot.exists()) {
         // if current number exists, add 1 to ID
         ID += 1
         newID(ID)
      }
      else {
         // log new id in firebase 
      }
   })
}







function displayWords2() {
   // LOAD THE WORDS ARE LOADED FROM all_words IN FIREBASE ON SCREEN
   // REPLACE loadWords() WITH THIS
   onValue(ref(db, 'all_words') , (snapshot) => {
      const word = (snapshot.val().word)
   }, {onlyOnce: true});

   // console.log(word);
}

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




// =======================
// WORD BOX INTERACTIONS
// =======================

/*
GETTING REPLACED BY MOUSEINTERACTIONS() ??!?!?!?!?
*/

WORDS_ELEM.forEach((elem) => {      
   elem.addEventListener('mouseover', () => {
      elem.style.color = GENWORD_COLOUR_HOV;
      elem.style.borderColor = GENWORD_BORDER_HOV;
      elem.style.backgroundColor = GENWORD_BG_HOV;
   });
   elem.addEventListener('mouseout', () => {
      if (elem.style.color != GENWORD_COLOUR_CLK) {
         elem.style.color = GENWORD_COLOUR;
         elem.style.borderColor = GENWORD_BORDER;
         elem.style.backgroundColor = GENWORD_BG;
      }
   });
   elem.addEventListener('click', () => {
      elem.style.color = GENWORD_COLOUR_CLK;
      elem.style.borderColor = GENWORD_BORDER_CLK;
      elem.style.backgroundColor = GENWORD_BG_CLK;
      elem.style.backgroundImage = "none";
      SEL_WORDS.push(elem);
      console.log('click');
      // update position of mouse and draw paths on canvas
      if (SEL_WORDS.length <= 1) {
         MOUSE_POS_CUR.x = window.event.clientX; 
         MOUSE_POS_CUR.y = window.event.clientY;
         MOUSE_POS_PRE.x = window.event.clientX; 
         MOUSE_POS_PRE.y = window.event.clientY; 
      }
      else if (SEL_WORDS.length > 1) {
         MOUSE_POS_CUR.x = window.event.clientX; 
         MOUSE_POS_CUR.y = window.event.clientY;
         //let [x1, y1, ctrl1x, ctrl1y, ctrl2x, ctrl2y, x2, y2] = getPathCoords(MOUSE_POS_CUR, MOUSE_POS_PRE);
         let word1 = SEL_WORDS[SEL_WORDS.length - 2].textContent;
         let word2 = SEL_WORDS[SEL_WORDS.length - 1].textContent;

         //storeLine(word1, word2, x1, y1, ctrl1x, ctrl1y, ctrl2x, ctrl2y, x2, y2);
         calcStoreLine(MOUSE_POS_CUR, MOUSE_POS_PRE, word1, word2);
         drawPath(MOUSE_POS_CUR, MOUSE_POS_PRE);

         // update previous mouse pos to current in preparation for
         // the next click
         MOUSE_POS_PRE.x = window.event.clientX; 
         MOUSE_POS_PRE.y = window.event.clientY; 
      }
      // DISPLAY WORDS ON PAGE LEFT
      if (SEL_WORDS.length > 0) {
         displaySelWord(elem);
      }
      console.log(SEL_WORDS[SEL_WORDS.length - 1]);      
   }); 
});






// =====================
// FIREBASE TESTS
// =====================

function writeData(userId, name, email, imageUrl) {
   set(ref(db, 'users/' + userId), {
      username: name,
      email: email,
      profile_picture: imageUrl
   });
}


function recordWord1(word) {
   const word_ref = ref(db, 'words');
   const new_word = push(word_ref);
}

// recordWord("word0");
// recordWord("word1");

// recordWord("word0")