const path = require('path');

module.exports = (app) => {
    app.get("/", (req, res) => {
        res.render(path.join(__dirname, '/', 'game.min.html'));
    });
}