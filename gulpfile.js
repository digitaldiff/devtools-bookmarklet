// gulpfile.js
const { src, dest, watch } = require('gulp');
const terser = require('gulp-terser');

function minifyJS() {
  return src('devtools.js')
    .pipe(terser())
    .pipe(dest('.', { overwrite: false })) // Ensure no overwriting
    .pipe(dest(file => {
      file.basename = 'devtools.min.js';
      return '.';
    }));
}

exports.default = function () {
  watch('devtools.js', minifyJS); // watch file and run minify on save
};