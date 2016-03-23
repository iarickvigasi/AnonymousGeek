var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var sass = require('gulp-sass');

gulp.task('sass', function () {
  return gulp.src('./src/scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/build/stylesheets'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./src/scss/*.scss', ['sass']);
});

gulp.task('build', function () {
    return browserify({entries: './src/js/app.js'})
        .transform(babel)
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest('./public/build/js'));
});

gulp.task('watch', ['build', 'sass'], function () {
    gulp.watch('./src/**/*', ['build', 'sass']);
});

gulp.task('default', ['watch']);
