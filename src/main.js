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

            objects.generatePlatform();
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

window.addEventListener("load", function() {
    update();
});

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
    var score = "https://twitter.com/intent/tweet?text=" + 
        "I%20made%20it%20to%20" + 
        player.score + 
        "%20platforms%20on%20r/Splatoon%20Hop!%20%23rsplatoonhop%20%23Splatoon%20" + 
        "How%20high%20can%20you%20go?%20https%3A%2F%2Fminigame.rsplatoon.com%2F";

    window.open(score,'_blank');
}

if (isTouch) {
    document.getElementById("mobileControls").style.display = "";
    document.getElementById("desktopControls").style.display = "none";
}

window.share = share;