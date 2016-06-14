var gulp = require('gulp');
var changed = require('./index.js');

gulp.task('default', function() {
    return gulp.src('./package.json')
        .pipe(changed())
        .pipe(gulp.dest(function(file) {
            console.log(file);
            return file.path;
        }));
});