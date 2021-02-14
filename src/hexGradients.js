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