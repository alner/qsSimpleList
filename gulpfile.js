var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpIgnore = require('gulp-ignore');
var less = require('gulp-less');
var del = require('del');
var zip = require('gulp-zip');
var minifyCSS = require('gulp-minify-css');
var runSequence = require('run-sequence');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var path = require('path');
var startDevServer = require('./server').start;
var build = require('./server').build;
var buildDest = require('./server.config.json').buildFolder;

var name = path.basename(__dirname);
var templateFile = './src/Template.qextmpl';
var lessFiles = './src/**/*.less';
var cssFiles = './src/**/*.css';

gulp.task('build', function(callback){
    build(function(err, stats){
        if(err) {
          return callback(err);
        }
        callback();
    });
});

gulp.task('devServer', function(callback){
    startDevServer(function(err, server){
        if(err) {
          return callback(err);
        }
        callback();
    });
});

gulp.task('qext', function () {
  return gulp.src(templateFile)
  .pipe(rename(name+'.qext'))
  .pipe(gulp.dest(buildDest));
});

gulp.task('less2css', function(){
  return gulp.src(lessFiles)
  .pipe(less())
  .pipe(minifyCSS({keepSpecialComments : 0}))
  .pipe(gulp.dest(buildDest));
});

gulp.task('css', function(){
  return gulp.src(cssFiles)
  .pipe(minifyCSS({keepSpecialComments : 0}))
  .pipe(gulp.dest(buildDest));
});

gulp.task('watch', function(){
  gulp.watch(templateFile, ['qext']);
  gulp.watch(lessFiles, ['less2css']);
  gulp.watch(cssFiles, ['css']);
});

gulp.task('remove-build-zip', function(callback){
  del.sync(['build/' + name + '.zip']);
  callback();
});

gulp.task('zip-build', function(){
  return gulp.src('build/*')
    .pipe(zip(name + '.zip'))
    .pipe(gulp.dest('build'));
});

gulp.task('development', ['qext', 'less2css', 'css', 'watch', 'devServer']);
gulp.task('production', function(callback) {  
  runSequence(['qext', 'less2css', 'css', 'remove-build-zip'],
    'build',
    'zip-build'
    );
});

gulp.task('default', ['production']);