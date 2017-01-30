//Deliquescent
//the hanhanhan version
//A fork of:
//http://codepen.io/tmrDevelops/pen/OPZKNd
//Tiffany Rayside

//canvas
var canvas = document.getElementById('canv-one');
var context = canvas.getContext('2d');
canvas.width = 300;
canvas.height = 300;

 //y height (canvas height)
const w = 150; //grid sq width
const h = 150; //grid sq height

var rows = 1//canvas.height/w; //number of rows
var columns = 5//canvas.width/w; //number of columns
var j = 1

const KX1 = 0.013; //X axus amplification - multiplier for difference between resting position and pulled point
const KX2 = 0.025; //X axis decay
const KY1 = 0.01; //Y axis amplification - multiplier for difference between resting position and pulled point
const KY2 = 0.035; //decay

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
  this.vx = 0; //velocity x
  this.vy = 0; //velocity y
  this.ind_x = 0; //index x
  this.ind_y = 0; //index y
  this.displacement = 0; //distance from resting position
  this.off_dx = 0; //distance along x axis from resting position
  this.off_dy = 0; //distance along y axis from resting position
};

Part.prototype.frame = function frame() {

  if (this.ind_x == 0 || this.ind_x == columns - 1) {
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

  var ax = 0;
  var ay = 0;

  ax -= this.x - parts[this.ind_x - 1].x;
  ay -= this.y - parts[this.ind_x - 1].y;

  ax -= this.x - parts[this.ind_x + 1].x;
  ay -= this.y - parts[this.ind_x + 1].y;

  //amplification * net pull - decaying damping
  this.vx += KX1 * ax - KX2 * this.vx;
  this.vy += KY1 * ay - KY2 * this.vy;

  this.x += this.vx;
  this.y += this.vy;

  if (mouseDown) {
    var dx = this.x - mouseX;
    var dy = this.y - mouseY;
    var ɋ = Math.sqrt(dx * dx + dy * dy);
    if (ɋ < 100) {
      ɋ = ɋ < 10 ? 10 : ɋ;
      this.x -= dx / ɋ * 5;
      this.y -= dy / ɋ * 5;
    }
  }
};

function initializeArray() {
    parts = []; //particle array
    for (var i = 0; i < columns; i++) {
      //parts.push([]);
      //for (var j = 0; j < rows; j++) {
        var p = new Part();
        p.ind_x = i;
        p.ind_y = j;
        p.x = i * w;
        p.y = j * h;
        parts[i] = p;
      //}
    }
  }

//draw grid 
function draw(i) {
  var p = parts[i];
  // these commented lines are fun to play with -- change drawing patterns
  var pAcross = parts[i+1]; //across row
  //var pDown = parts[i + 1][j]; //down column

  context.moveTo(p.x, p.y);
  context.lineTo(pAcross.x, pAcross.y); 

  context.arc(p.x, p.y, 20, 0, 2*Math.PI);
  //context.moveTo(p.x, p.y);
  //context.lineTo(pDown.x, pDown.y); 
  // var pUp = parts[i][j - 1];
  // var pDownRight = parts[i + 1][j + 1];
  // var pDownLeft = parts[i - 1][j + 1];

  // context.moveTo(p.x, p.y);
  // //context.lineTo(pUp.x, pUp.y); 
  // context.moveTo(p.x, p.y);
  // context.lineTo(pDownRight.x, pDownRight.y); 
  // context.moveTo(p.x, p.y);
  // context.lineTo(pDownLeft.x, pDownLeft.y); 
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

window.onresize = resize();

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
    for (var i = 0; i < columns - 1; i++) {
      //for (var j = 1; j < rows - 1; j++) {
        var p = parts[i];
        context.beginPath();
        p.frame();
        p.displacementStyle();
        draw(i);
        context.stroke();
        //displacementMax < p.displacement && p.displacement = displacementMax;
        //displacementMax = displacementMax > p.displacement ? displacementMax : p.displacement 
      //}
      //colorScale = displacementMax;
      colorScale = 100;
    }
    window.requestAnimationFrame(run);
  }
};