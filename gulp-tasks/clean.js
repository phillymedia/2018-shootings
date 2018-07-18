var del = require('del');

module.exports = function(gulp, plugins) {
    return function() {
        del.sync('dist');
    };
};
