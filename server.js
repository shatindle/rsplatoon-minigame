const express = require('express');
const path = require('path');
const fs = require('fs');
const appSettings = require("./settings.json");

const app = express();

const key = appSettings.secure ? fs.readFileSync('./key.pem') : null;
const cert = appSettings.secure ? fs.readFileSync('./cert.pem') : null;

var server = appSettings.secure ? 
    require("https").createServer({key: key, cert: cert }, app) : 
    require("http").createServer(app);

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));

require("./pages/game")(app);

if (appSettings.secure) {
    server.listen(443);
} else {
    server.listen(80);
}
