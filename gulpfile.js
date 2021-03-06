const gulp = require('gulp')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify-es').default
const log = require('fancy-log')
const color = require('ansi-colors')
const zip = require('gulp-zip')

gulp.task('build', () =>
  gulp
    .src('./js/clientWebRTC.js')
    .pipe(rename('sfRTC.min.js'))
    .pipe(uglify())
    .on('error', function(err) {
      log(color.red('[Error]'), err.toString())
    })
    .pipe(gulp.dest('./dist/'))
)

gulp.task('compress', () =>
  gulp
    .src('dist/sfRTC.min.js')
    .pipe(zip('sfRTC.zip'))
    .pipe(gulp.dest('dist'))
)

gulp.task('copy', () => gulp.src(['./package.json', './README.md']).pipe(gulp.dest('./dist')))

gulp.task('package', gulp.series('build', 'compress'))
gulp.task('build-for-npm', gulp.series('build', 'copy'))
