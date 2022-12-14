import "./main.css";
import { makeMouseTrail } from "./mouse-trail.js";
//makeMouseTrail();
import { v4 as uuidv4 } from 'uuid';   // generate random unique id

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
   getDatabase, 
   onChildAdded, 
   onChildChanged, 
   onChildRemoved, 
   orderByChild,
   onValue, /* continuously read on given database ref */
   query,
   ref, 
   push, 
   get,  /* reads from database ref once */
   // getKey,
   set, /*saves data to the database, replaces data already there*/ 
   update,
   remove,
   equalTo,
   limitToFirst
} from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACcYIqVPbpLTcJNCnQUG310Ox7_-cKNKU",
  authDomain: "language-desire-path-official.firebaseapp.com",
  databaseURL: "https://language-desire-path-official-default-rtdb.firebaseio.com/",
  projectId: "language-desire-path-official",
  storageBucket: "language-desire-path-official.appspot.com",
  messagingSenderId: "801713690314",
  appId: "1:801713690314:web:a06fed683dc19b66cf8633",
  measurementId: "G-6YY9WLLKE3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase();

console.log(app);
console.log(db);

let NUM_WORDS = 10;//345;//900; 
let GENWORD_COLOUR = "rgba(255, 70, 90, 0.9)";
let RED = 255;
let GREEN = 100;
let BLUE = 90;
let ALPHA = 0.25;
let GENWORD_BORDER = "rgba(255, 140, 100, .8)";
let GENWORD_BG = "rgba(191, 255, 190, 0)";
let GENWORD_BG_GRADIENT = "radial-gradient(rgba(255,255,255,0) 30%, rgba(255, 140, 100, .15) 80%";
let GENWORD_COLOUR_HOV = 'rgba(81, 0, 255, .9)';
let GENWORD_BORDER_HOV = 'rgba(0, 102, 255, .1)';
let GENWORD_BG_HOV = "rgba(255, 255, 0, 0.9)";
let GENWORD_COLOUR_CLK = "rgba(0, 0, 255, 0)";
let GENWORD_BORDER_CLK = "rgba(255,255,255,.9)";
let GENWORD_BG_CLK = "rgba(255,255,255,.4";// "rgba(230, 255, 57, .7)";
let LINE_COLOUR =  "rgba(77, 89, 255, .7)";
let PL_PROMPT = 'rgb(255, 70, 90)';
let PL_REG = 'rgb(219, 255, 126)';
let PL_BG = 'rgb(40, 40, 38)';
let INACTIVE_DIV = 'rgb(77,77,77)';
let INACTIVE_DIV_TEXT = 'rgb(150,150,150)'
let NEW_GENWORD_BORDER = 'rgb(88, 88, 200)';

let WORDS_ELEM = []; // list of all generated words as html elements
//let SENTENCES_ELEM = []; // list of all generated sentences logged in firebase
let WORDS_STR = [];  // list of all generated words as strings
let SEL_WORDS = [];   // list of selected words as html elements
let MOUSE_POS_CUR = {x:0, y:0}; 
let MOUSE_POS_PRE = {x:0, y:0};
let PAGE_LEFT_CLICKED = false;
let MODE;

let DATE = new Date()
let UID = DATE.getTime();//uuidv4();
let POST_ID = DATE.getTime();//uuidv4();
console.log(UID);
console.log(POST_ID);

// firebase refs 
const ALL_WORDS_REF = ref(db, 'all_words'); 


// canvas
let canvas = document.querySelector("canvas");
let canvas_w = document.getElementById("page-right").offsetWidth;
const canvas_h = window.innerHeight;
canvas.width = canvas_w;
canvas.height = canvas_h;
canvas.style.borderLeft = "1px solid";
canvas.style.borderColor = LINE_COLOUR;
document.getElementById("page-right").appendChild(canvas);
const ctx = canvas.getContext("2d");

ctx.fillStyle = "rgba(190,190,190, 0)"
ctx.fillRect(0,0,canvas_w,canvas_h);
ctx.lineWidth = .9;
ctx.strokeStyle = LINE_COLOUR;
ctx.beginPath();
// ctx.moveTo(50,140);
// ctx.lineTo(150, 60);
// ctx.lineTo(1300, 400);
// ctx.closePath();
// ctx.stroke();

function randomNum(min, max) { 
   // generates random number
   if (min < max) {
      return Math.random() * (max - min) + min;
   }
   else if (min > max) {
      return Math.random() * (min - max) + max;
   }
   else if (min == max) {
      return min;
   }
} 

document.getElementById('page-left').style.gridColumnEnd = '3';
document.getElementById('forming-sentence').style.color = 'rgb(219, 255, 126)';

function blurPage() {
   document.getElementById('page-right').style.filter = 'blur(7px)';
   document.getElementById('sentences').style.filter = 'blur(7px)';
   document.getElementById('forming-sentence').style.filter = 'blur(7px)';
}
blurPage()

function unblurPage() {
   document.getElementById('page-right').style.removeProperty('filter');
   document.getElementById('sentences').style.removeProperty('filter');
   document.getElementById('forming-sentence').style.removeProperty('filter');
}


// ===========================
// FIREBASE WORD SETUP
// ===========================
function addInitWord(word, x, y) {
   // add word to intial set of words in firebase
   let db_ref = "all_words/" + word;
   set(ref(db, db_ref), {
      word: word,
      x: x, 
      y: y, 
      click: 0,
      red: RED,
      green: GREEN, 
      blue: BLUE,
      alpha: ALPHA
   });
}


let right_page_w = document.getElementById("page-right").offsetWidth;
let right_page_h = window.innerHeight;
let w_offset = 120;
let h_offset = 30;


