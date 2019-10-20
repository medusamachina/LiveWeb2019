/* HELPFUL LINKS
https://creative-coding.decontextualize.com/arrays-and-objects/
https://creative-coding.decontextualize.com/text-and-type/
https://www.kirupa.com/html5/picking_random_item_from_array.htm
audio: https://www.npmjs.com/package/microphone-stream
Audio: https://stackoverflow.com/questions/24874568/live-audio-via-socket-io-1-0
Background video credit: The phase and libration of the Moon for 2011, at hourly intervals: 
https://svs.gsfc.nasa.gov/cgi-bin/details.cgi?aid=3810

*/

let socket;
let audioNode;
let mediaRecorder = false;
var poetry = [];
const lyricsSrc = "I am finetuning my soul, to the universal wavelength, no one is a lover alone, I propose an atom dance, Our hearts are coral reefs in low tide, Love is the ocean we crave restlessly, turning around and around, I am dancing towards transformation, Learning by love to open it up, Let this ugly wound breathe, We fear unconditional heart space, Healed by atom dance, When you feel the flow as primal love, Enter the pain and dance with me, We aim at peeling off, Dead layers of loveless love";
var lyrics = lyricsSrc.split(",");
var constraints = { audio: true };
  
function setup() {
  setupCanvas();
  setupSocket();

  audioNode = document.getElementById('audio');
  navigator.mediaDevices.getUserMedia(constraints).then(setMediaRecorder).catch(console.log);

  console.log('setup is happening');

}

function windowResized () {
  resizeCanvas (windowWidth, windowHeight/1.45);
  
}

function draw() {
  clear();
  for (i = 0; i < poetry.length; i++) {
  poetry[i].display();
  }
  //delete previous text display
  //based off of removing objects coding train https://www.youtube.com/watch?v=EyG_2AdHlzY
  if (poetry.length > 1){
    poetry.splice(0,1);
  }
}

function setupCanvas(){
  let canvas = createCanvas(windowWidth, windowHeight/1.45);
  canvas.parent("middleLive");
  
  canvas.canvas.onmousedown = function() {
    textDisplayOnClick();
    startRecording();
  }

  canvas.canvas.onmouseup = function() {
    stopRecording()
  }

}

function setupSocket(){
  socket = io.connect('//gmg262.itp.io:8004');
  socket.on('mouse', newLine);
  socket.on('connect', function() {
    console.log("Connected");
  });


  // When the client receives a voice message it will play the sound
  socket.on('voice', function(arrayBuffer) {
    var blob = new Blob([arrayBuffer], { 'type' : 'audio/ogg; codecs=opus' });
    var audio = document.createElement('audio');
    audio.src = window.URL.createObjectURL(blob);
    audio.play();
  });

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

  //TODO change this to serializing array objects, each called on mouse released
  for (i = 0; i < lyrics.length; i++){
    textSize(40);
    textFont('Verdana');
    fill(random(255), 0, random(0, 100), 250);
    let w = new Word(lyricTest, mouseX, mouseY, random(255));
    poetry.push(w);
  }
}


function startRecording() {
  if(mediaRecorder) {
    mediaRecorder.start();
  }else{
    console.log("recording broken");
  }
}

function stopRecording() {
  if(mediaRecorder) {
    mediaRecorder.stop()
  }else{
    console.log("recording working");
  }
}

function newLine(receiveDat){
  var lyricTest = lyrics[Math.floor(Math.random() * lyrics.length)];
  print("test: ", lyricTest);
  for (i = 0; i < lyrics.length; i++){
    textSize(40);
    textFont('Verdana');
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
    background(0, 0, 0, 0);
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
