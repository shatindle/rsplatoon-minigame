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