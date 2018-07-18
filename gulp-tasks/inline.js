var inline = require('gulp-inline');


module.exports = function(gulp, plugins) {
    return function() {
        var fs = require('fs');
        fs.writeFileSync('dist/css-js.html', '<link rel="stylesheet" href="min-files/styles.min.css"> <script src="min-files/main.min.js"></script>');

        gulp.src('dist/css-js.html')
            .pipe(inline({
                base: 'dist/'
            }))
            .pipe(gulp.dest('dist/'));
            // plugins.del.sync('dist/main.min.js');
            // plugins.del.sync('dist/styles.min.css');
    }
};
