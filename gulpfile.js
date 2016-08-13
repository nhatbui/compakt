var browserify = require('gulp-browserify');
var gulp = require('gulp');
var gutil = require('gulp-util');
uglify = require('gulp-uglify');
var rename = require('gulp-rename');


gulp.task('default', function() {
  var production = gutil.env.type === 'production';

  gulp.src(['./src/main.js'], {read: false})

    // Browserify, and add source maps if this isn't a production build
    .pipe(browserify({
      debug: !production
    }))

    .pipe(production ? uglify() : gutil.noop())

    // Rename the destination file
    .pipe(rename('contentscript.js'))

    // Output to the build directory
    .pipe(gulp.dest('./'));
});
