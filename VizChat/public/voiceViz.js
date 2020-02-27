var amp;
var volHistory = [];

let mic;
let fft;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  mic = new p5.AudioIn();
  mic.start();

  amp = new p5.Amplitude();
  amp.setInput(mic);

}

function draw() {
  background(0);

  voiceViz();

}

function voiceViz(){
    var vol = amp.getLevel();
    volHistory.push(vol);
    stroke(255);
    noFill();
    translate(width/2, height/2);
    beginShape();
    for (var i = 0; i < volHistory.length; i++){
    var r = map(volHistory[i], 0, 1, windowHeight/4, windowHeight);
    var x = r * cos(i);
    var y = r * sin(i);

    vertex(x, y);
    } 
    endShape();
    if (volHistory.length >= 360) {
    volHistory.splice(0, 1);
    }
}