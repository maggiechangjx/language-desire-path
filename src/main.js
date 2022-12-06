import "./main.css";
import { makeMouseTrail } from "./mouse-trail.js";
//makeMouseTrail();

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
   getDatabase, 
   onChildAdded, onChildChanged, onChildRemoved, 
   onValue, /* continuously read on given database ref */
   ref, 
   push, 
   get,  /* reads from database ref once */
   set, /*saves data to the database, replaces data already there*/ 
   update
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

let NUM_WORDS = 345;//900; 
let GENWORD_COLOUR = "rgba(255, 70, 90, 0.9)";
let RED = 255;
let GREEN = 70;
let BLUE = 90;
let ALPHA = 0.9;
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

let WORDS_ELEM = []; // list of all generated words as html elements
let WORDS_STR = [];  // list of all generated words as strings
let SEL_WORDS = [];   // list of selected words as html elements
let MOUSE_POS_CUR = {x:0, y:0}; 
let MOUSE_POS_PRE = {x:0, y:0};

// firebase refs 
const ALL_WORDS_REF = ref(db, 'all_words'); 
// ALSO NEED A NEW BRANCH FOR PAGE-LEFT ?????????????
/* 
word 
   word: 'word',
   x: #,
   y: #,
   click: #,
   red: #,
   green: #,
   blue: #,
   alpha: #
*/

// canvas
let canvas = document.querySelector("canvas");
let canvas_w = document.getElementById("page-right").offsetWidth;
const canvas_h = window.innerHeight;
canvas.width = canvas_w;
canvas.height = canvas_h;
canvas.style.border   = "1px solid";
canvas.style.borderColor = "blue";
document.getElementById("page-right").appendChild(canvas);
const ctx = canvas.getContext("2d");


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


// UNDER WHAT CONDITIONS CAN PEOPLE INPUT/TAKE AWAY WORDS



// ===========================
// FIREBASE WORD OPERATIONS
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

function initWordBase() {
   // add the intial set of words to firebase
   let left_col_w = document.getElementById("page-left").offsetWidth;
   let right_page_w = document.getElementById("page-right").offsetWidth;
   let right_page_h = window.innerHeight;
   let w_offset = 120;
   let h_offset = 30;

   let articles = ['a','an', 'and', 'some', 'that', 'the', 'then', 'there', 
   'to', 'of'];

   // generate random words and put in firebase 
   for (let i = 0; i < NUM_WORDS; i++) {
      let word = RiTa.randomWord();
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


function displayWords2() {
   // LOAD THE WORDS ARE LOADED FROM all_words IN FIREBASE ON SCREEN
   // REPLACE loadWords() WITH THIS
   onValue(ref(db, 'all_words') , (snapshot) => {
      const word = (snapshot.val().word)
   }, {onlyOnce: true});

   // console.log(word);
}



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
      elem.style.borderColor = GENWORD_BORDER;
      elem.style.borderWidth = '1.25px';
      // elem.style.border = "none";
      elem.style.background = "none";// GENWORD_COLOUR;
      elem.style.backgroundImage = GENWORD_BG_GRADIENT;
      //elem.style.borderRadius = "0px";
      //elem.style.backgroundColor = GENWORD_BG;
      elem.style.left = x + "px";
      elem.style.top = y + "px";
      elem.style.padding = "4px";
      document.getElementById('page-right').appendChild(elem);
      WORDS_ELEM.push(elem);
      // console.log(WORDS_ELEM);
      // console.log(elem)
}



/*
onChildAdded(ALL_WORDS_REF, data => {
   displayWords(data.val().word, data.val().x, data.val().y);
   console.log(data.val().word + " " + data.val().x + " " + data.val().y); 
   // console.log(typeof data.val().word)
   WORDS_STR.push(data.val().word);
   console.log(WORDS_STR.length);

   console.log(WORDS_ELEM)
})
*/

function changeWordColor(word) {
   // change the color intensity of the word based on number of clicks
   
}


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
         let new_color = "rgba(" + r + ", " + g + ", " + new_b + ", " + a + ")";
         let gradient = "radial-gradient(rgba(255,255,255,0) 30%, " + new_color + " 80%";

         prev_val = snapshot.val().click;
         new_val = prev_val + 1;
         update(ref(db, 'all_words/' + word), {click: new_val});
         console.log(prev_val);
         console.log(new_val);

         // change color intensity of the word based on number of clicks 
         // IT WOULD BE NICE IF THE COLORS OF ALL WORDS CAN CHANGE RELATIVE 
         // TO EACH CLICK BUT THAT MIGHT BE TOO MUCH WORK -- SAVE TILL THE END 

         // KEEP THE GRADIENTS !!!
         update(ref(db, 'all_words/' + word), {blue: new_b});
         // elem.style.color = new_color;
         elem.style.borderColor = new_color;
         elem.style.backgroundImage = gradient;
         console.log(new_color);
         console.log(gradient)
      } 
      else {
         console.log("no data available");
      }
   }).catch((error) => {
      console.error(error);
   });
}

