const express = require('express');
const path = require('path');


const app = express();

var server = require("https").createServer(app);

app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));

require("./pages/game")(app);

server.listen(443);
