var useref = require('gulp-useref');

module.exports = function(gulp, plugins) {
    return function() {
        return gulp.src(['.tmp/*.html'])
            .pipe(useref())
            .pipe(plugins.gulpIf('*.css', plugins.cssnano()))
            .pipe(gulp.dest('dist'));
    };
};
