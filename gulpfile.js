const gulp = require('gulp');
const uglify = require('gulp-uglify');
var gutil = require('gulp-util');

/*gulp.task('compress', ()=> (
    gulp.src('./js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/')))
);*/


gulp.task('compress', function() {
    return gulp.src('./js/*.js')
        // .pipe(concat('script.js'))
        .pipe(uglify())
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(gulp.dest('./dist/'))
    });