function initWordBase() {
   // add the intial set of words to firebase
   // ONLY NEED TO BE CALLED ONCE WHEN SETTING UP THE SITE
   // temporarily comment out removeWord() --> singular, and 
   // updateNewWords() when calling this function
   let left_col_w = document.getElementById("page-left").offsetWidth;

   let articles = [
      'a','an', 'and', 'as', 'do', 'some', 'that', 'the', 'then', 'there', 
      'but', 'by', 'when','what','to', 'of', ',', ':', '?', '(',
      ')', '*', '-', "'",'on','you'
   ];

   let words = [
      'egg','beauty','bed','beneath','bitter','above','blow','blue','her','him',
      'they','cyborg', 'egg','head','hair','feet','fluff','ironic','iconic','from',
      'frantic','behold','how','hot','have','micro','myth','cryptic','we', 'water',
      'machinic','desire','feral','no','chill','not','rock','plant','image','seeing',
      'worship','wind','web','fluff','time','show','bling','suck','through','sea'
   ];

   // generate random words and put in firebase 
   /*for (let i = 0; i < NUM_WORDS; i++) {
      let word = RiTa.randomWord();
      // WORDS_STR.push(word);  // IS THIS NECESSARY???

      let x_coord = Math.round(randomNum(0, right_page_w - w_offset));
      let y_coord = Math.round(randomNum(h_offset, right_page_h - h_offset))
      // elem.style.left = x_coord + "px";
      // elem.style.top = y_coord + "px";
      addInitWord(word,x_coord, y_coord);       
   }*/

   for (let i = 0; i < words.length; i++) {
      let word = words[i];
      // WORDS_STR.push(word);  // IS THIS NECESSARY???

      let x_coord = Math.round(randomNum(0, right_page_w - w_offset));
      let y_coord = Math.round(randomNum(h_offset, right_page_h - h_offset))
      // elem.style.left = x_coord + "px";
      // elem.style.top = y_coord + "px";
      addInitWord(word,x_coord, y_coord);       
   }

   for (let j = 0; j < articles.length; j++) {
      let word = articles[j];
      // WORDS_STR.push(word);  // IS THIS NECESSARY???

      let x_coord = Math.round(randomNum(0, right_page_w - w_offset));
      let y_coord = Math.round(randomNum(h_offset, right_page_h - h_offset))
      // elem.style.left = x_coord + "px";
      // elem.style.top = y_coord + "px";
      addInitWord(word,x_coord, y_coord); 
   }
}
// initWordBase() // ONLY NEED TO BE CALLED ONCE WHEN SETTING UP THE SITE


function displayWords(word, x, y) {
   // LOAD THE WORDS ARE LOADED FROM all_words IN FIREBASE ON SCREEN
   // REPLACE loadWords() WITH THIS
   let elem = document.createElement("button");
   elem.className = "gen-word";
   elem.textContent = word;
   elem.setAttribute('id', word);
   elem.style.position = "absolute";
   elem.style.color = "red" //GENWORD_COLOUR;
   elem.style.borderStyle = "dotted";
   // elem.style.borderColor = GENWORD_BORDER;
   elem.style.borderWidth = '1.25px';
   // elem.style.border = "none";
   elem.style.background = "none";// GENWORD_COLOUR;
   //elem.style.backgroundImage = GENWORD_BG_GRADIENT;
   //elem.style.borderRadius = "0px";
   //elem.style.backgroundColor = GENWORD_BG;
   elem.style.left = x + "px";
   elem.style.top = y + "px";
   elem.style.padding = "4px";
   document.getElementById('page-right').appendChild(elem);
   elem.setAttribute('listener', 'true');
   WORDS_ELEM.push(elem);
   // console.log(WORDS_ELEM);
   // console.log(elem)
}


function initPage() {
   // gets the colors for each word box from firebase and assign on page 
   // when a page first loads 
   // CHANGE OPACITY OF WORDS !!!!!!

   // let word = WORDS_ELEM[i].textContent;
   // CAN'T INDEX INTO WORDS_ELEM FOR SOME REASON ??????
   onValue(ref(db, 'all_words/'), (snapshot) => {
      snapshot.forEach(child => {
         let word = child.val().word;
         let g = child.val().green;
         let b = child.val().blue;
         let a = child.val().alpha;
         let r = child.val().red;
         let new_color = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
         let gradient = "radial-gradient(rgba(255,255,255,0) 30%, " + new_color + " 80%";

         let elem = document.getElementById(word);
         elem.style.borderColor = new_color;
         elem.style.backgroundImage = gradient;
         elem.setAttribute('listener', 'true');
         //console.log(word)
      })
   }, {
      onlyOnce: true
      });
}
initPage();








// ==============
// CANVAS
// ==============
// DRAW LINES BETWEEN WORDS THAT ARE CLICKED
// MAKE CLICKED WORDS APPEAR ON LEFT PANEL 

function showPt(x, y) {
   // draw a point on the page given x and y coordinates of ctrl point
   ctx.fillStyle = 'red';
   ctx.beginPath();
   ctx.arc(x, y, 5, 0, 2 * Math.PI);  // Control point
   ctx.fill();
}
/*
ctx.moveTo(200,60);
ctx.bezierCurveTo(300,30,10,390,900,600);
ctx.stroke();
showPt(300,30);
showPt(10,390);
*/


function storeLine(word1, word2, x1, y1, ctrl1x, ctrl1y, ctrl2x, ctrl2y, x2, y2) {
   // add line to firebase
   let lines_ref = ref(db, 'lines');
   let new_line_ref = push(lines_ref);
   set(new_line_ref, {
      word1: word1,
      word2: word2,
      x1: x1,
      y1: y1,
      ctrl1x: ctrl1x,
      ctrl1y: ctrl1y,
      ctrl2x: ctrl2x,
      ctrl2y: ctrl2y,
      x2: x2,
      y2: y2
   });
   //console.log('storeLine working');
}

// WHY IS X_OFFSET NEEDED QAQ
// corrects the strange gap between canvas and generated words
let x_offset = 335;
function getPathCoords(cur_pos, pre_pos) {
   // returns the values of the coordinates that form the bezier curve
   // when a word is clicked and store it in firebase

   // COORDS NEED TO BE GENERATED IN RELATION TO PRE_POS AND CUR_POS
   function getCtrlCoord(pos1, pos2) {
      // generates coordinate for control points
      let range = 600;
      let gen_x = Math.round(randomNum(pos1.x, pos2.x)); 
      let gen_y = Math.round(randomNum(pos1.y, pos2.y));
      if (gen_y == gen_x) { getCtrlCoord() };
      return [gen_x, gen_y];
   }

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

   
   let x1 = Math.round(pre_pos.x - x_offset);
   let y1 = Math.round(pre_pos.y); 
   let ctrl1x = Math.round(ctrl1[0] - x_offset);
   let ctrl1y = Math.round(ctrl1[1]);
   let ctrl2x = Math.round(ctrl2[0] - x_offset);
   let ctrl2y = Math.round(ctrl2[1]);
   let x2 = Math.round(cur_pos.x - x_offset);
   let y2 = Math.round(cur_pos.y);

   //console.log("cur_pos: " + x2 + "," + y2);
   //console.log("pre_pos: " + x1 + "," + y1);
   //console.log("ctrl1: " + ctrl1x + "," + ctrl1y);
   //console.log("ctrl2: " + ctrl2x + "," + ctrl2y);

   return [x1, y1, ctrl1x, ctrl1y, ctrl2x, ctrl2y, x2, y2];
}


