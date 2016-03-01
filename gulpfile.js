'use strict';

var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var sass = require('gulp-sass');
var cache = require('gulp-cached');
var plumber = require('gulp-plumber');
var jade = require('gulp-jade');
var browserSync = require('browser-sync').create();
var ts = require('gulp-typescript');
var tsConfig = require('./src/tsconfig.json');
var webpack = require('gulp-webpack');
var webpackConfig = require('./webpack.config.js');

var paths = {
  src: 'src/',
  dist: 'dist/'
}

gulp.task('ts', function () {
    // TypeScriptのコンパイル
    var tsResult = gulp.src([paths.src + '**/*.ts', '!./src/typings'])
        // tscpnfig.jsonに書いたコンパイルオプションの取得
        .pipe(ts(tsConfig.compilerOptions))
        // webpack.config.jsに書いたwebpackの設定取得
        .pipe(webpack(webpackConfig));

    // JSファイルをdistに移動
    return tsResult.pipe(gulp.dest(paths.dist));
});

gulp.task('imagemin', function(){
  return gulp.src(paths.src + '**/*.{gif,jpg,png,svg}')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}]
    }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('sass', function(){
  return gulp.src(paths.src + '**/*.scss')
    .pipe(cache('sass'))
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(gulp.dest(paths.dist))
    .pipe(browserSync.stream());
});

gulp.task('jade', function(){
  return gulp.src(paths.src + '**/*.jade')
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('browser-sync', function(){
  return browserSync({
    server: {
      baseDir: paths.dist,
      port: 8080
    },
    ghostMode:{
      location: true
    }
  });
});

gulp.task('serve', ['sass'], function(){
  return browserSync.init({
    server: paths.dist
  });
  gulp.watch(paths.src, ['sass']);
});

gulp.task('watch', function(){
  gulp.watch( paths.src, function(event){ gulp.run('sass'); });
  gulp.watch('./src/**/*.ts', ['ts']);
});

gulp.task('default', ['watch', 'serve', 'sass', 'ts']);