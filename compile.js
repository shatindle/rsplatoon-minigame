const minify = require('@node-minify/core');
const uglifyJS = require('@node-minify/uglify-es');
 
minify({
  compressor: uglifyJS,
  input: './js/game.js',
  output: './js/game.min.js',
  callback: function(err, min) {}
});