'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');
const babelify = require('babelify');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const cssnano = require('gulp-cssnano');

const reload = browserSync.reload;

function bundle(bundler){
	return bundler
			.bundle()
		    .on('error', function(e){
				gutil.log(e);
		     })
		  	.pipe(source('bundle.js'))
			.pipe(buffer())
    		.pipe(sourcemaps.init({loadMaps: true}))
			// Add transformation tasks to the pipeline here.
        	.pipe(uglify())
        	.on('error', gutil.log)
    		.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest('./dist/js'))
			.pipe(browserSync.stream());
}

gulp.task('js:watch', function(){
	var watcher = watchify(browserify('./src/js/app.js', { debug: true })
				  .transform(babelify));
	bundle(watcher);
	watcher.on('update', function(){
		bundle(watcher)
	});
	watcher.on('log', gutil.log);
});


gulp.task('js', function(){
	return bundle(browserify('./src/js/app.js', { debug: true }).transform(babelify));
});

gulp.task('sass', function(){
	gulp.src('./src/scss/**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass()
		.on('error', sass.logError))
		.pipe(cssnano())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./dist/css/'))
		.pipe(browserSync.stream());

});

gulp.task('sass:watch', function () {
  gulp.watch('./src/scss/**/*.scss', ['sass']);
});

gulp.task('html:watch', function(){
	gulp.watch(['./*.html'], reload);
});

gulp.task('default',['js','sass']);

gulp.task('watch',['html:watch','js:watch','sass:watch'], function(){
	browserSync.init({
		server: "./",
		logFileChanges: false
	});
});