function calcStoreLine(cur_pos, pre_pos, word1, word2) {
   // returns the values of the coordinates that form the bezier curve
   // when a word is clicked and store it in firebase
   // THIS USES ALMOST THE EXACT SAME CODE AS GETPATHCOORDS SO USE THAT TO 
   // WRITE THIS 
   let [x1, y1, ctrl1x, ctrl1y, ctrl2x, ctrl2y, x2, y2] = getPathCoords(cur_pos, pre_pos);
   storeLine(word1, word2, x1, y1, ctrl1x, ctrl1y, ctrl2x, ctrl2y, x2, y2);
   //console.log('calcStoreLine ' + word1 + " and " + word2);
}
//calcStoreLine({x: 50, y: 50}, {x: 200, y: 200}, "test1", "test2");








// =========================================
// FIREBASE MOUSE INTERACTIONS AND UPDATES
// =========================================


function updateWordClick(elem, word) {
   // update +1 to the 'click' key on firebase for the clicked word
   // and change the colour intensity
   // takes in the html element and the word written on that element
   let prev_val;
   let new_val;

   get(ref(db,'all_words/' + word)).then((snapshot) => {
      if (snapshot.exists()) {
         let r = snapshot.val().red;
         let g = snapshot.val().green;
         let b = snapshot.val().blue;
         let a = snapshot.val().alpha;
         let new_b = b <= 253 ? b + 5 : b;   // control within 255
         let new_a = a <= .925? a + .075 : a;  // control within 1 
         let new_color = "rgba(" + r + ", " + g + ", " + new_b + ", " + new_a + ")";
         let gradient = "radial-gradient(rgba(255,255,255,0) 30%, " + new_color + " 80%";

         prev_val = snapshot.val().click;
         new_val = prev_val + 1;
         update(ref(db, 'all_words/' + word), {click: new_val});
         //console.log(prev_val);
         //console.log(new_val);

         // change color intensity of the word based on number of clicks 
         // IT WOULD BE NICE IF THE COLORS OF ALL WORDS CAN CHANGE RELATIVE 
         // TO EACH CLICK BUT THAT MIGHT BE TOO MUCH WORK -- SAVE TILL THE END 

         // KEEP THE GRADIENTS !!!
         update(ref(db, 'all_words/' + word), {blue: new_b});
         update(ref(db, 'all_words/' + word), {alpha: new_a});
         // elem.style.color = new_color;
         elem.style.borderColor = new_color;
         elem.style.backgroundImage = gradient;
         //console.log(new_color);
         //console.log(gradient)
      } 
      else {
         console.log("no data available");
      }
   }).catch((error) => {
      console.error(error);
   });
}






function storeSentence(w1, w2, w3, w4, w5) { 
   let sentence_ref = ref(db, 'sentences/' + POST_ID + '/' + UID); 
   set(sentence_ref, {
      word1: w1,
      word2: w2,
      word3: w3,
      word4: w4,
      word5: w5
   });
}
// storeSentence('1','2','3','4','5')




function displaySelWord(elem) {
   // given selected html element <button>, display its textContent on page-left  
   // under 'forming sentence'
   let text = elem.textContent
   document.getElementById("forming-sentence").insertAdjacentText('beforeend', text + ' ');
   // console.log(elem.textContent)
   updateScroll();
}



function storeExistingSentence(post_id, word_lst) {
   // store the 5 words into existing post in firebase 'sentences'
   // word_lst is an array of 5 html elements

   // find the ref in firebase with the post_id 
   // store the current 5 words with the global IUD 
   let sentence_ref = ref(db, 'sentences/' + post_id + '/' + UID);
   set(sentence_ref, {
      word1: word_lst[0].innerText,
      word2: word_lst[1].innerText,
      word3: word_lst[2].innerText,
      word4: word_lst[3].innerText,
      word5: word_lst[4].innerText
   });
}
// storeExistingSentence('fa8ab8ba-5d77-4be4-9ffc-c203301cc9bd', ['one','two','three','four','five']);


function pageLeftRightInteractions(word_elem, post_id) {
   // code to fill in an existing sentence and draw lines on page
   // FIGURE THIS OUT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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

      calcStoreLine(MOUSE_POS_CUR, MOUSE_POS_PRE, word1, word2);
      // update previous mouse pos to current in preparation for
      // the next click
      MOUSE_POS_PRE.x = window.event.clientX; 
      MOUSE_POS_PRE.y = window.event.clientY; 

      console.log(SEL_WORDS[SEL_WORDS.length - 1].textContent);

      // store the selected words in firebase when 5 words are selected
      if (SEL_WORDS.length >= 5) {
         storeExistingSentence(post_id, SEL_WORDS);          
         console.log('storeExistingSentence id: ' + post_id);
         console.log('storeExistingSentence: ' + SEL_WORDS[0].innerText + ' ' + 
         SEL_WORDS[1].innerText + ' ' + SEL_WORDS[2].innerText + ' ' + SEL_WORDS[3].innerText + ' ' + 
         SEL_WORDS[4].innerText);
         // clear page left bottom display
         // and let message display for 2 seconds before clearing
         // the message is displayed in a different color
         // color changes back after message is gone
         document.getElementById('forming-sentence').style.color = PL_PROMPT;
         document.getElementById('forming-sentence').innerText = 'Words added to selected sentence!'
         setTimeout(function() {
            document.getElementById('forming-sentence').innerText = '';
            document.getElementById('forming-sentence').style.color = 'rgb(219, 255, 126)';
         }, 900);
         SEL_WORDS = [];
      }
      console.log(SEL_WORDS);
      // PAGE_LEFT_CLICKED = false;
   }
   // DISPLAY WORDS ON PAGE LEFT
   // CHANGE TO REFER TO FIREBASE AND DIFFERENT SENTENCES!!!!!!!!!!!
   if (SEL_WORDS.length > 0 && SEL_WORDS.length < 5) {
      displaySelWord(word_elem);
   }
}



