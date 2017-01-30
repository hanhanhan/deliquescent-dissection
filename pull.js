  'use strict'

  // canvas setup
  var canvas = document.getElementById('pull')
  canvas.height = 500
  canvas.width = 500
  var context = canvas.getContext('2d')
  context.lineWidth = 5
  const radius = 25
  var hue = 0
  context.strokeStyle = 'white'
  var drift = 0
  var driftFlag = false
  var timeStep = 100
  var lastAnimationFrameTime = Date.now()

  // dom sections
  var div = document.getElementById('pull-section')
  var xDiv = document.getElementById('xDivPull')
  var yDiv = document.getElementById('yDivPull')
  var xPullValue = xDiv.getElementsByTagName('output')[0]
  var yPullValue = yDiv.getElementsByTagName('output')[0]
  var xPullLabel = xDiv.getElementsByTagName('label')[0]
  var yPullLabel = yDiv.getElementsByTagName('label')[0]

  var driftButton = document.getElementById('drift_button')

//   xPullValue.value = 0
//   xPullValue.id = 'xPull'
//   xPullLabel.htmlFor = 'xPull'
//   xPullLabel.innerHTML = 'xPull: '
//     // xPullLabel.className = 'flexitem'

//   yPullValue.value = 0
//   yPullValue.id = 'yPull'
//   yPullLabel.htmlFor = 'yPull'
//   yPullLabel.innerHTML = 'yPull: '
//     // yPullLabel.className = 'flexitem'

  // div.appendChild(xDiv)
  // xDiv.appendChild(xPullLabel)
  // xDiv.appendChild(xPullValue)
  // div.appendChild(yDiv)
  // yDiv.appendChild(yPullLabel)
  // yDiv.appendChild(yPullValue)

  //events + interaction
  var mouse = {
    down: false,
    x: null,
    y: null
  }

  canvas.onmousedown = () => mouse.down = true
  canvas.onmouseup = () => mouse.down = false
  canvas.onmousemove = mouseMovement
  driftButton.onmouseup = () => driftFlag = !driftFlag

  function mouseMovement(e) {
    if (!mouse.down) {
      return;
    }
    mouse.x = Math.floor(e.x - canvas.getBoundingClientRect().left);
    mouse.y = Math.floor(e.y - canvas.getBoundingClientRect().top);

    neighbors.forEach(checkMouse)
  }

  function checkMouse(p) {
    if (mouse.down) {
      let dx = mouse.x - p.x;
      let dy = mouse.y - p.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < radius) {
        p.x = mouse.x;
        p.y = mouse.y;
      }
    }
  }



  // four neighbor points that 'pull'
  const xSpacing = canvas.width / 4
  const ySpacing = canvas.height / 4

  var xPull = null
  var yPull = null

  var Part = function Part(x, y) {
    this.x = x
    this.y = y
  }
  
  var driftPoint = function driftPoint(neighbor) {
    var yDrift = 5 * Math.sin(drift)
    var xDrift = 3 * Math.sin(drift)
    neighbor.y -= yDrift;
    neighbor.x += xDrift;
    drift = (drift + 0.1)
  }
  
  function drawNeighbor(neighbor) {
    context.fillStyle = `hsla(${hue},100%,50%,1)`;
    context.strokeStyle = `hsla(${hue},100%,50%,1)`;
    context.beginPath()
    context.arc(neighbor.x, neighbor.y, radius, 0, Math.PI * 2)
    context.fill()
    context.moveTo(neighbor.x, neighbor.y)
    context.lineTo(pulledPart.x, pulledPart.y)
    context.stroke()

  }

  var neighbors = []
  neighbors.push(
      new Part(3 * xSpacing, 2 * ySpacing), // right
      new Part(2 * xSpacing, ySpacing), //up
      new Part(xSpacing, 2 * ySpacing), // left
      new Part(2 * xSpacing, 3 * ySpacing) // down
    )
    // center
  var pulledPart = new Part(2 * xSpacing, 2 * ySpacing)


  // ax -= this.x - parts[this.ind_x - 1][this.ind_y].x;
  // ay -= this.y - parts[this.ind_x - 1][this.ind_y].y;
  //
  // ax -= this.x - parts[this.ind_x + 1][this.ind_y].x;
  // ay -= this.y - parts[this.ind_x + 1][this.ind_y].y;
  //
  // ax -= this.x - parts[this.ind_x][this.ind_y - 1].x;
  // ay -= this.y - parts[this.ind_x][this.ind_y - 1].y;
  //
  // ax -= this.x - parts[this.ind_x][this.ind_y + 1].x;
  // ay -= this.y - parts[this.ind_x][this.ind_y + 1].y;

  // animation loop and initial call
  animate()

  function animate() {
    if(Date.now() > lastAnimationFrameTime + timeStep){    
      
      hue -= 0.2 % 360;
      
      // context.strokeStyle = `hsla(${hue},100%,50%,1)`;
      // context.fillStyle = `hsla(${hue},100%,50%,1)`;
      context.fillStyle = 'black'
      context.fillRect(0, 0, canvas.width, canvas.height)
      if(driftFlag){
        driftPoint(neighbors[0])
      }
      // neighbors[0].driftPoint()
      neighbors.forEach(drawNeighbor)
      context.fillStyle = 'white'
      context.strokeStyle = 'white'
      context.beginPath()
      context.arc(pulledPart.x, pulledPart.y, radius, 0, Math.PI * 2)
      context.fill()
      context.stroke()

      // calculate pull
      xPull = neighbors[0].x + neighbors[1].x + neighbors[2].x + neighbors[3].x - pulledPart.x * 4
      yPull = neighbors[0].y + neighbors[1].y + neighbors[2].y + neighbors[3].y - pulledPart.y * 4

      xPullValue.value = Math.round(xPull)
      yPullValue.value = Math.round(yPull)

      // draw result vector
      context.fillStyle = 'red'
      context.strokeStyle = 'red'
      context.beginPath()
      context.moveTo(pulledPart.x, pulledPart.y)
      context.lineTo(pulledPart.x + xPull, pulledPart.y + yPull)
      context.lineTo(pulledPart.x + xPull, pulledPart.y)
      context.lineTo(pulledPart.x, pulledPart.y)
      context.stroke()

      lastAnimationFrameTime = Date.now()
    }

    window.requestAnimationFrame(animate)
  }