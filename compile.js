const minify = require('@node-minify/core');
const uglifyJS = require('@node-minify/uglify-es');
const fs = require('fs');
const uglifycss = require('uglifycss');

const sri = require('node-sri');

 
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

fs.writeFile(__dirname + "/css/game.min.css", css, () => {});

var jsFile = __dirname + "/js/game.min.js";

sri.hash(jsFile, function(err, hash){
  if (err) throw err

  console.log(hash + '  ' + jsFile)
});

var cssFile = __dirname + "/css/game.min.css";

sri.hash(cssFile, function(err, hash){
  if (err) throw err

  console.log(hash + '  ' + cssFile)
});