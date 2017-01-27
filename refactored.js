//Deliquescent
//the hanhanhan version
//A fork of:
//http://codepen.io/tmrDevelops/pen/OPZKNd
//Tiffany Rayside

(function hannahsVersion(){
  'use strict';

//canvas
var canvas = document.getElementById('refactored');
var context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

 //y height (canvas height)
const w = 15; //grid sq width
const h = 15; //grid sq height

var rows = canvas.height/w; //number of rows
var columns = canvas.width/w; //number of columns

const K_amplificationX = 0.013; //X axis amplification - multiplier for difference between resting position and pulled point
const K_decayX = 0.025; //X axis decay
const K_amplificationY = 0.01; //Y axis amplification - multiplier for difference between resting position and pulled point
const K_decayY = 0.035; //decay

var parts; //particles
var colorCycle = 0; //color offset which gets incremented with time
var mouseX = 0; //mouse x
var mouseY = 0; //mouse y
var mouseDown = false; //mouse down flag\
var displacementMax = 0;
var colorScale = 1;

var Part = function() {
  this.x = 0; //x pos
  this.y = 0; //y pos
  this.xShift = 0; //velocity x
  this.yShift = 0; //velocity y
  this.ind_x = 0; //index x
  this.ind_y = 0; //index y
  this.displacement = 0; //distance from resting position
  this.off_dx = 0; //distance along x axis from resting position
  this.off_dy = 0; //distance along y axis from resting position
};

Part.prototype.frame = function frame() {

  if (this.ind_x == 0 || this.ind_x == columns - 1 || this.ind_y == 0 || this.ind_y == rows - 1) {
    //pin edges for stability
    this.x = this.ind_x * w;
    this.y = this.ind_y * h;
    return;
  }

  //off_dx, off_dy = offset distance x, y
  var off_dx = this.ind_x * w - this.x;
  var off_dy = this.ind_y * h - this.y;

  this.off_dx = off_dx;
  this.off_dy = off_dy;

  this.displacement = Math.sqrt(off_dx * off_dx + off_dy * off_dy);

  var xPull = 0;
  var yPull = 0;

  // Vector math
  // Net position from each neighbor (left, right, up, down)
  // with the current position of the particle/grid intersection
  xPull += parts[this.ind_x - 1][this.ind_y].x - this.x;
  yPull += parts[this.ind_x - 1][this.ind_y].y - this.y;

  xPull += parts[this.ind_x + 1][this.ind_y].x - this.x;
  yPull += parts[this.ind_x + 1][this.ind_y].y - this.y;

  xPull += parts[this.ind_x][this.ind_y - 1].x - this.x;
  yPull += parts[this.ind_x][this.ind_y - 1].y - this.y;

  xPull += parts[this.ind_x][this.ind_y + 1].x - this.x;
  yPull += parts[this.ind_x][this.ind_y + 1].y - this.y;

  //amplification * net pull - decaying damping
  this.xShift += K_amplificationX * xPull - K_decayX * this.xShift;
  this.yShift += K_amplificationY * yPull - K_decayY * this.yShift;

  this.x += this.xShift;
  this.y += this.yShift;

  if (mouseDown) {
    var dx = this.x - mouseX;
    var dy = this.y - mouseY;
    var ɋ = Math.sqrt(dx * dx + dy * dy);
    if (ɋ < 50) {
      ɋ = ɋ < 10 ? 10 : ɋ;
      this.x -= dx / ɋ * 5;
      this.y -= dy / ɋ * 5;
    }
  }
};

Part.prototype.displacementStyle = function displacementStyle(){
  //note: displacement is always positive,
  //off_dx and off_dy are positive and negative

  //hue is offset by a cycling color, in a 120 deg window normalized by % max displacement (color)
  var hue = colorCycle + 120 * this.displacement / colorScale;

  var saturation_offset = 40;
  var saturation = saturation_offset + this.displacement / colorScale;
  saturation = saturation > 90 ? 90 : saturation;
  saturation = saturation < 40 ? 40 : saturation;
  saturation = saturation + "%";

  var lightness_offset = 60;
  var lightness = lightness_offset + this.off_dy / colorScale;
  lightness = lightness > 80 ? 80 : lightness;
  lightness = lightness < 40 ? 40 : lightness;
  lightness = lightness + "%";

  var alpha_offset = 0.6;
  var alpha = alpha_offset + this.off_dx;
  alpha = alpha > 1 ? 1 : alpha;
  alpha = alpha < 0.2 ? 0.2 : alpha;

  context.strokeStyle = 'hsla(' + hue + ',' + saturation + ', ' + lightness + ', ' + alpha +')';
  context.lineWidth = 1 + this.displacement * 0.03;
  context.beginPath();
}

function initializeArray() {
    parts = []; //particle array
    for (var i = 0; i < columns; i++) {
      parts.push([]);
      for (var j = 0; j < rows; j++) {
        var p = new Part();
        p.ind_x = i;
        p.ind_y = j;
        p.x = i * w;
        p.y = j * h;
        parts[i][j] = p;
      }
    }
  }

//draw grid
function draw(i,j) {
  var p = parts[i][j];
  // these commented lines are fun to play with -- change drawing patterns
  // var pAcross = parts[i][j + 1]; //across row
  // var pDown = parts[i + 1][j]; //down column

  // context.moveTo(p.x, p.y);
  // context.lineTo(pAcross.x, pAcross.y);
  // context.moveTo(p.x, p.y);
  // context.lineTo(pDown.x, pDown.y);
  var pUp = parts[i][j - 1];
  var pDownRight = parts[i + 1][j + 1];
  var pDownLeft = parts[i - 1][j + 1];

  context.moveTo(p.x, p.y);
  //context.lineTo(pUp.x, pUp.y);
  context.moveTo(p.x, p.y);
  context.lineTo(pDownRight.x, pDownRight.y);
  context.moveTo(p.x, p.y);
  context.lineTo(pDownLeft.x, pDownLeft.y);
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

//mouse
canvas.onmousedown = () => mouseDown = true;
canvas.onmouseup = () => mouseDown = false;

canvas.onmousemove = function MSMV(e) {
  var rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
}


initializeArray();

window.onload = function() {
  run();

  function run() {
    //wipe canvas
    context.fillStyle = "hsla(0, 5%, 5%, .1)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    colorCycle -= 1;
    displacementMax = 0;
    //looping through array of points
    for (var i = 1; i < columns - 1; i++) {
      for (var j = 1; j < rows - 1; j++) {
        var p = parts[i][j];
        context.beginPath();
        p.frame();
        p.displacementStyle();
        draw(i,j);
        context.stroke();
        //displacementMax < p.displacement && p.displacement = displacementMax;
        displacementMax = displacementMax > p.displacement ? displacementMax : p.displacement
      }
      colorScale = displacementMax;
    }
    window.requestAnimationFrame(run);
  }
};
})();
