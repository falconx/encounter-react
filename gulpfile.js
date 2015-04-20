var gulp = require('gulp');
var del = require('del');
var nodemon = require('gulp-nodemon');
var shell = require('gulp-shell');
var gutil = require('gutil');

var webpack = require('webpack');
var buildCfg = require('./webpack.config');
var buildDevCfg = require('./webpack.dev-config');

var FRONTEND_FILES = ['src/**/*.{js,jsx}'];

// Clean

gulp.task('clean:prod', function() {
  del(['public/bundle.js']);
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

gulp.task('build:prod', ['clean:prod'], function( done ) {
  webpack(buildDevCfg).run(function( err, stats ) {
    if( err ) {
    	throw new gutil.PluginError('webpack', err);
    }

    gutil.log('[webpack]', stats.toString({ hash: true, colors: true, cached: false }));

    done();
  });
});

// Watch

gulp.task('watch:dev', function() {
  gulp.watch(FRONTEND_FILES, ['build:dev']);
});

gulp.task('watch:prod', function() {
  gulp.watch(FRONTEND_FILES, ['build:prod']);
});

// Serve

gulp.task('server', function() {
  nodemon({
    script: 'server/index.js',
    ext: 'js,jsx',
    watch: ['server', 'src']
  });
});

// Source maps server
// gulp.task('server:sources', function () {
//   connect.server({
//     root: __dirname,
//     port: 3001
//   });
// });

// Aliases

gulp.task('dev', ['build:dev', 'watch:dev', 'server']);

gulp.task('prod', ['build:prod', 'watch:prod', 'server']);

gulp.task('build', ['build:prod']);

gulp.task('default', ['dev']);