function pageRightInterationsOnly(elem) {
   // code to start a new sentence and draw lines on page
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
         let date2 = new Date()
         POST_ID = date2.getTime()//uuidv4();

         console.log('sentence logged via pageRightInteraction()')

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
}




function detectPLClick() {
   let pl_sentence_box = document.getElementById('instructions');
   pl_sentence_box.addEventListener('click', function() {
      PAGE_LEFT_CLICKED = true;
      console.log('detectPLClick(), PAGE_LEFT_CLICKED= ' + PAGE_LEFT_CLICKED);
   })
}
// detectPLClick()


function allMouseInteractions() {
   let sentences = document.getElementsByClassName('logged-sentence');
   let word_btns = document.querySelectorAll('button');
   // case: page-left sentence isn't selected 
   // create a new sentence 
   if ( MODE == 'write' ) {
      word_btns.forEach((word_elem) => {
         // change the color of the word and border when clicked or hover
         // SOME VISUAL SELECT / DESELECT / HOVER ISSUES
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
         word_elem.addEventListener('click', () => {
            // elem.style.color = GENWORD_COLOUR_CLK;
            // elem.style.borderColor = GENWORD_BORDER_CLK;
            // elem.style.backgroundColor = GENWORD_BG_CLK;
            console.log('PAGE_LEFT_CLICKED: ' + PAGE_LEFT_CLICKED);
            
            word_elem.style.backgroundImage = "none";
            SEL_WORDS.push(word_elem);
            updateWordClick(word_elem, word_elem.textContent);
            pageRightInterationsOnly(word_elem);
   
            // console.log('allMouseInteractions() working');
            console.log(word_elem);
   
         });
      });
   }

   // case: page-left sentence is selected first 
   // add 5 more words to the selected sentence
   //else if ( MODE == 'edit' ) {
      for (let i = 0; i < sentences.length; i++) {
         let sentence = sentences[i];
         sentence.addEventListener('click', function() {
            // console.log('allMouseInteractions() working')
            // PAGE_LEFT_CLICKED = true;
            let post_key = sentence.id;
            let prompt_box = document.getElementById('forming-sentence');
            prompt_box.style.color = PL_PROMPT;
            prompt_box.innerText = "Add 5 more words to this sentence: ";

            console.log(post_key);
            //prompt_box.style.color = PL_REG;
            // push into firebase after checking iud 
            // storeSentence(w1,w2,w3,w4,w5);

            word_btns.forEach((word_elem) => {
               word_elem.addEventListener('click', () => {
                  // console.log('PAGE_LEFT_CLICKED: ' + PAGE_LEFT_CLICKED);
                  SEL_WORDS.push(word_elem);
                  updateWordClick(word_elem, word_elem.textContent);
                  pageLeftRightInteractions(word_elem, post_key);
                  // console.log('pageLeftRightIntersations should be executing');
               });
            });
            // console.log(sentence);
         });  
      }
   //}
}


function mousePRInteractions() {
   // case: page-left sentence isn't selected 
   // create a new sentence on write mode 
   let sentences = document.getElementsByClassName('logged-sentence');
   let word_btns = document.querySelectorAll('button');
   
   word_btns.forEach((word_elem) => {
      // change the color of the word and border when clicked or hover
      // SOME VISUAL SELECT / DESELECT / HOVER ISSUES
     
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
      word_elem.addEventListener('click', () => {
         // elem.style.color = GENWORD_COLOUR_CLK;
         // elem.style.borderColor = GENWORD_BORDER_CLK;
         // elem.style.backgroundColor = GENWORD_BG_CLK;
         console.log('PAGE_LEFT_CLICKED: ' + PAGE_LEFT_CLICKED);
         
         word_elem.style.backgroundImage = "none";
         
         SEL_WORDS.push(word_elem);
         updateWordClick(word_elem, word_elem.textContent);
         pageRightInterationsOnly(word_elem);

         // console.log('allMouseInteractions() working');
         console.log(word_elem);

      });
   });
}


function newElemPRInteractions() {
   let all_btns = document.querySelectorAll('button');
   let word_btns = []; // select all gray buttons 

   all_btns.forEach((btn) => {
      let border_color = btn.style.borderColor; 

      //if (border_color == NEW_GENWORD_BORDER) {
         if (btn.getAttribute('listener') !== 'true'){
            word_btns.push(btn);
         }
      //}
   });

   console.log('these should be gray borders: ');
   console.log(word_btns);

   word_btns.forEach((word_elem) => {
      word_elem.setAttribute('listener', 'true');
      // change the color of the word and border when clicked or hover
      // SOME VISUAL SELECT / DESELECT / HOVER ISSUES
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
      word_elem.addEventListener('click', () => {
         // elem.style.color = GENWORD_COLOUR_CLK;
         // elem.style.borderColor = GENWORD_BORDER_CLK;
         // elem.style.backgroundColor = GENWORD_BG_CLK;
         console.log('PAGE_LEFT_CLICKED: ' + PAGE_LEFT_CLICKED);
         
         word_elem.style.backgroundImage = "none";
         SEL_WORDS.push(word_elem);
         updateWordClick(word_elem, word_elem.textContent);
         pageRightInterationsOnly(word_elem);

         // console.log('allMouseInteractions() working');
         console.log(word_elem);

      });
   });
   
}



function mousePLPRInteractions() {
   // case: page-left sentence is selected first 
   // add 5 more words to the selected sentence
   let sentences = document.getElementsByClassName('logged-sentence');
   let word_btns = document.querySelectorAll('button');
   let post_key;
   for (let i = 0; i < sentences.length; i++) {
      let sentence = sentences[i];
      sentence.addEventListener('click', function() {
         // console.log('allMouseInteractions() working')
         // PAGE_LEFT_CLICKED = true;
         post_key = sentence.id;
         let prompt_box = document.getElementById('forming-sentence');
         prompt_box.style.color = PL_PROMPT;
         prompt_box.innerText = "Add 5 more words to this sentence: ";

         console.log(post_key);
         //prompt_box.style.color = PL_REG;
         // push into firebase after checking iud 
         // storeSentence(w1,w2,w3,w4,w5);

         word_btns.forEach((word_elem) => {
            word_elem.addEventListener('click', () => {
               console.log('PAGE_LEFT_CLICKED: ' + PAGE_LEFT_CLICKED);
               SEL_WORDS.push(word_elem);
               updateWordClick(word_elem, word_elem.textContent);
               pageLeftRightInteractions(word_elem, post_key);
               // console.log('pageLeftRightIntersations should be executing');
            });
         });
         // console.log(sentence);
      });  
   }
}



