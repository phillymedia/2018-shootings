var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();


plugins.gulpIf = require('gulp-if');
plugins.cssnano = require('gulp-cssnano');
plugins.runSequence = require('run-sequence');
plugins.browserSync = require('browser-sync').create();
plugins.gutil = require('gulp-util');
plugins.htmlmin = require('gulp-htmlmin');
plugins.removeCode = require('gulp-remove-code');

function getTask(task) {
    return require('./gulp-tasks/' + task)(gulp, plugins);
}

gulp.task('sass', getTask('sass'));
gulp.task('browserSync', getTask('browserSync'));
gulp.task('clean:dist', getTask('clean'));
gulp.task('nunjucks', getTask('nunjucks'));
gulp.task('nunjucks-build', getTask('nunjucks-build'));
gulp.task('useref', getTask('useref'));
gulp.task('indexcleanup', getTask('indexcleanup'));
gulp.task('sass-build', getTask('sass-build'));
gulp.task('inline', getTask('inline'));
gulp.task('browserify', getTask('browserify'));
gulp.task('browserifyBuild', getTask('browserify-build'));



gulp.task('watch', ['browserSync', 'sass', 'nunjucks'], function() {
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('app/**/*.html', ['nunjucks']);
    gulp.watch('app/js/*.+(js|html)', ['browserify']);
});

gulp.task('default', function(callback) {
    plugins.runSequence(['sass', 'browserify', 'nunjucks', 'browserSync', 'watch'],
        callback
    )
})

gulp.task('build', function(callback) {
    plugins.runSequence('clean:dist', 'browserifyBuild', ['sass-build', 'nunjucks-build'], 'useref', 'inline', 'indexcleanup',
        callback
    )
})
