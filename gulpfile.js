const gulp = require('gulp');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify-es').default;
const log = require('fancy-log');
const color = require('ansi-colors');

gulp.task('compress', function() {
    return gulp.src('./js/clientWebRTC.js')
        .pipe(rename("sfRTC.min.js"))
        .pipe(uglify())
        .on('error', function (err) {log(color.red('[Error]'), err.toString());})
        .pipe(gulp.dest('./dist/'))
});