import canvasRecord from "canvas-record"
import {p5} from 'p5js-wrapper'

let capture, canvas, recorder

const body = window.document.getElementsByTagName('body')[0]
const bodyRectangle = body.getBoundingClientRect()
const controlsRectangle = window.document.getElementById('controls').getBoundingClientRect()
const invertBtn = window.document.getElementById('invertBtn')
const saveBtn = window.document.getElementById('saveBtn')

const colors = [[77, 137, 99], [102, 167, 197], [225, 179, 120], [224, 204, 151], [236, 121, 154], [159, 2, 81], [240, 236, 235]]

const fps = 24
const pool = []
const efxMaxSize = 150
const efxMinSize = 40
let invert = false

Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
  }

class Efx {
    constructor(x, y, maxSize, maxFrame, shape, r, g, b) {
        this.maxSize = maxSize
        this.maxFrame = maxFrame
        this.frame = 0
        this.shape = shape
        this.x = x
        this.y = y
        this.r = r
        this.g = g
        this.b = b
    }

    incrementFrame() {
        this.frame += 1
    }

    get currentSize() {
        const scale = this.easeInOutCirc(this.frame / this.maxFrame)
        return this.maxSize * scale
    }

    easeInOutCirc(x) {
        return x < 0.5
          ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
          : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
    }

    shouldDisplay() {
        return this.frame <= this.maxFrame && this.frame > 0
    }
}
let sketch = new p5((p) => {
  p.setup = () => {
    canvas = p.createCanvas(bodyRectangle.width, bodyRectangle.height)
    console.log(canvas)
    p.pixelDensity(1)
    p.frameRate(fps)
    capture = p.createCapture(p.VIDEO)
    capture.size(100, 100)
    capture.hide()
    invertBtn.addEventListener('click', invertHandler)
    saveBtn.addEventListener('click', saveHandler)
    resetRecorder()
  }

  p.draw = () => {
    p.background(255)
    p.image(capture, 0, 0, bodyRectangle.width, bodyRectangle.height)
    if (invert) {
        p.filter(p.INVERT)
    }
    
    pool.forEach(efx => {
        if (efx.shouldDisplay()) {
            p.fill(efx.r, efx.g, efx.b, 255);
            p.stroke(efx.r, efx.g, efx.b);
            const size = efx.currentSize
            p.circle(
                efx.x,
                efx.y,
                size
            )
        }
        efx.incrementFrame()
    })
  }

  p.mousePressed = () => {
  
      let isWithinControls = p.mouseX > controlsRectangle.x 
                          && p.mouseX < controlsRectangle.right
                          && p.mouseY > controlsRectangle.y 
                          && p.mouseY < controlsRectangle.bottom
      if (isWithinControls) {
          return
      }
  
      const color = colors.random()
      const size = Math.random() * (efxMaxSize -efxMinSize) + efxMinSize
      const efx = new Efx(p.mouseX, p.mouseY, size, fps, "circle", color[0], color[1], color[2])
      pool.push(efx)
  }
  
}, 'one')

function invertHandler() {
    invert = !invert
}

function saveHandler() {
    recorder.stop();
    resetRecorder();
    console.log("stopped")
}

function resetRecorder() {
  let canvasElement = window.document.getElementById("defaultCanvas0")
  recorder = canvasRecord(canvasElement)
  recorder.start()
}
//new p5(setup)