function pushWordsElem(word, x, y) {
   // push the newly created word(string) into WORDS_ELEM
   // buttons still won't immediately be registered by page righ write mode using this method
   let elem = document.createElement("button");
   elem.className = "gen-word";
   elem.textContent = word;
   elem.setAttribute('id', word);
   elem.style.position = "absolute";
   elem.style.color = "red" //GENWORD_COLOUR;
   elem.style.borderStyle = "dotted";
   elem.style.borderColor = GENWORD_BORDER;
   elem.style.borderWidth = '1.25px';
   // elem.style.border = "none";
   elem.style.background = "none";// GENWORD_COLOUR;
   // elem.style.backgroundImage = gradient;
   //elem.style.borderRadius = "0px";
   //elem.style.backgroundColor = GENWORD_BG;
   elem.style.left = x + "px";
   elem.style.top = y + "px";
   elem.style.padding = "4px";
   WORDS_ELEM.push(elem);
}


function updatePageLeft(post_id) {
   // refresh pageLeft if new words are added to an existing post_id
   let elem = document.getElementById(post_id);
   console.log("id of updated sentence: " + post_id);
   elem.innerHTML = '';
   
   onChildAdded(ref(db, 'sentences/' + post_id), (snapshot) => {
      //console.log(snapshot);   
      snapshot.forEach((word) => {
         elem.insertAdjacentText('beforeend', word.val() + ' ');
         // console.log('page-left updated with new inserted word')
      });
   });
}


function showNewWord(word) {
   // add the newly created word to the page and assign click functions 

   let elem = document.getElementById(word);
   //elem.style.borderColor = new_color;
   //elem.style.backgroundImage = gradient;

   elem.addEventListener('click', () => {
      //SEL_WORDS.push(elem);
      updateWordClick(elem, elem.textContent);
      pageRightInterationsOnly(elem);
   });
   console.log('showNewWord():');
   console.log(elem);
}


function pageLeftInteractions() {
   // USE THIS ONE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   // click on a sentence on the left
   // input 2 words 
   // store those 2 words on firebase if it doesn't exist
   // update page with those 2 words 
   // remove 3 words that aren't clicked so far -- not implemented
   let sentences = document.getElementsByClassName('logged-sentence');
   let word_btns = document.querySelectorAll('button');
   let post_key;

   for (let i = 0; i < sentences.length; i++) {
      let sentence = sentences[i];
      sentence.addEventListener('click', function() {
         // sentence.style.background = GENWORD_COLOUR;
         post_key = sentence.id;
         let prompt_box = document.getElementById('forming-sentence');
         
         console.log('pageLeftInteractions: ')
         console.log('sentence id: ' + post_key)
         console.log(prompt_box);

         let input1 = prompt('Write a new word following the sentence you selected:');
         while (input1 == '') {input1 = prompt('You *have* to write a new word following the selected sentence:');}
         let input2 = prompt('Write another new word following the sentence you selected:');
         while (input2 == '') {input2 = prompt('You *have* to write a new word following the selected sentence:');}

         if (input1 != null && input2 != null) {
            console.log('inputs: ' + input1 + ' ' + input2);
            prompt_box.style.color = PL_PROMPT;
            prompt_box.innerText = 'The words you inputted are ' + '"' + input1 + '"' + ' and ' + '"' + input2 + '"';
            setTimeout(function() {
               document.getElementById('forming-sentence').innerText = '';
               document.getElementById('forming-sentence').style.color = 'rgb(219, 255, 126)';
            }, 1500);

            // store sentence in firebase 'sentence'
            let sentence_ref = ref(db, 'sentences/' + post_key + '/' + UID);
            set(sentence_ref, {
               word1: input1,
               word2: input2,
            });

            // add input1 and input2 to firebase 'all_words'
            let x_coord1 = Math.round(randomNum(0, right_page_w - w_offset));
            let y_coord1 = Math.round(randomNum(h_offset, right_page_h - h_offset))
            addInitWord(input1,x_coord1, y_coord1);
            let x_coord2 = Math.round(randomNum(0, right_page_w - w_offset));
            let y_coord2 = Math.round(randomNum(h_offset, right_page_h - h_offset))
            addInitWord(input2,x_coord2, y_coord2);
            //initPage()  // initialize page (right) again so that the new words show up
            
            // HOW TO MAKE NEW INPUTS CLICKABLE??????
            //showNewWord(input1);
            //showNewWord(input2);
            //console.log(document.getElementById(input1));
            //console.log(document.getElementById(input2));
            /*
            let elem1 = document.getElementById(input1);
            let elem2 = document.getElementById(input2);
            elem1.addEventListener('click', () => {
               updateWordClick(elem1, elem1.textContent);
               pageRightInterationsOnly(elem1);
            });
            elem2.addEventListener('click', () => {
               updateWordClick(elem2, elem2.textContent);
               pageRightInterationsOnly(elem2);
            });
            */
            // draw a line between the two words 
            // WHY DO I NEED TO EVEN OUT X_OFFSET HERE???????
            let pos1 = {x: x_coord1 + x_offset, y: y_coord1};
            let pos2 = {x: x_coord2 + x_offset, y: y_coord2};
            calcStoreLine(pos1, pos2, input1, input2);
            // CHANGE LINE COLOR ??????? maybe???? not???????
            updatePageLeft(post_key);
            // store in WORDS_ELEM
            // pushWordsElem(input1, x_coord1, y_coord1);
            // pushWordsElem(input2, x_coord2, y_coord2);
         }
         // if one of the word inputs are canceled
         else if (input1 == null || input2 == null) {
            prompt_box.style.color = PL_PROMPT;
            prompt_box.innerText = "You didn't input one of the words";
            setTimeout(function() {
               document.getElementById('forming-sentence').innerText = '';
               document.getElementById('forming-sentence').style.color = 'rgb(219, 255, 126)';
            }, 2000);
         }
      });
   }
}


