import * as PIXI from 'pixi.js';
import * as ORTH from './ortho';
import * as PLOT from './plot'
import * as DAT from 'dat.gui'

let winConfig = function()
{
  this.winX = 800
  this.winY = 600
}

let fittingConfig = function()
{
  this.degree = 25
  this.integrateNx = 200
}

let wconfig = new winConfig()
let fconfig = new fittingConfig()

var app = new PIXI.Application(wconfig.winX, wconfig.winY, { antialias: true });
document.body.appendChild(app.view);

var g = new PIXI.Graphics();

let dx = 0.01
let xrange = [-1, 1] // Legendre Polynomials????[-1, 1]?????????
let yrange = [-1.5, 1.5]

// Legendre Polynomials?degree???????????
function fitLegendrePolynomial(f: ORTH.realFunc, degree: number, Nx: number)
{
  let coeff = ORTH.calcLegendrePolynomalCoeff(f, degree, Nx)

  let fitted = function (x) {
    let res = 0;
    for (var i = 0; i < degree; i++) {
      res += coeff[i] * ORTH.OrthogonalFunctions.legendrePolynomial(i, x)
    }
    return res
  }
  return fitted
}

let plot = function(f, dx, xrange, yrange)
{
  PLOT.plot(g, f, dx, xrange, yrange, wconfig.winX, wconfig.winY)
}

// y=0?????
g.lineStyle(0.3, 0xffd900, 1);
plot(function(x){return 0}, dx, xrange, yrange)

app.stage.interactive = true;

class fittingMath
{
  public static x2index(x: number, origin: number, dx: number) {
    return Math.floor((x - origin) / dx)
  }

  public static ysx(ys: Array<number>, x: number, origin: number, dx: number): number
  {
    return ys[fittingMath.x2index(x, xrange[0], dx)]
  }

  // ??????????
  public static interpolate(ys: Array<number>, aveRange: number) {
    for (var i = 0; i < ys.length; i++) {
      if (ys[i] == null) {
        ys[i] = 0
        var sum = 1
        for (var j = 0; j < aveRange; j++) {
          var t1 = ys[i - j]
          var t2 = ys[i + j]
          if (t1 != null) {
            ys[i] += t1
            sum++
          }
          if (t2 != null) {
            ys[i] += t2
            sum++
          }
        }
        ys[i] = ys[i] / sum
      }
    }
  }

  public static winPosToRangePos(x: number, y: number, xrange: [number, number], yrange: [number, number], winX: number, winY: number)
  {
    let ux = (xrange[1] - xrange[0]) / winX
    let uy = (yrange[1] - yrange[0]) / winY
    let normx = x * ux + xrange[0]
    let normy = (winY - y) * uy + yrange[0]
    return [normx, normy]
  }
}

// TODO: ????(ViewModel)???????????
class fittingObj {
  parent: PIXI.Container
  dx: number
  xrange: [number, number]
  yrange: [number, number]
  winX: number
  winY: number

  isDown: Boolean = false
  isCleared: Boolean = false

  g_fittedCurve: PIXI.Graphics
  g_input: PIXI.Graphics

  ys: Array<number>
  degree: number
  integrateNx: number

  constructor(parent: PIXI.Container, dx, xrange, yrange, winX, winY, degree, integrateNx) {
    this.parent = parent
    this.dx = dx
    this.xrange = xrange
    this.yrange = yrange
    this.winX = winX
    this.winY = winY

    this.g_fittedCurve = new PIXI.Graphics()
    this.g_input = new PIXI.Graphics()

    this.parent.addChild(this.g_input)
    this.parent.addChild(this.g_fittedCurve)

    let [xs, ys] = PLOT.quantize(() => 0, dx, xrange, yrange)
    this.ys = ys
    this.ys.fill(null)

    this.degree = degree
    this.integrateNx = integrateNx

    app.renderer.plugins.interaction
      .on("pointerdown", () => this.onPointerDown())
      .on("pointerup",   () => this.onPointerUp())
      .on("pointermove", (e: PIXI.interaction.InteractionEvent) => this.onPointerMove(e))

    let height = 0.1 * winY
    let width =  0.1 * winX
    let resetButton = new PIXI.Container

    let bg = new PIXI.Sprite(PIXI.Texture.WHITE)
    bg.tint = 0x005555
    bg.width = width
    bg.height = height

    let text = new PIXI.Text("reset")


    resetButton.interactive = true
    resetButton.buttonMode = true
    resetButton.width = width
    resetButton.height = bg.height
    resetButton.position.set(0, winY-height)

    resetButton
      .on("click", () => {
        this.g_fittedCurve.clear()
        this.g_input.clear()
        this.ys.fill(null)
        this.isCleared = true
      })

    resetButton.addChild(bg)
    resetButton.addChild(text)
    this.parent.addChild(resetButton)
  }

  onPointerDown()
  {
    this.isDown = true
  }

  onPointerUp()
  {
    this.isDown = false
    if (this.isCleared) {
      this.isCleared = false
      return
    }

    this.plotFitted()
  }

  onPointerMove(e: PIXI.interaction.InteractionEvent)
  {
    if (!this.isDown) {
      return
    }

    let pos = e.data.getLocalPosition(this.parent)
    let [x, y] = fittingMath.winPosToRangePos(pos.x, pos.y, this.xrange, this.yrange, this.winX, this.winY)

    let i = fittingMath.x2index(x, this.xrange[0], this.dx)
    this.ys[i - 1] = y
    this.ys[i] = y
    this.ys[i + 1] = y

    this.g_input.lineStyle(0, 0xffffff, 1);
    this.g_input.beginFill(0x555555)
    this.g_input.drawCircle(pos.x, pos.y, 6)
    this.g_input.endFill()

    if (pos.x < 0 || pos.x > this.winX || pos.y < 0 || pos.y > this.winY) {
      this.isDown = false
      this.plotFitted()
    }
  }

  setDegree(v: number)
  {
    this.degree = v
  }

  setIntegrateNx(v: number)
  {
    this.integrateNx = v
  }

  plotFitted() {
    this.g_fittedCurve.clear()

    // ????draw???????????????????????????????
    fittingMath.interpolate(this.ys, this.ys.length/10)
    let fitted = fitLegendrePolynomial((x) => fittingMath.ysx(this.ys, x, this.xrange[0], this.dx), this.degree, this.integrateNx)

    this.g_fittedCurve.lineStyle(4, 0x00ffff, 1);
    PLOT.plot(this.g_fittedCurve, fitted, this.dx, this.xrange, this.yrange, this.winX, this.winY)
  }
}

let f = new fittingObj(app.stage, dx, xrange, yrange, wconfig.winX, wconfig.winY, fconfig.degree, fconfig.integrateNx/10)

app.stage.addChild(g);

let gui = new DAT.GUI();
gui.add(fconfig, "degree", 0, 40, 1)
.onChange(() =>
{
  f.setDegree(fconfig.degree)
  f.plotFitted()
})

gui.add(fconfig, "integrateNx", 10, 500, 10)
.onChange(() =>
{
  f.setIntegrateNx(fconfig.integrateNx)
  f.plotFitted()
})