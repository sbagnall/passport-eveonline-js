var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jasmine = require('gulp-jasmine');

gulp.task('jshint', function () {
	return gulp.src([
			'./**/*.js',
			'!./node_modules/**/*.*'])
		.pipe(jshint({
			"node": true,
			"-W041": false
		}))
		.pipe(jshint.reporter('default'));
});

gulp.task('jasmine', function () {
	return gulp.src(['./spec/**/*.js'])
		.pipe(jasmine({verbose: false, includeStackTrace: true}));
});

gulp.task('default', ['jshint', 'jasmine']);