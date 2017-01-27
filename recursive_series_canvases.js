//Deliquescent
//the hanhanhan version
//A fork of:
//http://codepen.io/tmrDevelops/pen/OPZKNd
//Tiffany Rayside

//canvas
(function appendCanvases() {

  // bouncing point canvas setup
  var canvas = document.getElementById('canv-one');
  canvas.className = "controlvariables"
  var context = canvas.getContext('2d');
  canvas.width = 500;
  canvas.height = 300;
  context.lineWidth = 5

  //constants


  // control variable canvas setup
  var cvCanvasHeight = 275
  var cvCanvasWidth = 300
  var timepoints = 200
  var xInt = cvCanvasWidth / timepoints

   //y height (canvas height)
  const w = 150; //grid sq width
  const h = 150; //grid sq height

  var rows = 1//canvas.height/w; //number of rows
  var columns = 3//canvas.width/w; //number of columns
  var j = 1
  var space_w = (canvas.width - (columns - 1) * w) / 2

  var KX1 = 0.013; //X axis amplification - multiplier for difference between resting position and pulled point
  var KX2 = 0.025; //X axis decay
  var KY1 = 0.01; //Y axis amplification - multiplier for difference between resting position and pulled point
  var KY2 = 0.035; //decay

  var parts; //particles
  var colorCycle = 0; //color offset which gets incremented with time
  var mouseX = 0; //mouse x
  var mouseY = 0; //mouse y
  var mouseDown = false; //mouse down flag\
  var displacementMax = 0;
  var colorScale = 1;

  // button event listeners
  var stepButton = document.getElementById('Step')
  var runButton = document.getElementById('Run')
  var runState = true
  var stepThrough = false
  var toggle // requestAnimationFrame ID

  // amplification/decay constant inputs
  var Ka = document.getElementById('Ka')
  var Kd = document.getElementById('Kd')
  Ka.value = KY1
  Kd.value = KY2

  Ka.addEventListener('keydown', updateAmplificationConstant)
  Kd.addEventListener('keydown', updateDecayConstant)

  function updateAmplificationConstant(event){
    if (event.keyCode === 13)
      {
        KY1  = this.value
        this.style.color = 'goldenrod'
        window.setTimeout(() => Ka.style.color = 'black', 1000)
        // this.setAttribute('style', 'background-color: goldenrod')
      }
  }

  function updateDecayConstant(event){
    if (event.keyCode === 13)
      {
        KY2  = this.value
        this.style.color = 'goldenrod'
        window.setTimeout(() => Ka.style.color = 'black', 1000)
      }
  }

  // plot control variables as function of time
  var timeStack = [] // time points
  var variablesStack = {} // objlit of arrays of control variables over time

  var controlVariables =
    [//'xPull',
    'yPull',
    //'xShift',
    'yShift',
    'K<sub>a</sub> &times yPull',
    'K<sub>d</sub> &times yShift'
    //'displacement',
    //'off_dx',
    //'off_dy',
    //'x',
    //'y'
    ]

  var canvases = {}
  var contexts = {}
  // var yScales = { default: 1}
  // var precision = { default: 1 }

  // set up each control variable canvas
  var canvasSection = document.getElementById('canvases')

  for(var i = 0; i < controlVariables.length; i++){
    canvases[controlVariables[i]] = document.createElement('canvas')
    var div = document.createElement('div')
    var currentValue = document.createElement('var')
    var br = document.createElement('br')
    currentValue.dataset.value = controlVariables[i]

    canvases[controlVariables[i]].id = controlVariables[i]
    canvases[controlVariables[i]].height = cvCanvasHeight
    canvases[controlVariables[i]].width = cvCanvasWidth
    contexts[controlVariables[i]] = canvases[controlVariables[i]].getContext('2d')
    contexts[controlVariables[i]].lineWidth = 3

    canvasSection.appendChild(div)
    div.className = "canvas-group"
    div.appendChild(currentValue)
    // div.appendChild(br)
    div.appendChild(canvases[controlVariables[i]])
  }

  var labels = [...document.querySelectorAll('[data-value]')]


  // set up deliquescent demo with few points
  var Part = function() {
    this.x = 0; //x pos
    this.y = 0; //y pos
    this.xPull = 0;
    this.yPull = 0;
    this.xShift = 0; //velocity x
    this.yShift = 0; //velocity y
    //this.Ka_yPull = 0;
    this['Ka &times yPull'] = 0;
    this['K<sub>d</sub> &times yShift'] = 0;
    this.ind_x = 0; //index x
    this.ind_y = 0; //index y
    //this.displacement = 0; //distance from resting position
    this.off_dx = 0; //distance along x axis from resting position
    this.off_dy = 0; //distance along y axis from resting position
  };

  Part.prototype.initializeStack = function () {

  };

  Part.prototype.frame = function frame() {

    if (this.ind_x == 0 || this.ind_x == columns - 1) {
      //pin edges for stability
      this.x = this.ind_x * w + space_w;
      this.y = this.ind_y * h;
      return;
    }

    //off_dx, off_dy = offset distance x, y
    //distance from resting position
    var off_dx = this.ind_x * w + space_w - this.x;
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

    this['K<sub>a</sub> &times yPull'] = KY1 * this.yPull
    this['K<sub>d</sub> &times yShift'] = - KY2 * this.yShift

    //amplification * net pull - decaying damping
    this.xShift += KX1 * this.xPull - KX2 * this.xShift;
    this.yShift += KY1 * this.yPull - KY2 * this.yShift;
    this.ind_x * w + space_w
    //this.x += this.xShift;
    this.y += this.yShift;

    if (mouseDown) {
      var dx = this.x - mouseX;
      var dy = this.y - mouseY;
      var displacement = Math.sqrt(dx * dx + dy * dy);
      if (displacement < 100) {
        displacement = displacement < 10 ? 10 : displacement;
        //this.x -= dx / displacement * 5;
        this.y += 10 * dy / displacement;
      }
    }
  };

  Part.prototype.displacementStyle = function displacementStyle(){
    //note: displacement is always positive,
    //off_dx and off_dy are positive and negative

    //hue is offset by a cycling color, in a 120 deg window normalized by % max displacement (color)
    var hue = colorCycle// + 120 * this.displacement / colorScale;

    // var saturation_offset = 40;
    // var saturation = saturation_offset + this.displacement / colorScale;
    // saturation = saturation > 90 ? 90 : saturation;
    // saturation = saturation < 40 ? 40 : saturation;
    // saturation = saturation + "%";
    //
    // var lightness_offset = 60;
    // var lightness = lightness_offset + this.off_dy / colorScale;
    // lightness = lightness > 80 ? 80 : lightness;
    // lightness = lightness < 40 ? 40 : lightness;
    // lightness = lightness + "%";
    //
    // var alpha_offset = 0.6;
    // var alpha = alpha_offset + this.off_dx;
    // alpha = alpha > 1 ? 1 : alpha;
    // alpha = alpha < 0.2 ? 0.2 : alpha;
    //context.fillStyle = 'hsla(' + hue + ',' + saturation + ', ' + lightness + ', ' + alpha +')';
    //context.strokeStyle = 'hsla(' + hue + ',' + saturation + ', ' + lightness + ', ' + alpha +')';
    context.fillStyle = `hsla(${hue % 360}, 80%, 50%, 1)`
    context.strokeStyle = `hsla(${hue % 360}, 80%, 50%, 1)`

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
          p.x = i * w + space_w;
          p.y = j * h;
          parts[i] = p;
        //}
      }
    }

  //draw grid
  function drawLine(i) {
    var p = parts[i];
    // these commented lines are fun to play with -- change drawing patterns
    var pAcross = parts[i+1]; //across row
    //var pDown = parts[i + 1][j]; //down column
    if(pAcross){
    context.moveTo(p.x, p.y);
    context.lineTo(pAcross.x, pAcross.y);
    }
  }

  function drawCircle(i){
    var p = parts[i];
    context.arc(p.x, p.y, 20, 0, 2*Math.PI);
  }
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


  //mouse
  canvas.onmousedown = () => mouseDown = true;
  canvas.onmouseup = () => mouseDown = false;

  canvas.onmousemove = function MSMV(e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  //runButton.onmousedown = () => console.log('hi')
  runButton.addEventListener('click', toggleAnimation)
  stepButton.addEventListener('click', stepAnimation)

  function toggleAnimation(){
    runState = !runState
    if (runState){
      run()
      // window.requestAnimationFrame(run)
    } else {
      window.cancelAnimationFrame(toggle)
    }
  }

  function stepAnimation(){
    toggleAnimation()
    window.cancelAnimationFrame(toggle)
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
    // context.translate(0,0)
    colorCycle -= 1;
    displacementMax = 0;
    colorScale = 100;
    //looping through array of points
    for (var i = 0; i < columns; i++) {
        var p = parts[i];
        context.beginPath();
        p.frame();
        p.displacementStyle();
        drawLine(i);
        context.stroke();
        context.beginPath();
        if(i === 0 || i === columns - 1){
          context.fillStyle = 'white';
          context.strokeStyle = 'white';
          context.arc(p.x, p.y, 20, 0, 2 * Math.PI);
        } else {
          drawCircle(i);

        }
        context.fill();

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

    // context.translate(-0,-0)

    if (stepThrough === false)
    {
      toggle = window.requestAnimationFrame(run);
    }

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

    var label = labels.filter(l => l.dataset.value === value)[0]

    for(var t=0; t < variablesStack[value].length - 1; t++){
      var xTime = xInt * t
      var yVal = Number(variablesStack[value][t].toFixed(2))
      contexts[value].lineTo(xTime, yVal)

      //label.innerHTML = yVal ? `${value}:  ${yVal.toFixed(2)}` : `${value}:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`
      label.innerHTML = `${value}:  ${yVal}`
    }
    contexts[value].stroke()
    contexts[value].translate(0, -canvases[value].height/2)
  }
})()
