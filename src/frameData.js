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