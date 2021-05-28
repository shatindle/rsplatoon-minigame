(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const splashAnimation = {
    x: 0,
    y: 100,
    width: 120,
    height: 57,
    started: null
};

const arrowAnimation = {
    x: 0,
    y: 0,
    width: 50,
    height: 38
};

module.exports = {
    splash: splashAnimation,
    arrow: arrowAnimation
};
},{}],2:[function(require,module,exports){
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
},{"./isTouchDevice":6}],3:[function(require,module,exports){
var lastFrame = Date.now() - 1;
var thisFrame = Date.now();

function show(ctx, debug) {
    var delta = Math.floor(1000 / (thisFrame - lastFrame));

    lastFrame = thisFrame;

    if (debug) {
        ctx.font = '12px SplatRegular';
        ctx.fillStyle = "black";
        ctx.fillText(delta + " fps", 10, 16);
    }
}

function update() {
    thisFrame = Date.now();
}

function currentFrame() {
    return thisFrame;
}

module.exports = {
    update: update,
    currentFrame: currentFrame,
    show: show
};
},{}],4:[function(require,module,exports){
const hexGradients = [
    "#F0ECDB", // 50
    "#F0F0DB",
    "#ECF0DB",
    "#E9F0DB",
    "#E6F0DB",
    "#E2F0DB",
    "#DFF0DB",
    "#DBF0DB",
    "#DBF0DF",
    "#DBF0E2",
    "#DBF0E6",
    "#DBF0E9",
    "#DBF0EC",
    "#DBF0F0",
    "#DBECF0",
    "#DBE9F0",
    "#DBE6F0",
    "#DBE2F0",
    "#DBDFF0",
    "#DBDBF0",
    "#DFDBF0",
    "#E2DBF0",
    "#E6DBF0",
    "#E9DBF0",
    "#ECDBF0",
    "#F0DBF0",
    "#F0DBEC",
    "#F0DBE9",
    "#F0DBE6",
    "#F0DBE2",
    "#F0DBDF",
    "#F0DBDB",
    "#F0DFDB",
    "#F0E2DB",
    "#F0E6DB",
    "#F0E9DB"
];

function getGradient(score) {
    // 9999 / gradients = distance per gradient
    // floor(score / distance) = item (with overflow)
    // item % gradients = item to use
    var dG = 300  / hexGradients.length;
    var iG = Math.floor(score / dG);
    var iI = iG % hexGradients.length;

    return hexGradients[iI];
}

module.exports = getGradient;
},{}],5:[function(require,module,exports){
module.exports = () => {
    var requestAnimationFrame = window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame;

    window.requestAnimationFrame = requestAnimationFrame;
};
},{}],6:[function(require,module,exports){
const isTouch = 'ontouchstart' in document.documentElement;

module.exports = isTouch;
},{}],7:[function(require,module,exports){
"use strict";

var debug = false;

require("./init")();

const { boxTypes } = require("./screenObjects");
const screenObjects = require("./screenObjects");
var sprites = require("./sprites"),
    hexGradients = require("./hexGradients"),
    frameData = require("./frameData"),
    objects = require("./screenObjects"),
    isTouch = require("./isTouchDevice"),
    userInput = require("./userInput"),
    dimensions = require("./dimensions"),
    player = require("./player"),
    animations = require("./animations"),
    page = require("./page");

const userSetting = {
    difficulty: null
};

function setScore() {
    page.ctx.font = '16px SplatRegular';
    page.ctx.fillStyle = "black";
    page.ctx.fillText("Score: " + player.score.toString().padStart(4, "0"), dimensions.width - 100, 20);
}

const SPLASH_ANIMATION_FRAME_RATE = 15;

function animateSplash() {
    if (animations.splash.started) {
        var currentFrame = Math.floor((frameData.currentFrame() - animations.splash.started) / SPLASH_ANIMATION_FRAME_RATE);

        if (currentFrame > 11)
            animations.splash.started = null;

        page.ctx.drawImage(sprites.splash, 
            // selection
            // sx, sy, sWidth, sHeight
            currentFrame * animations.splash.width, 0, animations.splash.width, animations.splash.height,
            // draw at
            // dx, dy dWidth, dHeight
            animations.splash.x, animations.splash.y, animations.splash.width, animations.splash.height);

            // we need 2 splashes to control
        if (animations.splash.x > dimensions.width - 120) {
            // splash on left, original is positive
            // splashAnimation.x - width = p positive distance from 0
            // splashAnimation.width - p = inverse position
            var actualPosition = animations.splash.width + animations.splash.x - dimensions.width;
            page.ctx.drawImage(sprites.splash, 
                // selection
                // sx, sy, sWidth, sHeight
                currentFrame * animations.splash.width + animations.splash.width - actualPosition, 0, actualPosition, animations.splash.height,
                // draw at
                // dx, dy dWidth, dHeight
                0, animations.splash.y, actualPosition, animations.splash.height);
        }
    }
}

function animateArrow(x, y) {
    var currentFrame = Math.floor((frameData.currentFrame() / 30) % 7);

    page.ctx.drawImage(sprites.arrow, 
        // selection
        // sx, sy, sWidth, sHeight
        currentFrame * animations.arrow.width, 0, animations.arrow.width, animations.arrow.height,
        // draw at
        // dx, dy dWidth, dHeight
        x, y, animations.arrow.width, animations.arrow.height);
}

function update() {

    frameData.update();

    if (player.dead) {
        page.ctx.font = '60px SplatRegular';
        page.ctx.fillText('Game Over', 10, 100, dimensions.width - 20);

        frameData.show(page.ctx, debug);

        document.getElementById("share").style.display = "";
        document.getElementById("retry").style.display = "";

        return;
    }

    var hasTouchAction = false,
        firstTouchAction = null,
        lastTouchAction = null;
    
    if (userInput.keys["touch"] && userInput.keys["touch"].length) {
        hasTouchAction = true;
        firstTouchAction = userInput.keys["touch"][0];
        lastTouchAction = userInput.keys["touch"][userInput.keys["touch"].length - 1];
    }

    // jump hold (space, down arrow, touch up)
    if (userInput.keys[40] || userInput.keys[32] || (hasTouchAction && lastTouchAction.action !== "end" && !firstTouchAction.wasJumping)) {
        // up arrow or space
        if (!player.jumping && !player.jumpHold) {
            player.jumpHold = Math.round(Date.now() / 1);
            player.jumpHoldTime = null;
            if (debug)
                console.log("holding");
        }
    } else {
        if (!player.jumping) {
            if (player.jumpHold !== null && player.jumpHoldTime === null) {
                if (debug)
                    console.log("jumping");

                player.jumping = true;
                player.grounded = false;
                player.jumpHoldTime = Math.round(Date.now() / 1) - player.jumpHold;
    
                if (isTouch) {
                    if (player.jumpHoldTime > 1500)
                        player.jumpHoldTime = 800;
                    else if (player.jumpHoldTime < 500)
                        player.jumpHoldTime = 400;
                    else 
                        player.jumpHoldTime = ((player.jumpHoldTime - 500) / 1000) * 400 + 400;
                } else {
                    if (player.jumpHoldTime > 1000)
                        player.jumpHoldTime = 1000;
                    else if (player.jumpHoldTime < 500)
                        player.jumpHoldTime = 500;
                }

                player.jumpHoldTime = player.speed * (player.jumpHoldTime / (isTouch ? 700 : 650));
                
                player.jumpHold = null;
    
                player.y -= 1;
                player.velY = player.jumpHoldTime * -2;

                // begin splash animation
                animations.splash.started = frameData.currentFrame();
                animations.splash.x = player.x - 45;

                if (animations.splash.x < 0)
                    animations.splash.x = dimensions.width - Math.abs(animations.splash.x);

                animations.splash.y = player.y - 18;
            } else if (player.jumpHold === null && player.jumpHoldTime !== null) {
                if (debug)
                    console.log("resetting");

                player.jumpHoldTime = null;
            }
        }
    }

    // right arrow or right direction
    if (userInput.keys[39] && player.jumping || hasTouchAction && player.jumping && (player.x + player.width / 2 - 2 < lastTouchAction.x - (window.innerWidth / 2 - dimensions.width / 2))) { 
        // remove everything else from the keys array - we don't need it
        if (hasTouchAction && userInput.keys["touch"].length > 1 && lastTouchAction.action !== "end")
            userInput.keys["touch"] = [lastTouchAction];
        
        if (hasTouchAction && player.velX < 0 && lastTouchAction.action !== "end")
            player.velX = 0;

        if (player.velX < player.speed) {
            player.velX++;
        }
    }

    // left arrow or left direction
    if (userInput.keys[37] && player.jumping || hasTouchAction && player.jumping && (player.x + player.width / 2 + 2 > lastTouchAction.x - (window.innerWidth / 2 - dimensions.width / 2))) { 
        
        // remove everything else from the keys array - we don't need it
        if (hasTouchAction && userInput.keys["touch"].length > 1 && lastTouchAction.action !== "end")
            userInput.keys["touch"] = [lastTouchAction];

        if (hasTouchAction && player.velX > 0 && lastTouchAction.action !== "end")
            player.velX = 0;

        if (player.velX > -player.speed) {
            player.velX--;
        }
    }

    player.velX *= dimensions.friction;
    player.velY += dimensions.gravity;

    // begin drawing everything
    page.ctx.clearRect(0, 0, dimensions.width, dimensions.canvasHeight);

    if (isTouch) {
        page.ctx.fillStyle = "gray";
        page.ctx.fillRect(0, dimensions.height, dimensions.width, dimensions.canvasHeight - dimensions.height);
    }

    page.ctx.fillStyle = hexGradients(player.score);
    page.ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    page.ctx.fillStyle = "black";
    page.ctx.beginPath();
    
    player.grounded = false;

    var playerGhost = null;

    if (player.ghost)
        playerGhost = {
            x: 0,
            y: player.y,
            width: player.width + player.x - dimensions.width,
            height: player.height
        };

    for (var i = 0; i < objects.boxes.length; i++) {
        switch (objects.boxes[i].type) {
            case objects.boxTypes.SUCTION:
                page.ctx.fillStyle = "orange";
                break;
            case objects.boxTypes.ROCK:
                page.ctx.fillStyle = "black";
                break;
            default:
                page.ctx.fillStyle = "black";
                break;
        }

        switch (objects.boxes[i].type) {
            case boxTypes.ARROW:
                animateArrow(objects.boxes[i].x, objects.boxes[i].y);
                break;
            default: 
                page.ctx.rect(objects.boxes[i].x, objects.boxes[i].y, objects.boxes[i].width, objects.boxes[i].height);
                break;
        }

        page.ctx.fill();
        page.ctx.beginPath();
        
        var dir = colCheck(player, objects.boxes[i]);

        var ghostDir = null;

        if (playerGhost)
            ghostDir = colCheck(playerGhost, objects.boxes[i]);

        if ((dir || ghostDir) && objects.boxes[i].type == boxTypes.ARROW) {
            player.velY = -20;
        } else if (dir === "l" || dir === "r" || ghostDir === "l" || ghostDir === "r") {
            player.velX = 0;
        } else if (dir === "b" || ghostDir === "b") {
            player.grounded = true;
            player.jumping = false;
            player.y = objects.boxes[i].y - player.height;
        } else if (dir === "t" || ghostDir === "t") {
            player.velY *= -1;
        }
    }
    
    if(player.grounded) {
        player.velY = 0;
    }

    player.x += player.velX;
    player.y += player.velY;

    if (player.x < 0) {
        // adjust player to right side of screen
        player.x = dimensions.width + player.x;
    } else if (player.x > dimensions.width) {
        // adjust player to left side of screen
        player.x = player.x - dimensions.width;
    }

    if (player.x < 0 && player.x > -1 * player.width) {
        player.ghost = 1;
        player.x = dimensions.width - Math.abs(player.x);
    } else if (player.x > dimensions.width - player.width && player.x < dimensions.width + player.width) {
        player.ghost = 1;
    } else {
        player.ghost = 0;
    }

    if (hasTouchAction && player.jumping) {
        firstTouchAction.wasJumping = true;
    }

    if (player.y >= dimensions.height - player.height) {
        player.y = dimensions.height - player.height;
        player.jumping = false;

        if (hasTouchAction && lastTouchAction.action === "end")
            userInput.keys["touch"] = null;

        if (page.bottomIsDeath) {
            player.dead = true;
        }
    }

    // suction types become concrete after the user has passed over them
    for (var i = 0; i < objects.boxes.length; i++) {
        if (objects.boxes[i].type === objects.boxTypes.SUCTION && !objects.boxes[i].isTopSolid && objects.boxes[i].y > player.y + player.height)
            objects.boxes[i].isTopSolid = true;
    }

    if (player.y <= dimensions.midHeight) {
        // the floor is death
        page.bottomIsDeath = true;

        // player is above mid, shift everything down by difference between player height and mid
        var amountToShift = player.y - dimensions.midHeight;
        player.y = dimensions.midHeight;

        for (var i = 0; i < objects.boxes.length; i++) {
            objects.boxes[i].y -= amountToShift;
        }
            
        if (objects.boxes[0].y > dimensions.height) {
            // shift this box and add a new one
            objects.boxes.shift();

            objects.generatePlatform(false, userSetting.difficulty);
        }

        animations.splash.y -= amountToShift;
    }

    var activeSquid,
        activeSquidGhost;

    if (player.dead) {
        activeSquid = sprites.squidDead;
        activeSquidGhost = sprites.squidDead;
    } else if (!player.jumping) {
        if (player.jumpHold) {
            var jumpHoldTime = Math.round(Date.now() / 1) - player.jumpHold;

            if (!isTouch && jumpHoldTime > 1000 || isTouch && jumpHoldTime > 1500) {
                activeSquid = sprites.squidFocus3;
                activeSquidGhost = sprites.squidFocus3;
            } else if (jumpHoldTime < 500) {
                activeSquid = sprites.squidFocus1;
                activeSquidGhost = sprites.squidFocus1;
            } else {
                activeSquid = sprites.squidFocus2;
                activeSquidGhost = sprites.squidFocus2;
            }
        } else {
            activeSquid = sprites.squidNeutral;
            activeSquidGhost = sprites.squidNeutral;
        }
    } else {
        activeSquid = sprites.squidNeutral;
        activeSquidGhost = sprites.squidNeutral;
    }

    if (player.jumping)
        animateSplash();

    page.ctx.drawImage(activeSquid, player.x, player.y, sprites.squidNeutral.width, sprites.squidNeutral.height);

    if (player.ghost !== 0) {
        // we need 2 players to control
        if (player.ghost === 1) {
            // ghost on left, original is positive
            // player.x - width = p positive distance from 0
            // player.width - p = inverse position
            var actualPosition = player.width + player.x - dimensions.width;
            var hSize = (actualPosition / sprites.squidNeutral.width) * 100;
            page.ctx.drawImage(activeSquidGhost, 
                // selection
                // sx, sy, sWidth, sHeight
                100 - hSize, 0, hSize, 117,
                // draw at
                // dx, dy dWidth, dHeight
                0, player.y, actualPosition, sprites.squidNeutral.height);
        }
    }

    if (page.bottomIsDeath) {
        page.ctx.fillStyle = "#5555ff";
        page.ctx.fillRect(0, dimensions.height - 4, dimensions.width, 4);
    }

    frameData.show(page.ctx, debug);
    setScore();

    requestAnimationFrame(update);
}

function colCheck(shapeA, shapeB) {
    // get the vectors to check against
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
        vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
        // add the half widths and half heights of the objects
        hWidths = (shapeA.width / 2) + (shapeB.width / 2),
        hHeights = (shapeA.height / 2) + (shapeB.height / 2),
        colDir = null;

    // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        // figures out on which side we are colliding (top, bottom, left, or right)
        var oX = hWidths - Math.abs(vX),
            oY = hHeights - Math.abs(vY);
        if (oX >= oY) {
            if (vY > 0) {
                if (shapeB.isBottomSolid) {
                    colDir = "t";
                }
                if (shapeB.adjustPlayer) {
                    shapeA.y += oY;
                }
            } else {
                if (shapeB.isTopSolid) {
                    colDir = "b";
                    
                    if (player.score < shapeB.count)
                        player.score = shapeB.count;
                }
                if (shapeB.adjustPlayer) {
                    shapeA.y -= oY;
                }
            }
        } else {
            if (vX > 0) {
                if (shapeB.isRightSolid) {
                    colDir = "l";
                }
                if (shapeB.adjustPlayer) {
                    shapeA.x += oX;
                }
            } else {
                if (shapeB.isLeftSolid) {
                    colDir = "r";
                }
                if (shapeB.adjustPlayer) {
                    shapeA.x -= oX;
                }
            }
        }
    }
    return colDir;
}

document.body.addEventListener("keydown", function(e) {
    userInput.keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function(e) {
    userInput.keys[e.keyCode] = false;
});

var game = {
    isStarted: false
};

window.beginGame = function(difficulty) {
    if (game.isStarted)
        return;

    game.isStarted = true;

    userSetting.difficulty = difficulty;

    // seed the screen
    for (var i = 0; i < 3; i++)
        screenObjects.generatePlatform(true, userSetting.difficulty);

    document.getElementById("modeselect").remove();

    update();
}

function touchStart(e) {
    e.preventDefault();

    if (debug)
        console.log("touchstart.");

    var touches = e.changedTouches;
    var touchX = touches[0].clientX,
        touchY = touches[0].clientY;

    userInput.keys["touch"] = [{
        x: touchX,
        y: touchY,
        action: "start"
    }];
}

function touchMove(e) {
    e.preventDefault();

    if (debug)
        console.log("touchstart.");

    var touches = e.changedTouches;
    var touchX = touches[0].clientX,
        touchY = touches[0].clientY;

    //(touches);
    
    userInput.keys["touch"].push({
        x: touchX,
        y: touchY,
        action: "move"
    });
}

function touchEnd(e) {
    e.preventDefault();

    if (debug)
        console.log("touchstart.");

    var touches = e.changedTouches;
    var touchX = touches[0].clientX,
        touchY = touches[0].clientY;

    userInput.keys["touch"].push({
        x: touchX,
        y: touchY,
        action: "end"
    });
}

page.canvas.addEventListener("touchstart", touchStart, false);
page.canvas.addEventListener("touchmove", touchMove, false);
page.canvas.addEventListener("touchend", touchEnd, false);

function share() {
    var myMode = "";

    switch (userSetting.difficulty) {
        case 1:
            myMode = "%20Very%20Fly%20Mode%20in";
            break;
        case 2:
            myMode = "%20Easy%20Mode%20in";
            break;
        case 3:
            myMode = "%20Normal%20Mode%20in";
            break;
        case 4:
            myMode = "%20Hard%20Mode%20in";
            break;
        case 5:
            myMode = "%20Crazy%20Mode%20in";
            break;
        default: 
            myMode = "%20Normal%20Mode%20in";
            break;
    }

    var score = "https://twitter.com/intent/tweet?text=" + 
        "I%20made%20it%20to%20" + 
        player.score + 
        "%20platforms%20on" + 
        myMode + 
        "%20r/Splatoon%20Hop!%20%23rsplatoonhop%20%23Splatoon%20" + 
        "How%20high%20can%20you%20go?%20https%3A%2F%2Fminigame.rsplatoon.com%2F";

    window.open(score,'_blank');
}

if (isTouch) {
    document.getElementById("mobileControls").style.display = "";
    document.getElementById("desktopControls").style.display = "none";
}

window.share = share;
},{"./animations":1,"./dimensions":2,"./frameData":3,"./hexGradients":4,"./init":5,"./isTouchDevice":6,"./page":8,"./player":9,"./screenObjects":10,"./sprites":11,"./userInput":12}],8:[function(require,module,exports){
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
},{"./dimensions":2}],9:[function(require,module,exports){
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
},{"./dimensions":2}],10:[function(require,module,exports){
const dimensions = require("./dimensions");

const boxTypes = {
    ROCK: 0,
    SUCTION: 1,
    ARROW: 2
};

const boxTypeOptions = [
    boxTypes.SUCTION,
    boxTypes.SUCTION,
    boxTypes.SUCTION,
    boxTypes.SUCTION,
    boxTypes.ARROW
];

const crazyTypeOptions = [
    boxTypes.ROCK,
    boxTypes.ARROW,
    boxTypes.ARROW,
    boxTypes.ARROW,
    boxTypes.ARROW
];

const boxes = [];

function generatePlatform(init, gameMode) {
    var newItemY = boxes.length ? boxes[boxes.length - 1].y - Math.random() * 150.0 - (init ? 100 : 0) : dimensions.height - 100 - (init ? 100 : 0);

    var newItemX = Math.random() * (dimensions.width - 30);
    var newItemW = Math.random() * 100 + 30;

    if (boxes.length) {
        // ensure the platform below this is not totally covered by this platform
        var bottomLeftEdge = boxes[boxes.length - 1].x;
        var bottomRightEdge = boxes[boxes.length - 1].x + boxes[boxes.length - 1].width;

        var topLeftEdge = newItemX;
        var topRightEdge = newItemX + newItemW;

        if (topLeftEdge < bottomLeftEdge && topRightEdge > bottomRightEdge) {
            // adjust one of the platforms
            if (topLeftEdge < 150) {
                newItemX = 20;
            } else {
                newItemX = 200;
            }
        }
    }

    if (!init && newItemY > 0)
        newItemY = 0;

    var count = boxes.length ? boxes[boxes.length - 1].count + 1 : 1;

    if (gameMode === 3 && count !== 0 && count % 20 === 0)
        boxTypeOptions.push(boxTypes.ROCK);

    var type;

    do {
        switch (gameMode) {
            case 1: // very fly
                type = boxTypes.ARROW;
            break;
            case 2: // easy
                type = boxTypes.SUCTION;
            break;
            case 3: // normal
                type = boxTypeOptions[Math.floor(Math.random() * boxTypeOptions.length)];
                break;
            case 4: // hard
                type = boxTypes.ROCK;
            break;
            case 5: // crazy
                type = crazyTypeOptions[Math.floor(Math.random() * crazyTypeOptions.length)];
            break;
            default: 
                type = boxTypeOptions[Math.floor(Math.random() * boxTypeOptions.length)];
                break;
        }

        
    } while ((gameMode === 3 && boxes.length && type === boxTypes.ARROW && boxes[boxes.length - 1].type === boxTypes.ARROW));

    var height = 5;

    var isTopSolid,
        isBottomSolid,
        isLeftSolid,
        isRightSolid,
        adjustPlayer;

    switch (type) {
        case boxTypes.ROCK:
            isTopSolid = true;
            isBottomSolid = true;
            isLeftSolid = true;
            isRightSolid = true;
            adjustPlayer = true;
            break;
        case boxTypes.ARROW:
            isTopSolid = true;
            isBottomSolid = true;
            isLeftSolid = true;
            isRightSolid = true;
            adjustPlayer = false;
            // arrows have specific requirements
            newItemW = 50;
            height = 38;

            if (newItemX < 0)
                newItemX = 0;
            else if (newItemX >= dimensions.width - 50)
                newItemX = dimensions.width - 50;
            break;
        default:
            isTopSolid = false;
            isBottomSolid = false;
            isLeftSolid = false;
            isRightSolid = false;
            adjustPlayer = false;
            break;
    }

    boxes.push({
        x: newItemX,
        y: newItemY,
        width: newItemW,
        height: height,
        count: count,
        type: type,
        isTopSolid: isTopSolid,
        isBottomSolid: isBottomSolid,
        isLeftSolid: isLeftSolid,
        isRightSolid: isRightSolid,
        adjustPlayer: adjustPlayer
    });
}

module.exports = {
    boxTypes: boxTypes,
    boxTypeOptions: boxTypeOptions,
    generatePlatform: generatePlatform,
    boxes: boxes
};
},{"./dimensions":2}],11:[function(require,module,exports){
// normal squid
var squidNeutral = new Image();

squidNeutral.src = "/css/img/squid.png";
squidNeutral.width = 30;
squidNeutral.height = 35;

// focus 1 squid
var squidFocus1 = new Image();

squidFocus1.src = "/css/img/squidJump1.png";
squidFocus1.width = 30;
squidFocus1.height = 35;

// focus 2 squid
var squidFocus2 = new Image();

squidFocus2.src = "/css/img/squidJump2.png";
squidFocus2.width = 30;
squidFocus2.height = 35;

// focus 3 squid
var squidFocus3 = new Image();

squidFocus3.src = "/css/img/squidJump3.png";
squidFocus3.width = 30;
squidFocus3.height = 35;

// dead squid
var squidDead = new Image();

squidDead.src = "/css/img/squidDead.png";
squidDead.width = 30;
squidDead.height = 35;

// arrow
var arrow = new Image();

arrow.src = "/css/img/arrow.png";
arrow.width = 350;
arrow.height = 38;


// jump splash
var splashVariant = Math.floor(Math.random() * 7);

var splash = new Image();
splash.src = "/css/img/splash" + splashVariant + ".png";
splash.width = 1560;
splash.height = 57;
splash.className = "splashImage";

module.exports = {
    squidNeutral: squidNeutral,
    squidFocus1: squidFocus1,
    squidFocus2: squidFocus2,
    squidFocus3: squidFocus3,
    squidDead: squidDead,
    splash: splash,
    arrow: arrow
};
},{}],12:[function(require,module,exports){
const keys = [];

module.exports = {
    keys: keys
};
},{}]},{},[7]);
