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