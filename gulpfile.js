const gulp = require('gulp');
const minify = require('gulp-minify');
var gutil = require('gulp-util');

gulp.task('compress', function() {
    return gulp.src('./js/*.js')
        .pipe(minify())
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(gulp.dest('./dist/'))
});