function allClickProcedure() {
   // A FUNCTION THAT CONNECTS CLICK INTERACTIONS ON PAGE LEFT AND PAGE RIGHT
   // not being used rn
   onValue(ref(db), (snapshot) => {
      let all_words_db = snapshot.val().all_words;
      let lines_db = snapshot.val().lines;
      let sentences_db = snapshot.val().sentences;
      // console.log(all_words_db);
      // console.log(lines_db);
      // console.log(sentences_db);
      // console.log(snapshot);

      /*
      if (PAGE_LEFT_CLICKED == true) { 
         console.log('mousePLPRInteractions() working');
         mousePLPRInteractions(); 
      }
      else if (PAGE_LEFT_CLICKED == false) { 
         console.log('mousePRInteractions() working');
         mousePRInteractions() 
      }
      */
      
      allMouseInteractions();
      // mouseInteractions();
      //mousePRInteractions() 

   }, { onlyOnce: true } );
}
//allClickProcedure();



function allClickProcedurePR() {
   // initiates database for write mode (page-right operation --> page-left)
   onValue(ref(db), (snapshot) => {
      let all_words_db = snapshot.val().all_words;
      let lines_db = snapshot.val().lines;
      let sentences_db = snapshot.val().sentences;
      // console.log(all_words_db);
      // console.log(lines_db);
      // console.log(sentences_db);
      // console.log(snapshot);
      mousePRInteractions() 
      newElemPRInteractions()
      
   }, { onlyOnce: true } );
}

function allClickProcedurePLPR() {
   // initiates databse for edit mode (page-left operation --> page-right)
   onValue(ref(db), (snapshot) => {
      // mousePLPRInteractions(); 
      pageLeftInteractions();
   }, { onlyOnce: true } );
}




function selectMode() {
   // select write or edit mode 
   let write = document.getElementById('write-mode');
   let edit = document.getElementById('edit-mode');
   let instructions = document.getElementById('instructions')
   let info_box = document.getElementById('forming-sentence');

   write.addEventListener('click', function() {
      unblurPage()
      MODE = 'write';
      console.log('mode: ' + MODE);
      allClickProcedurePR();
      // disable 'edit' button
      edit.style.pointerEvents = 'none';
      edit.style.backgroundColor = INACTIVE_DIV;
      edit.style.color = INACTIVE_DIV_TEXT;
      edit.style.borderColor = INACTIVE_DIV_TEXT;
      
      instructions.innerText = "✽ Click on any of the red boxes to link 5 words together\n✽ The words you've linked will appear on the left panel\n✽ If you see any gray boxes appear, refresh the page and they will then be selectable";
      instructions.style.padding = '10px';
      
      info_box.style.color = PL_PROMPT;
      info_box.innerText = "You've chosen to write";
      setTimeout(function() {
         info_box.innerText = '';
         info_box.style.color = 'rgb(219, 255, 126)';
      }, 3000);

   });
   edit.addEventListener('click', function() {
      unblurPage()
      MODE = 'edit';
      console.log('mode: ' + MODE);
      allClickProcedurePLPR();
      // disable 'write' button
      write.style.pointerEvents = 'none';
      write.style.backgroundColor = INACTIVE_DIV;
      write.style.color = INACTIVE_DIV_TEXT;
      write.style.borderColor = INACTIVE_DIV_TEXT;

      instructions.innerText = "✽ Click on any of the sentences on the left panel to add 2 additional words to the end of it\n✽ The words you add will also be added to the space on the right and can be used to write future sentences\n✽ Refresh sometimes to see what others wrote";
      instructions.style.padding = '10px';
      
      info_box.style.color = PL_PROMPT;
      info_box.innerText = "You've chosen to edit";
      setTimeout(function() {
         info_box.innerText = '';
         info_box.style.color = 'rgb(219, 255, 126)';
      }, 3000);
   });
}
selectMode()






// ===============
// PAGE UPDATES
// ===============

// updateWordClick('an');

function updateWords() {
   // listens to all events in firebase to update words on page
   onValue(ALL_WORDS_REF, (snapshot) => {
      let data = snapshot.val();
      //console.log(data);
       snapshot.forEach((child) => {   
         let word = child.val().word;
         let x = child.val().x;
         let y = child.val().y;
         let r = snapshot.val().red;
         let g = snapshot.val().green;
         let b = snapshot.val().blue;
         let a = snapshot.val().alpha;
         let color = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
         let gradient = "radial-gradient(rgba(255,255,255,0) 30%, " + color + " 80%";
         displayWords(word, x, y);  // THIS MIGHT NOT BE NEEDED ANYMORE AFTER UPDATEPAGE() IS IMPLEMENTED SINCE ANY CHANGES WILL BE DETECTED AND IMPLEMENTED, HOPEFULLY
         WORDS_STR.push(word);
         //console.log(WORDS_STR);

         // update color on all pages with the same link
         let elem = document.getElementById(word);
         elem.style.borderColor = color;
         elem.style.backgroundImage = gradient;
         //console.log('pages should be updated');

      });
      //console.log(WORDS_STR);
      //console.log(WORDS_ELEM[0]);
      //mouseInteractions();
   }, { onlyOnce: true });
}
updateWords();



function displayNewWords(word, x, y, gradient) {
   // for a word that's newly added from page-left, display on page-right
   let elem = document.createElement("button");
   elem.className = "gen-word";
   elem.textContent = word;
   elem.setAttribute('id', word);
   elem.style.position = "absolute";
   elem.style.color = "rgb(150,150,180)" //GENWORD_COLOUR;
   elem.style.borderStyle = "dotted";
   elem.style.borderColor = "rgb(88,88,200)";
   elem.style.borderWidth = '1.5px';
   // elem.style.border = "none";
   elem.style.background = "none";// GENWORD_COLOUR;
   elem.style.backgroundImage = gradient;
   //elem.style.backgroundColor = GENWORD_BG;
   elem.style.left = x + "px";
   elem.style.top = y + "px";
   elem.style.padding = "4px";
   document.getElementById('page-right').appendChild(elem);
   WORDS_ELEM.push(elem);
   // console.log(WORDS_ELEM);
   // console.log(elem)
}


