var gulp = require('gulp');
var del = require('del');
var nodemon = require('gulp-nodemon');
var gutil = require('gutil');

var webpack = require('webpack');
var buildCfg = require('./webpack.config');
var buildDevCfg = require('./webpack.dev-config');

// Clean

gulp.task('clean:dist', function() {
  del(['public/**/*']);
});

// Build

gulp.task('build:dev', function( done ) {
  webpack(buildDevCfg).run(function( err, stats ) {
    if( err ) {
    	throw new gutil.PluginError('webpack', err);
    }

    gutil.log('[webpack]', stats.toString({ hash: true, colors: true, cached: false }));

    done();
  });
});

// Watch

gulp.task('watch:dev', function () {
  gulp.watch(['scr/**/*.{js,jsx}'], ['build:dev']);
});

gulp.task('watch', ['watch:dev']);