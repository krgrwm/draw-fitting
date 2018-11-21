"use strict";
exports.__esModule = true;
var PIXI = require("pixi.js");
var app = new PIXI.Application(800, 600, { antialias: true });
document.body.appendChild(app.view);
var g = new PIXI.Graphics();
var xrange = [-1, 0.1, 1];
// set a fill and line style
g.beginFill(0xFF3300);
g.lineStyle(4, 0xffd900, 1);
// draw a shape
g.moveTo(50, 50);
g.lineTo(250, 50);
g.lineTo(100, 100);
g.lineTo(50, 50);
g.endFill();
// set a fill and a line style again and draw a rectangle
g.lineStyle(2, 0x0000FF, 1);
g.beginFill(0xFF700B, 1);
g.drawRect(50, 250, 120, 120);
// draw a rounded rectangle
g.lineStyle(2, 0xFF00FF, 1);
g.beginFill(0xFF00BB, 0.25);
g.drawRoundedRect(150, 450, 300, 100, 15);
g.endFill();
// draw a circle, set the lineStyle to zero so the circle doesn't have an outline
g.lineStyle(0);
g.beginFill(0xFFFF0B, 0.5);
g.drawCircle(470, 90, 60);
g.endFill();
app.stage.addChild(g);
