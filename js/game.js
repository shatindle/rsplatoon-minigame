(function() {
    var requestAnimationFrame = window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame;

    window.requestAnimationFrame = requestAnimationFrame;
})();

var debug = false;

function isTouchDevice() {
    return 'ontouchstart' in document.documentElement;
}

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    width = 300,
    height = 500,
    midHeight = height / 2,
    player = {
        x: width / 2,
        y: height - 5,
        width: 30,
        height: 35,
        speed: 4,
        velX: 0,
        velY: 0,
        jumping: false,
        jumpHold: null,
        jumpHoldTime: null,
        ghost: 0, // 0 = no ghost, 1 = left ghost, 2 = right ghost
        grounded: false,
        dead: false,
        score: 0
    },
    splashAnimation = {
        x: 0,
        y: 100,
        width: 120,
        height: 57,
        started: null
    },
    keys = [],
    friction = 0.8,
    gravity = 0.2,
    bottomIsDeath = false;

canvas.width = width;
canvas.height = height;

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

// jump splash
var splashVariant = Math.floor(Math.random() * 7);

var splash = new Image();
splash.src = "/css/img/splash" + splashVariant + ".png";
splash.width = 1560;
splash.height = 57;
splash.className = "splashImage";

var myscore = 0;

// background
var hexGradients = [
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

var boxes = [];

generateBasicPlatform(true);
generateBasicPlatform(true);
generateBasicPlatform(true);

var lastFrame = Date.now() - 1;
var thisFrame = Date.now();



function frameRate() {
    var thisFrame = Date.now();

    var delta = Math.floor(1000 / (thisFrame - lastFrame));

    lastFrame = thisFrame;

    if (debug) {
        ctx.font = '12px SplatRegular';
        ctx.fillText(delta + " fps", 10, 16);
    }
}

function setScore() {
    ctx.font = '16px SplatRegular';
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + player.score.toString().padStart(4, "0"), width - 100, 20);
    // ctx.strokeStyle = "black";
    // ctx.strokeText("Score: " + player.score.toString().padStart(4, "0"), width - 100, 20);
}

const SPLASH_ANIMATION_FRAME_RATE = 15;

function animateSplash() {
    if (splashAnimation.started) {
        var currentFrame = Math.floor((thisFrame - splashAnimation.started) / SPLASH_ANIMATION_FRAME_RATE);

        if (currentFrame > 11)
            splashAnimation.started = null;

        ctx.drawImage(splash, 
            // selection
            // sx, sy, sWidth, sHeight
            currentFrame * splashAnimation.width, 0, splashAnimation.width, splashAnimation.height,
            // draw at
            // dx, dy dWidth, dHeight
            splashAnimation.x, splashAnimation.y, splashAnimation.width, splashAnimation.height);

            // we need 2 splashes to control
        if (splashAnimation.x > width - 120) {
            // splash on left, original is positive
            // splashAnimation.x - width = p positive distance from 0
            // splashAnimation.width - p = inverse position
            var actualPosition = splashAnimation.width + splashAnimation.x - width;
            ctx.drawImage(splash, 
                // selection
                // sx, sy, sWidth, sHeight
                currentFrame * splashAnimation.width + splashAnimation.width - actualPosition, 0, actualPosition, splashAnimation.height,
                // draw at
                // dx, dy dWidth, dHeight
                0, splashAnimation.y, actualPosition, splashAnimation.height);
        }
    }
}

function generateBasicPlatform(init) {
    var newItemY = boxes.length ? boxes[boxes.length - 1].y - Math.random() * 150.0 - (init ? 100 : 0) : height - 100 - (init ? 100 : 0);

    var newItemX = Math.random() * (width - 30);

    if (!init && newItemY > 0)
        newItemY = 0;

    var newItemW = Math.random() * 100 + 30;

    boxes.push({
        x: newItemX,
        y: newItemY,
        width: newItemW,
        height: 5,
        count: boxes.length ? boxes[boxes.length - 1].count + 1 : 1
    });
}

