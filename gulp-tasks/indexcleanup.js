var del = require('del');

module.exports = function(gulp, plugins) {
    return function() {
      gulp.src('pymframe/index.html')
        .pipe(plugins.removeCode({ production: true }))
        .pipe(gulp.dest('pymframe'))
        del.sync('pymframe/main.min.js');
        del.sync('pymframe/styles.min.css');

    };
};
