const dimensions = require("./dimensions");

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    bottomIsDeath = false;

canvas.width = dimensions.width;
canvas.height = dimensions.canvasHeight;

module.exports = {
    canvas: canvas,
    ctx: ctx,
    bottomIsDeath: bottomIsDeath
};