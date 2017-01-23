//Deliquescent
//the hanhanhan version
//A fork of:
//http://codepen.io/tmrDevelops/pen/OPZKNd
//Tiffany Rayside

//canvas
(function appendCanvases() {

  var canvas = document.getElementById('canv-one');
  canvas.className = "flex-col canvas-group"
  var context = canvas.getContext('2d');
  canvas.width = 300;
  canvas.height = 300;
  context.lineWidth = 5

   //y height (canvas height)
  const w = 150; //grid sq width
  const h = 150; //grid sq height

  var rows = 1//canvas.height/w; //number of rows
  var columns = 3//canvas.width/w; //number of columns
  var j = 1

  const KX1 = 0.013; //X axis amplification - multiplier for difference between resting position and pulled point
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

  var timeStack = []
  var variablesStack = {}
  var timepoints = 200 //

  var controlVariables =
    [//'xPull',
    'yPull',
    //'vx',
    'vy',
    'displacement',
    //'off_dx',
    'off_dy',
    //'x',
    'y'
    ]

  var canvases = {}
  var contexts = {}
  // var yScales = { default: 1}
  // var precision = { default: 1 }
  var canvasSection = document.getElementById('canvases')

  for(var i = 0; i < controlVariables.length; i++){
    canvases[controlVariables[i]] = document.createElement('canvas')
    var div = document.createElement('div')
    var title = document.createElement('h6')
    var currentValue = document.createElement('p')
    currentValue.dataset.value = controlVariables[i]
    title.innerHTML = controlVariables[i]

    canvases[controlVariables[i]].id = controlVariables[i]
    canvases[controlVariables[i]].height = 300
    canvases[controlVariables[i]].width = 300
    contexts[controlVariables[i]] = canvases[controlVariables[i]].getContext('2d')
    contexts[controlVariables[i]].lineWidth = 3

    canvasSection.appendChild(div)
    div.className = "flex-col canvas-group"
    div.appendChild(title)
    div.appendChild(currentValue)
    div.appendChild(canvases[controlVariables[i]])
  }

  var labels = [...document.querySelectorAll('[data-value]')]

  var Part = function() {
    this.x = 0; //x pos
    this.y = 0; //y pos
    this.xPull = 0;
    this.yPull = 0;
    this.vx = 0; //velocity x
    this.vy = 0; //velocity y
    this.ind_x = 0; //index x
    this.ind_y = 0; //index y
    this.displacement = 0; //distance from resting position
    this.off_dx = 0; //distance along x axis from resting position
    this.off_dy = 0; //distance along y axis from resting position
  };

  Part.prototype.initializeStack = function () {

  };

  Part.prototype.frame = function frame() {

    if (this.ind_x == 0 || this.ind_x == columns - 1) {
      //pin edges for stability
      this.x = this.ind_x * w;
      this.y = this.ind_y * h;
      return;
    }

    //off_dx, off_dy = offset distance x, y
    //distance from resting position
    var off_dx = this.ind_x * w - this.x;
    var off_dy = this.ind_y * h - this.y;

    this.off_dx = off_dx;
    this.off_dy = off_dy;
    this.displacement = Math.sqrt(off_dx * off_dx + off_dy * off_dy);

    this.xPull = 0;
    this.yPull = 0;

    this.xPull -= this.x - parts[this.ind_x - 1].x;
    this.yPull -= this.y - parts[this.ind_x - 1].y;

    this.xPull -= this.x - parts[this.ind_x + 1].x;
    this.yPull -= this.y - parts[this.ind_x + 1].y;



    //amplification * net pull - decaying damping
    this.vx += KX1 * this.xPull - KX2 * this.vx;
    this.vy += KY1 * this.yPull - KY2 * this.vy;
    this.ind_x * w
    //this.x += this.vx;
    this.y += this.vy;

    if (mouseDown) {
      var dx = 0//this.x - mouseX;
      var dy = this.y - mouseY;
      var displacement = Math.sqrt(dx * dx + dy * dy);
      if (displacement < 100) {
        displacement = displacement < 10 ? 10 : displacement;
        //this.x -= dx / displacement * 5;
        this.y -= dy / displacement * 5;
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
    context.fillStyle = 'hsla(' + hue + ',' + saturation + ', ' + lightness + ', ' + alpha +')';
    context.strokeStyle = 'hsla(' + hue + ',' + saturation + ', ' + lightness + ', ' + alpha +')';
    context.beginPath();
  }

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
    if(pAcross){
    context.moveTo(p.x, p.y);
    context.lineTo(pAcross.x, pAcross.y);
    }

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

  //mouse
  canvas.onmousedown = () => mouseDown = true;
  canvas.onmouseup = () => mouseDown = false;

  canvas.onmousemove = function MSMV(e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  // doesn't work! assigns string 'item' instead of value
  // controlVariables.forEach(item => variablesStack.push({item:[]}))
  controlVariables.forEach(item => variablesStack[item] = [])

  initializeArray();
  run();

  function run() {
    //wipe canvas
    context.fillStyle = "hsla(0, 5%, 5%, .1)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.translate(0,0)
    colorCycle -= 1;
    displacementMax = 0;
    //looping through array of points
    for (var i = 0; i < columns; i++) {
        var p = parts[i];
        context.beginPath();
        p.frame();
        p.displacementStyle();
        // if(i === 0 || i === columns - 1){
        //   context.fillStyle = 'white'
        //   context.strokeStyle = 'white'
        // }
        draw(i);
        context.fill()
        context.stroke();


        colorScale = 100;

      // plot each control variable
      if(i === 1){
        // x axis values
        timeStack.push(Date.now())
        // y axis values
        controlVariables.forEach(value => variablesStack[value].push(p[value]))
        // slide the time window
        if(timeStack.length > timepoints) {
          timeStack.shift()
          controlVariables.forEach(value => variablesStack[value].shift())
        }

        // live time-based plot
        controlVariables.forEach(drawCanvas)
      }
    }

    window.requestAnimationFrame(run);
    context.translate(-0,-0)
  }

  // append canvases

  function drawCanvas(value){
    // contexts[value].fillStyle = 'orange'
    // contexts[value].fillRect(0,0,canvases[value].width, canvases[value].height)
    contexts[value].clearRect(0, 0, canvases[value].width, canvases[value].height)
    contexts[value].strokeRect(0, 0, canvases[value].width, canvases[value].height)
    contexts[value].translate(0, canvases[value].height/2)
    contexts[value].beginPath()
    contexts[value].moveTo(0,0)
    var xInt = canvases[value].width/timepoints

    for(var t=0; t < timepoints - 1; t++){
      var xTime = xInt * t
      var yVal = variablesStack[value][t]
      contexts[value].lineTo(xTime, yVal)
      var label = labels.filter(l => l.dataset.value === value)[0]
      label.innerHTML = yVal ? yVal.toFixed(2) : ""
    }
    contexts[value].stroke()
    contexts[value].translate(0, -canvases[value].height/2)
  }
})()