function removeWords2() {
   // search through all_words 
   // remove one of the ones with the least amount of clicks 
   // remove the lines leading to that word too
   // maybe remove the sentences with that word too but not necessary
   onValue(ref(db, 'all_words'), (snapshot) => {
      let click = snapshot.val().click;
      let word = snapshot.val().word;
      if (click == 0) {
         remove(ref(db, 'all_words/' + word)).then(() => {
            console.log('removeWords2() working');
         });
      }

   }, { onlyOnce: true });
}


function removeWord() {
   // removes the least clicked word from 'all_words' in firebase
   // removes lines from 'lines' in firebase too 
   // update the page with it
   let log = {};
   onChildChanged(ref(db, 'all_words'), (snapshot)  => {
      let word = snapshot.val().word;
      let click = snapshot.val().click;
      let log_length = Object.keys(log).length;
      
      if (log_length == 0) {
         log[word] = click;
      }
      // if click < last value in log, insert the word in log
      else {
         let last_click = log[Object.keys(log)[Object.keys(log).length - 1]];
         if (click < last_click) {
            log[word] = click;
         }
      } 
      // let last_click = log[Object.keys(log)[Object.keys(log).length - 1]]
      // console.log(Object.keys(log));
      // console.log(log);

      let smallest_word = Object.keys(log)[0];
      
      // remove lines connected to that word
      let linked_lines_ref1 = query(ref(db, 'lines'), orderByChild('word1'), equalTo(smallest_word));
      // let smallest_word_lines1 = query(linked_lines_ref1, equalTo(smallest_word));
      let linked_lines_ref2 = query(ref(db, 'lines'), orderByChild('word2'), equalTo(smallest_word));

      get(linked_lines_ref1).then((snapshot) => {
         //console.log(snapshot.val());
         snapshot.forEach((child) => {
            let line_key = String(child.key);
            console.log('child key to remove: ' + line_key);
            remove(ref(db, 'lines/'+line_key));
         });
      });
      get(linked_lines_ref2).then((snapshot) => {
         //console.log(snapshot.val());
         snapshot.forEach((child) => {
            let line_key = String(child.key);
            console.log('child key to remove: ' + line_key);
            remove(ref(db, 'lines/'+line_key));
         });
      });
      
      // remove smallest word
      remove(ref(db, 'all_words/' + smallest_word))
      console.log('"'+ smallest_word + '" removed');
      initPage(); // refresh page right after child is removed 

   });
}
// removeWord()


function removeWordPeriodic() {
   // remove a word from database periodically if there are more than 70
   // words available ; this is connected to a time interval thing that 
   // triggers the function once every minute 

   get(ref(db,'all_words')).then((snapshot) => {
      let size = snapshot.size; 
      console.log('all_words length: ' + size);
      
      if (size > 85) {
         let log = {};
         let smallest_word;
         let least_click;

         snapshot.forEach((child) => {
            let log_len = Object.keys(log).length;
            let click = child.val().click;
            let word = child.val().word;
            // console.log('removeWordPeriodic() click: ' + click + " word: " + word)
            if (log_len == 0) {
               // add first { word:click } pair 
               log[word] = click;
               smallest_word = word;
               least_click = click;
               // console.log('smallest word: ' + smallest_word);
            }
            else {
               let prev_key = Object.keys(log)[log_len - 1];
               if (click < log[prev_key]) {
                  log[word] = click;
                  smallest_word = word;
                  least_click = click;
                  // console.log('smallest word now: ' + smallest_word);
               }
            }
         });
         // delete all key/value pairs in 'log' where the value is 
         // greater than least_click 
         for (let key in log) {
            if (log[key] > least_click) {
               delete log[key];
            }
         }
         // get first smallest word
         let log_len = Object.keys(log).length;
         smallest_word = Object.keys(log)[log_len - 1];
         console.log('first smallest word: ' + smallest_word);

         // remove lines connected to that word
         let linked_lines_ref1 = query(ref(db, 'lines'), orderByChild('word1'), equalTo(smallest_word));
         // let smallest_word_lines1 = query(linked_lines_ref1, equalTo(smallest_word));
         let linked_lines_ref2 = query(ref(db, 'lines'), orderByChild('word2'), equalTo(smallest_word));

         get(linked_lines_ref1).then((snapshot) => {
            //console.log(snapshot.val());
            snapshot.forEach((child) => {
               let line_key = String(child.key);
               //console.log('child key to remove: ' + line_key);
               remove(ref(db, 'lines/'+line_key));
            });
         });
         get(linked_lines_ref2).then((snapshot) => {
            //console.log(snapshot.val());
            snapshot.forEach((child) => {
               let line_key = String(child.key);
               //console.log('child key to remove: ' + line_key);
               remove(ref(db, 'lines/'+line_key));
            });
         });
         
         // remove smallest word
         remove(ref(db, 'all_words/' + smallest_word))
         //initPage(); // refresh page right after child is removed 
         //updateWords()
      }
   });
}
// removeWordPeriodic()


function updateNewWords() {
   // show new words added to all_words on page-right from page-left edit mode
   onChildAdded(ref(db, 'all_words'), (snapshot) => {
      let word = snapshot.val().word;
      let x = snapshot.val().x;
      let y = snapshot.val().y;
      
      //let r = snapshot.val().red;
      //let g = snapshot.val().green;
      //let b = snapshot.val().blue;
      //let a = snapshot.val().alpha;
      //let color = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
      
      let gradient = "radial-gradient(rgba(255,255,255,0) 30%, " + 'rgba(255,255,255,.8)' + " 80%";
      displayNewWords(word, x, y, gradient)
      // console.log('new addition to all_words')
      // allMouseInteractions() // call this function again so the new words are clickable immediately   --------- DOESN'T WORK THE WAY YOU THINK IT DOES 
      // DO A VERSION OF ALLMOUSEINTERACTIONS PERATINING TO THE 2 NEWLY ADDED WORDS ONLY
      newElemPRInteractions()
   });
}
//updateNewWords()


