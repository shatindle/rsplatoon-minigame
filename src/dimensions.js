const isTouch = require("./isTouchDevice");

const width = 300,
    height = isTouch ? 450 : 500,
    canvasHeight = 500,
    midHeight = height / 2,
    friction = 0.8,
    gravity = isTouch ? 0.13 : 0.2;

module.exports = {
    width: width,
    height: height,
    canvasHeight: canvasHeight,
    midHeight: midHeight,
    friction: friction,
    gravity: gravity
};