import * as PIXI from 'pixi.js';

export function quantize(f, dx, xrange, yrange)
{
  let Nx = Math.trunc((xrange[1] - xrange[0]) / dx) + 1
  let xs = Array(Nx)
  let ys = Array(Nx)
  for (var i = 0; i < Nx; i++) {
    xs[i] = xrange[0] + i * dx
    ys[i] = f(xs[i])
  }
  return [xs, ys]
}

export function plot(g: PIXI.Graphics, f, dx, xrange, yrange, winX, winY)
{
  let [xs, ys] = quantize(f, dx, xrange, yrange)
  plot_quantized(g, xs, ys, dx, xrange, yrange, winX, winY)
}

export function plot_quantized(g: PIXI.Graphics, xs, ys, dx, xrange, yrange, winX, winY)
{
  let xstart = xrange[0]
  let xend = xrange[1]
  let ystart = yrange[0]
  let yend = yrange[1]

  // set a fill and line style
  let yunit = winY / (yend - ystart)
  let xunit = winX / (xend - xstart)
  let offsety = -ystart * yunit
  let offsetx = -xstart * xunit

  var x = xs[0] * xunit + offsetx
  var y = ys[0] * yunit + offsety
  y = winY - y
  g.moveTo(x, y)
  let Nx = Math.trunc((xend - xstart) / dx)+1
  for (var i = 1; i < Nx; i++) {
    var x = xs[i] * xunit + offsetx
    var y = ys[i] * yunit + offsety
    y = winY - y
    g.lineTo(x, y)
  }
}