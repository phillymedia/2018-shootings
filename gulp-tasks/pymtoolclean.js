var del = require('del');


module.exports = function(gulp, plugins) {
    return function() {
      gulp.src('pasteInTool/index.html')
        .pipe(plugins.removeCode({
          pymframe: true
         }))
        .pipe(gulp.dest('pasteInTool'))

        del.sync('pasteInTool/main.min.js');
        del.sync('pasteInTool/styles.min.css');
    };
};
