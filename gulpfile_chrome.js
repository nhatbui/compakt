var browserify = require('gulp-browserify');
var gulp = require('gulp');
var gutil = require('gulp-util');
var rename = require('gulp-rename');


gulp.task('default', function() {
  var production = gutil.env.type === 'production';

  gulp.src(['./src/main_chrome.js'], {read: false})

    // Browserify, and add source maps if this isn't a production build
    .pipe(browserify({
      debug: !production
    }))

    // Rename the destination file
    .pipe(rename('compakt.js'))

    // Output to the build directory
    .pipe(gulp.dest('./'));
});