function updatePage() {
   // detect changes in all children and update the page across all browsers
   // try onChildAdded and onChildChanged to update page?
   onChildChanged(ref(db, 'all_words'), (snapshot) => {
      // let item = snapshot.val();
      let word = snapshot.val().word;
      // let click = snapshot.val().click;
      let r = snapshot.val().red;
      let g = snapshot.val().green;
      let b = snapshot.val().blue;
      let a = snapshot.val().alpha;
      let color = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
      let gradient = "radial-gradient(rgba(255,255,255,0) 30%, " + color + " 80%";

      let elem = document.getElementById(word);
      elem.style.borderColor = color;
      elem.style.backgroundImage = gradient;
      //console.log("updatePage: " + word + " " + click);
   })
   // NOW UPDATE PAGE WITH ALL THE LINES STORED IN FIREBASE 
   onChildAdded(ref(db, "lines"), (snapshot) => {
      let word1 = snapshot.val().word1;
      let word2 = snapshot.val().word2;
      let x1 = snapshot.val().x1;
      let y1 = snapshot.val().y1;
      let ctrl1x = snapshot.val().ctrl1x;
      let ctrl1y = snapshot.val().ctrl1y;
      let ctrl2x = snapshot.val().ctrl2x;
      let ctrl2y = snapshot.val().ctrl2y;
      let x2 = snapshot.val().x2;
      let y2 = snapshot.val().y2;

      ctx.beginPath(); 
      ctx.moveTo(x1, y1);
      //ctx.lineTo(cur_pos.x-x_offset, cur_pos.y);
      ctx.bezierCurveTo(ctrl1x, ctrl1y, ctrl2x, ctrl2y, x2, y2);
      ctx.stroke();
      //console.log('updatePage: ' + word1 + ' ' + word2);
   });
   // update page left
   onChildAdded(ref(db, 'sentences'), (snapshot) => {
      let p_elem = document.createElement('p');
      p_elem.classList.add('logged-sentence');
      let key = snapshot.key;
      snapshot.forEach((post) => {
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
     // pageLeftInteractions()
   });
   onChildRemoved(ref(db, 'all_words'), (snapshot) => {
      let word = snapshot.val().word;
      elem = document.getElementById(word);
      elem.remove();
    });
}
updatePage();








function updateScroll() {
   // makes sure that page-left scroll bar is always pointing to the bottom
   let page = document.getElementById("forming-sentence");
   page.scrollTop = page.scrollHeight;
}
updateScroll()

/*
window.addEventListener('resize', () => {
   canvas.width = document.getElementById("page-right").offsetWidth;
   canvas.height = window.innerHeight;
   //ALSO RESIZE WORDS ON PAGE RIGHT
}); 
*/



// setInterval(removeWordPeriodic(), 1000);

let remove_word
// a word will be removed every minute
remove_word = setInterval(removeWordPeriodic, 60000);















// ===============================
// SWITCHING BETWEEN PAGE SIZES
// ===============================

function redistributeWords() {
   // redistributes page-right words as interface size changes 
   //console.log($(WORDS_ELEM[0]).position())
}


function resizePageRight() {
   // resize page-right as page-left gets bigger
   let pl_len = document.getElementById("page-left").offsetWidth;
   let page_len = window.innerWidth;
   let new_pr_len = page_len - pl_len;

   document.getElementById("page-right").style.width = new_pr_len;
   canvas.width = document.getElementById("page-right").clientWidth;
}

function shiftWindowLeft() {
   // shifts page-left left according to its current position
   let pl = document.getElementById("page-left");
   let pr = document.getElementById('page-right');
   
   // small sliver page-left --> page-right
   if (pl.style.gridColumnEnd == '3') {
      pl.style.gridColumnEnd = '2';
      pr.style.gridColumnStart = '2';
   }
   // large-sliver page-left --> small sliver page-left
   else if (pl.style.gridColumnEnd == '4') {
      pl.style.gridColumnEnd = '3';
      pr.style.gridColumnStart = '3';
   }
   // all page-left --> large sliver page-left
   else if (pl.style.gridColumnEnd == '5') {
      pl.style.gridColumnEnd = '4';
      pr.style.gridColumnStart = '4';
   }
   else if (pl.style.gridColumnEnd == '6') {
      pl.style.gridColumnEnd = '5';
      pr.style.gridColumnStart = '5';
   }
   pl.style.gridColumnStart = '1';
   canvas.width = document.getElementById("page-right").offsetWidth;
   // REARRANGE WORDS ACCORDING TO NEW PAGE-RIGHT SIZE !!!!!!!!!!
}

function shiftWindowRight() {
   // shifts page-left right according to its current position
   let pl = document.getElementById("page-left");
   let pr = document.getElementById('page-right');

   // all page-right --> large sliver page-right
   if (pl.style.gridColumnEnd == '2') {
      pl.style.gridColumnEnd = '3';
      pr.style.gridColumnStart = '3';
   }
   // large sliver page-right --> small sliver page right
   else if (pl.style.gridColumnEnd == '3') {
      pl.style.gridColumnEnd = '4';
      pr.style.gridColumnStart = '4';
      resizePageRight();
   }
   // small sliver page-right --> all page-left
   else if (pl.style.gridColumnEnd == '4') {
      pl.style.gridColumnEnd = '5';
      pr.style.gridColumnStart = '5';
      resizePageRight();
   }
   pr.style.gridColumnEnd = '6';
   // canvas.width = document.getElementById("page-right").offsetWidth;
   // REARRANGE WORDS ACCORDING TO NEW PAGE-RIGHT SIZE !!!!!!!!

}

// ======================
// KEYBOARD INTERACTIONS
// ======================
// assign functions to keyboard clicks
window.addEventListener("keydown", (e) => {
   if (e.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }
    let pl = document.getElementById("page-left");
    let pr = document.getElementById('page-right');

   switch (e.key) {
      // left arrow key
      case "Left":
      case "ArrowLeft": 
         console.log("left arrow clicked");
         shiftWindowLeft();
         break;

      // right arrow key
      case "Right":
      case "ArrowRight":
         console.log("right arrow clicked");
         shiftWindowRight();
         break;

      // enter key
      case "Enter": 
         SEL_WORDS = [];
         // add 2 line breaks after the currently forming setence
         // YOU SHOULDNT BE ABLE TO ADD MORE THAN 2 LINE BREAKS
         let curr_sentence = document.getElementById('forming-sentence');
         for (let i = 0; i < 2; i++) {
            curr_sentence.insertAdjacentHTML('beforeend', '<br>');   
         } 
         updateScroll();  
         console.log('enter key pressed');
         console.log(SEL_WORDS);
         console.log(SEL_WORDS.length);
         break;
   }
   // cancel the default action to avoid it being handled twice
   e.preventDefault();
}, true);

