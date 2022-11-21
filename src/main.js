import "./main.css";
import { makeMouseTrail } from "./mouse-trail.js";
//makeMouseTrail();

let NUM_WORDS = 40; 
let GENWORD_COLOUR = "rgb(255, 70, 90)";
let GENWORD_BORDER = "rgb(255, 140, 100)";
let GENWORD_BG = "rgba(191, 255, 190, 0.9)";
let GENWORD_COLOUR_HOV = 'rgb(81, 0, 255)';
let GENWORD_BORDER_HOV = 'rgb(0, 102, 255)';
let GENWORD_BG_HOV = "rgba(255, 255, 0, 0.9)";
let GENWORD_COLOUR_CLK = "blue";
let GENWORD_BORDER_CLK = "purple";
let GENWORD_BG_CLK = "rgba(230, 255, 57, 0.9)";

let WORDS_ELEM = []; // list of all generated words as html elements
let WORDS_STR = [];  // list of all generated words as strings
let SEL_WORDS = [];   // list of selected words as html elements
let MOUSE_POS_CUR = {x:0, y:0}; 
let MOUSE_POS_PRE = {x:0, y:0};
const ENTER_KEY = document.getElementById("enter-key");

const canvas = document.querySelector("canvas");
const canvas_w = document.getElementById("page-right").offsetWidth;
const canvas_h = window.innerHeight;
canvas.width = canvas_w;
canvas.height = canvas_h;
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

// generate and scatter words on screen when screen loads 
function loadWords() {
   let left_col_w = document.getElementById("page-left").offsetWidth;
   let right_page_w = document.getElementById("page-right").offsetWidth;
   let right_page_h = window.innerHeight;

   // generate random words and scatter on page
   for (let i = 0; i < NUM_WORDS; i++) {
      let word = RiTa.randomWord();
      WORDS_STR.push(word);

      let elem = document.createElement("button");
      elem.className = "gen-word";
      elem.textContent = word;
      elem.style.position = "absolute";
      //elem.style.color = GENWORD_COLOUR;
      elem.style.borderStyle = "solid";
      //elem.style.borderColor = GENWORD_BORDER;
      //elem.style.borderRadius = "3px";
      //elem.style.backgroundColor = GENWORD_BG;
      elem.style.padding = "5px";
      elem.style.left = Math.round(randomNum(left_col_w+20, right_page_w)) + "px";
      elem.style.top = Math.round(randomNum(20, right_page_h-70)) + "px";
      document.getElementById('page-right').appendChild(elem);
      WORDS_ELEM.push(elem);
   }
}
loadWords();

function updateScroll() {
   let page = document.getElementById("page-left");
   page.scrollTop = page.scrollHeight;
}
updateScroll()




// DRAW LINES BETWEEN WORDS THAT ARE CLICKED
// MAKE CLICKED WORDS APPEAR ON LEFT PANEL 

ctx.fillStyle = "rgba(190,190,190, 0)"
ctx.fillRect(0,0,canvas_w,canvas_h);

ctx.lineWidth = .9;
ctx.strokeStyle = "rgb(127, 139, 255)";
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

document.addEventListener("keyup", function(event) {
   if (event.keyCode === 13 || event.code === "Enter") {
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
   }
});


// change the color of the word and border when clicked or hover
// SOME VISUAL SELECT / DESELECT / HOVER ISSUES
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




// MAKE WORDS APPEAR ON LEFT BAR 

// WORDS NOT REALLY GENERATING ON RIGHT-most 1/4 OF SCREEN 


































/*
document.querySelector("form").addEventListener("submit", function(e) {
   e.preventDefault();

   var fullWidth = window.innerWidth;
   var fullHeight = window.innerHeight;

   var text = this.querySelector("input[type='text']").value;

   var elem = document.createElement("div");
   elem.textContent = text;
   elem.style.position = "absolute";
   elem.style.left = Math.round(Math.random() * fullWidth) + "px";
   elem.style.top = Math.round(Math.random() * fullHeight) + "px";
   document.body.appendChild(elem);
});
*/