function update() {
    thisFrame = Date.now();

    if (player.dead) {
        ctx.font = '60px SplatRegular';
        ctx.fillText('Game Over', 10, 100, width - 20);

        frameRate();

        myscore = player.score;

        document.getElementById("share").style.display = "";

        return;
    }

    // check keys
    if (keys[40] || keys[32] || (keys["touch"] && keys["touch"].length && keys["touch"][keys["touch"].length - 1].action !== "end")) {
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
    
                if (player.jumpHoldTime > 1000)
                    player.jumpHoldTime = 1000;
                else if (player.jumpHoldTime < 500)
                    player.jumpHoldTime = 500;

                player.jumpHoldTime = player.speed * (player.jumpHoldTime / 650);
                
                player.jumpHold = null;
    
                player.y -= 1;
                player.velY = player.jumpHoldTime * -2;

                // begin splash animation
                splashAnimation.started = thisFrame;
                splashAnimation.x = player.x - 45;

                if (splashAnimation.x < 0)
                    splashAnimation.x = width - Math.abs(splashAnimation.x);

                splashAnimation.y = player.y - 18;
            } else if (player.jumpHold === null && player.jumpHoldTime !== null) {
                if (debug)
                    console.log("resetting");

                player.jumpHoldTime = null;
            }
        }
    }

    // todo: figure out what the magic number 86 is 
    if (keys[39] && player.jumping || keys["touch"] && keys["touch"].length && player.jumping && (player.x < keys["touch"][keys["touch"].length - 1].x - 86)) { 
        // // remove everything else from the keys array - we don't need it
        if (keys["touch"] && keys["touch"].length > 1 && keys["touch"][keys["touch"].length - 1].action !== "end")
            keys["touch"] = [keys["touch"][keys["touch"].length - 1]];
        
        if (keys["touch"] && keys["touch"].length && player.velX < 0 && keys["touch"][keys["touch"].length - 1].action !== "end")
            player.velX = 0;

        // right arrow means set x to greater than width
        if (keys["touch"] && keys["touch"][keys["touch"].length - 1].action === "end")
            keys["touch"][keys["touch"].length - 1].x = width + 10000;

        // right arrow
        if (player.velX < player.speed) {
            player.velX++;
        }
    }

    // todo: figure out what the magic number 52 is
    if (keys[37] && player.jumping || keys["touch"] && keys["touch"].length && player.jumping && (player.x > keys["touch"][keys["touch"].length - 1].x - 52)) { 
        
        // remove everything else from the keys array - we don't need it
        if (keys["touch"] && keys["touch"].length > 1 && keys["touch"][keys["touch"].length - 1].action !== "end")
            keys["touch"] = [keys["touch"][keys["touch"].length - 1]];

        if (keys["touch"] && keys["touch"].length && player.velX > 0 && keys["touch"][keys["touch"].length - 1].action !== "end")
            player.velX = 0;

        // left arrow means set x to less than 0
        if (keys["touch"] && keys["touch"][keys["touch"].length - 1].action === "end")
            keys["touch"][keys["touch"].length - 1].x = -10000;
        
        // left arrow
        if (player.velX > -player.speed) {
            player.velX--;
        }
    }

    player.velX *= friction;
    player.velY += gravity;

    ctx.clearRect(0, 0, width, height);

    // 9999 / gradients = distance per gradient
    // floor(score / distance) = item (with overflow)
    // item % gradients = item to use
    var dG = 300  / hexGradients.length;
    var iG = Math.floor(player.score / dG);
    var iI = iG % hexGradients.length;
    ctx.fillStyle = hexGradients[iI];
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "black";
    ctx.beginPath();
    
    player.grounded = false;

    for (var i = 0; i < boxes.length; i++) {
        ctx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
        
        var dir = colCheck(player, boxes[i]);

        if (dir === "l" || dir === "r") {
            player.velX = 0;
            //player.jumping = true;
        } else if (dir === "b") {
            player.grounded = true;
            player.jumping = false;
        } else if (dir === "t") {
            player.velY *= -1;
        }

    }

    ctx.fill();
    
    if(player.grounded) {
         player.velY = 0;
    }

    player.x += player.velX;
    player.y += player.velY;

    if (player.x < 0) {
        // adjust player to right side of screen
        player.x = width + player.x;
    } else if (player.x > width) {
        // adjust player to left side of screen
        player.x = player.x - width;
    }

    if (player.x < 0 && player.x > -1 * player.width) {
        player.ghost = 1;
        player.x = width - Math.abs(player.x);
    } else if (player.x > width - player.width && player.x < width + player.width) {
        player.ghost = 1;
    } else {
        player.ghost = 0;
    }

    if (player.y >= height - player.height) {
        player.y = height - player.height;
        player.jumping = false;

        if (keys["touch"] && keys["touch"].length && keys["touch"][keys["touch"].length - 1].action === "end")
            keys["touch"] = null;

        if (bottomIsDeath) {
            player.dead = true;
        }
    }

    if (player.y <= midHeight) {
        // the floor is death
        bottomIsDeath = true;

        // player is above mid, shift everything down by difference between player height and mid
        var amountToShift = player.y - midHeight;
        player.y = midHeight;

        for (var i = 0; i < boxes.length; i++) {
            boxes[i].y -= amountToShift;
        }
            
        if (boxes[0].y > height) {
            // shift this box and add a new one
            boxes.shift();

            generateBasicPlatform();
        }

        splashAnimation.y -= amountToShift;
        
    }

    var activeSquid,
        activeSquidGhost;

    if (player.dead) {
        activeSquid = squidDead;
        activeSquidGhost = squidDead;
    } else if (!player.jumping) {
        if (player.jumpHold) {
            var jumpHoldTime = Math.round(Date.now() / 1) - player.jumpHold;
    
            if (jumpHoldTime > 1000) {
                activeSquid = squidFocus3;
                activeSquidGhost = squidFocus3;
            } else if (jumpHoldTime < 500) {
                activeSquid = squidFocus1;
                activeSquidGhost = squidFocus1;
            } else {
                activeSquid = squidFocus2;
                activeSquidGhost = squidFocus2;
            }
        } else {
            activeSquid = squidNeutral;
            activeSquidGhost = squidNeutral;
        }
    } else {
        activeSquid = squidNeutral;
        activeSquidGhost = squidNeutral;
    }

    if (player.jumping)
        animateSplash();

    ctx.drawImage(activeSquid, player.x, player.y, squidNeutral.width, squidNeutral.height);

    if (player.ghost !== 0) {
        // we need 2 players to control
        if (player.ghost === 1) {
            // ghost on left, original is positive
            // player.x - width = p positive distance from 0
            // player.width - p = inverse position
            var actualPosition = player.width + player.x - width;
            var hSize = (actualPosition / squidNeutral.width) * 100;
            ctx.drawImage(activeSquidGhost, 
                // selection
                // sx, sy, sWidth, sHeight
                100 - hSize, 0, hSize, 117,
                // draw at
                // dx, dy dWidth, dHeight
                0, player.y, actualPosition, squidNeutral.height);
        }
    }

    frameRate();
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
                colDir = "t";
                shapeA.y += oY;
            } else {
                colDir = "b";
                shapeA.y -= oY;
                
                if (player.score < shapeB.count)
                    player.score = shapeB.count;
            }
        } else {
            if (vX > 0) {
                colDir = "l";
                shapeA.x += oX;
            } else {
                colDir = "r";
                shapeA.x -= oX;
            }
        }
    }
    return colDir;
}

document.body.addEventListener("keydown", function(e) {
  keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function(e) {
  keys[e.keyCode] = false;
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

    keys["touch"] = [{
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
    
    keys["touch"].push({
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

    keys["touch"].push({
        x: touchX,
        y: touchY,
        action: "end"
    });
}

canvas.addEventListener("touchstart", touchStart, false);
canvas.addEventListener("touchmove", touchMove, false);
canvas.addEventListener("touchend", touchEnd, false);

function share() {
    var score = "https://twitter.com/intent/tweet?text=" + 
        "I%20made%20it%20to%20" + 
        myscore + 
        "%20platforms%20on%20r/Splatoon%20Hop!%20%23rsplatoonhop%20%23Splatoon%20" + 
        "How%20high%20can%20you%20go?%20https%3A%2F%2Fminigame.rsplatoon.com%2F";

    window.open(score,'_blank');
}

if (isTouchDevice()) {
    document.getElementById("mobileControls").style.display = "";
    document.getElementById("desktopControls").style.display = "none";
}