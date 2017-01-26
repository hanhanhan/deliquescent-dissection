(function showDecay() {var canvas = document.getElementById('decay')
var context = canvas.getContext('2d')

canvas.height = 200
canvas.width = 800
context.strokeStyle = 'yellow'
context.lineWidth = 8

decay = 0.97

var steps = 120
var fontsize = 30
var paddedFontSize = 1.2 * fontsize
var xScale = 1 - 3 * paddedFontSize/canvas.width
var yScale = 1 - paddedFontSize/canvas.height

var yStep = (canvas.height - fontsize * 1.5) / steps
var xStep = canvas.width / steps

// context.translate(paddedFontSize, -paddedFontSize)
context.scale(xScale, yScale)
context.translate(canvas.width * (1 - xScale), 0)

context.moveTo(0, canvas.height)
context.beginPath()
for(let i = 0; i < steps; i++){
  let y = (canvas.height) * (1 - Math.pow(decay, i))
  context.lineTo(i * xStep, y)
}
context.stroke()
context.beginPath()
context.lineWidth = 5
context.strokeStyle = 'white'
context.fillStyle = 'white'
context.moveTo(0, canvas.height)
context.lineTo(0, 0)
context.moveTo(0, canvas.height)
context.lineTo(canvas.width, canvas.height)
context.stroke()

// x axis labels
// context.restore()

// context.translate(-paddedFontSize, paddedFontSize)
context.font = `${fontsize}px sans-serif`
context.fillText("time", canvas.width / 2, canvas.height + paddedFontSize)
context.fillText('2s', canvas.width - fontsize * 2, canvas.height + paddedFontSize)
context.fillText('0s', 0, canvas.height + paddedFontSize)
// context.setTransform(1, 0, 0, 1, 0, 0);
// y axis labels
context.fillText('100%', - 2.5 * paddedFontSize, paddedFontSize)
context.fillText('0%', - 1.5 * paddedFontSize, canvas.height)
})();
