const express = require('express');

module.exports = () => {
    // set up plain http server
    var http = express();

    // set up a route to redirect http to https
    http.get('*', function(req, res) {  
        res.redirect('https://' + req.headers.host + req.url);
    })

    // have it listen on 8080
    http.listen(80);
};