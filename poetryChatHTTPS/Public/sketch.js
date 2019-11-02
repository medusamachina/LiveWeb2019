/* HELPFUL LINKS
https://creative-coding.decontextualize.com/arrays-and-objects/
https://creative-coding.decontextualize.com/text-and-type/
https://www.kirupa.com/html5/picking_random_item_from_array.htm
audio: https://www.npmjs.com/package/microphone-stream
Audio: https://stackoverflow.com/questions/24874568/live-audio-via-socket-io-1-0
*/

let socket = io();
let audioNode;
let mediaRecorder = false;
var poetry = [];
const lyricsSrc = "I am finetuning my soul, to the universal wavelength, no one is a lover alone, I propose an atom dance, Our hearts are coral reefs in low tide, Love is the ocean we crave restlessly, turning around and around, I am dancing towards transformation, Learning by love to open it up, Let this ugly wound breathe, We fear unconditional heart space, Healed by atom dance, When you feel the flow as primal love, Enter the pain and dance with me, We aim at peeling off, Dead layers of loveless love";
var lyrics = lyricsSrc.split(",");
var constraints = { audio: true };


window.addEventListener('load', setup);

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Connected");
});

  
function setup() {
  createCanvas(windowWidth, windowHeight);
  audioNode = document.getElementById('audio');
  socket = io.connect('//gmg262.itp.io:8004');
  socket.on('mouse', newLine);
}

function draw() {
  background(0);
  for (i = 0; i < poetry.length; i++) {
  poetry[i].display();
  }
}

function mousePressed() {
  textDisplayOnClick();
  startRecording();
}

function mouseReleased() {
  stopRecording()
}

function textDisplayOnClick() {
  var clickDat = {
    x: mouseX,
    y: mouseY
  }
  socket.emit('mouse', clickDat);
  console.log(clickDat);

  //https://www.kirupa.com/html5/picking_random_item_from_array.htm
  var lyricTest = lyrics[Math.floor(Math.random() * lyrics.length)];
  print("test: ", lyricTest);
  for (i = 0; i < lyrics.length; i++){
    textSize(20);
    textFont('Courier');
    fill(random(255), 0, random(0, 100), 250);
    let w = new Word(lyricTest, mouseX, mouseY, random(255));
    poetry.push(w);
  }
}

function startRecording() {
  if(mediaRecorder) {
    mediaRecorder.start();
  }
}

function stopRecording() {
  if(mediaRecorder) {
    mediaRecorder.stop()
  }
}

function newLine(receiveDat){
  var lyricTest = lyrics[Math.floor(Math.random() * lyrics.length)];
  print("test: ", lyricTest);
  for (i = 0; i < lyrics.length; i++){
    textSize(20);
    textFont('Courier');
    fill(random(255), 0, random(0, 100), 250);
    let w = new Word(lyricTest, receiveDat.x, receiveDat.y, random(255));
    poetry.push(w);
  }
}

class Word{
  constructor(n, x, y, r, g, b){
  this.x = x;
  this.y = y;
  this.name = n;

  }
  display (){
    text(this.name, this.x, this.y);
    background(0, 0, 0, 40)
  }
}

//audio portion
function setMediaRecorder(mediaStream) {
  mediaRecorder = new MediaRecorder(mediaStream);

  mediaRecorder.onstart = function(e) {
      this.chunks = [];
  };
  mediaRecorder.ondataavailable = function(e) {
      this.chunks.push(e.data);
  };
  mediaRecorder.onstop = function(e) {
      var blob = new Blob(this.chunks, { 'type' : 'audio/ogg; codecs=opus' });
      socket.emit('radio', blob);
  };
}

// When the client receives a voice message it will play the sound
socket.on('voice', function(arrayBuffer) {
  var blob = new Blob([arrayBuffer], { 'type' : 'audio/ogg; codecs=opus' });
  var audio = document.createElement('audio');
  audio.src = window.URL.createObjectURL(blob);
  audio.play();
});

navigator.mediaDevices.getUserMedia(constraints).then(setMediaRecorder).catch(console.log);
