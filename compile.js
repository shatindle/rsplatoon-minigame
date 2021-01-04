const minify = require('@node-minify/core');
const uglifyJS = require('@node-minify/uglify-es');
const fs = require('fs');
const uglifycss = require('uglifycss');
const sri = require('node-sri');

module.exports = () => {
  minify({
    compressor: uglifyJS,
    input: __dirname + '/js/game.js',
    output: __dirname + '/js/game.min.js',
    callback: function(err, min) {}
  });
  
  var css = uglifycss.processFiles(
    [ __dirname + '/css/game.css' ],
    { maxLineLen: 500, expandVars: true }
  );
  
  fs.writeFileSync(__dirname + "/css/game.min.css", css);
  
  var jsFile = __dirname + "/js/game.min.js";

  var file = fs.readFileSync(__dirname + "/pages/game.html", "utf8");
  fs.writeFileSync(__dirname + "/pages/game.min.html", file);
  
  sri.hash(jsFile, function(err, hash){
    if (err) throw err

    var file = fs.readFileSync(__dirname + "/pages/game.min.html", "utf8");
    file = file.replace("##jsintegrity##", hash);
    fs.writeFileSync(__dirname + "/pages/game.min.html", file);
  
    console.log(hash + '  ' + jsFile)
  });
  
  var cssFile = __dirname + "/css/game.min.css";
  
  sri.hash(cssFile, function(err, hash){
    if (err) throw err

    var file = fs.readFileSync(__dirname + "/pages/game.min.html", "utf8");
    file = file.replace("##cssintegrity##", hash);
    fs.writeFileSync(__dirname + "/pages/game.min.html", file);
  
    console.log(hash + '  ' + cssFile)
  });
};