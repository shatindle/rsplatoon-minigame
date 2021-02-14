const dimensions = require("./dimensions");

const player = {
    x: dimensions.width / 2,
    y: dimensions.height - 5,
    width: 30,
    height: 35,
    speed: 4,
    velX: 0,
    velY: 0,
    jumping: false,
    jumpHold: null,
    jumpHoldTime: null,
    ghost: 0, // 0 = no ghost, 1 = left ghost
    grounded: false,
    dead: false,
    score: 0
};

module.exports = player;