let gradient = "radial-gradient(rgba(255,255,255,0) 30%, rgba(255, 140, 100, .15) 80%";

// updateWordClick('abstract');


// change the color of the word and border when clicked or hover
// SOME VISUAL SELECT / DESELECT / HOVER ISSUES
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

         // console.log('click');
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
      }); 
   });
}




// updateWordClick('an');


/*
let r = snapshot.val().red;
         let g = snapshot.val().green;
         let b = snapshot.val().blue;
         let a = snapshot.val().alpha;
         let new_b = b <= 253 ? b + 5 : b;   // control within 255
         let new_color = "rgba(" + r + ", " + g + ", " + new_b + ", " + a + ")";
         let gradient = "radial-gradient(rgba(255,255,255,0) 30%, " + new_color + " 80%";

         elem.style.borderColor = new_color;
         elem.style.backgroundImage = gradient;
*/

function updateWords() {
   onValue(ALL_WORDS_REF, (snapshot) => {
      let data = snapshot.val();
      console.log(data);
      
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
         displayWords(word, x, y);
         WORDS_STR.push(word);
         //console.log(WORDS_STR);

         // update color on all pages with the same link
         let elem = document.getElementById(word)
         elem.style.borderColor = color;
         elem.style.backgroundImage = gradient;
      });
      //console.log(WORDS_STR);
      //console.log(WORDS_ELEM[0]);
      mouseInteractions();


   }, { onlyOnce: true });
}

updateWords();

/*
getWords().then((data) => {
   console.log(data)
});
*/

// console.log(WORDS_STR)



// console.log(test_w_e['0']);

//console.log(WORDS_ELEM);
//console.log(WORDS_STR['0']);




function updateScroll() {
   // makes sure that page-left scroll bar is always pointing to the bottom
   let page = document.getElementById("page-left");
   page.scrollTop = page.scrollHeight;
}
updateScroll()

window.addEventListener('resize', () => {
   canvas.width = document.getElementById("page-right").offsetWidth;
   canvas.height = window.innerHeight;
   //ALSO RESIZE WORDS ON PAGE RIGHT
}); 




// ==============
// SETUP CANVAS
// ==============
// DRAW LINES BETWEEN WORDS THAT ARE CLICKED
// MAKE CLICKED WORDS APPEAR ON LEFT PANEL 

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

function showPt(x, y) {
   // show the point on the page given x and y coordinates of ctrl point
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

function drawPath(cur_pos, pre_pos) {
   // draw a path from previous mouse position (js object) to
   // current mouse position (js object)

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

   // WHY IS OFFSET NEEDED QAQ
   let x_offset = 335;  // corrects the strange gap between canvas and generated words
   ctx.beginPath(); 
   ctx.moveTo(pre_pos.x-x_offset, pre_pos.y);
   //ctx.lineTo(cur_pos.x-x_offset, cur_pos.y);
   ctx.bezierCurveTo(ctrl1[0]-x_offset, ctrl1[1], ctrl2[0]-x_offset, ctrl2[1], cur_pos.x-x_offset, cur_pos.y)
   ctx.stroke();
   // showPt(ctrl1[0]-x_offset, ctrl1[1]);
   // showPt(ctrl2[0]-x_offset, ctrl2[1]);
   console.log("cur_pos: " + cur_pos.x + "," + cur_pos.y);
   console.log("pre_pos: " + pre_pos.x + "," + pre_pos.y);
   console.log("ctrl1: " + ctrl1[0] + "," + ctrl1[1]);
   console.log("ctrl2: " + ctrl2[0] + "," + ctrl2[1]);
}

function displaySelWord(elem) {
   // given selected html element <button>, display its textContent on page-left  
   let text = elem.textContent
   document.getElementById("forming-sentence").insertAdjacentText('beforeend', text + ' ');
   console.log(elem.textContent)
   updateScroll();
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


// ===============================
// SWITCHING BETWEEN PAGE SIZES
// ===============================

function redistributeWords() {
   // redistributes page-right words as interface size changes 
   console.log($(WORDS_ELEM[0]).position())
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



// =======================
// WORD BOX INTERACTIONS
// =======================




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
      // console.log('click');
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
                
   }); 
});



// =====================
// FIREBASE 
// =====================

function writeData(userId, name, email, imageUrl) {
   set(ref(db, 'users/' + userId), {
      username: name,
      email: email,
      profile_picture: imageUrl
   });
}

writeData('id0','name0','email0','url0');

function recordWord1(word) {
   const word_ref = ref(db, 'words');
   const new_word = push(word_ref);
}

// recordWord("word0");
// recordWord("word1");

// recordWord("word0")