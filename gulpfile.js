var gulp = require('gulp');
var del = require('del');
var nodemon = require('gulp-nodemon');
var shell = require('gulp-shell');
var gutil = require('gutil');

var webpack = require('webpack');
var buildCfg = require('./webpack.config');
var buildDevCfg = require('./webpack.dev.config');

// Clean

gulp.task('clean:prod', function() {
  // del(['public/**/*']);
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
  gulp.watch(['scr/**/*.{js,jsx}'], ['build:dev']);
});

gulp.task('watch:prod', function() {
  gulp.watch(['scr/**/*.{js,jsx}'], ['build:prod']);
});

// Serve

gulp.task('server', function() {
  nodemon({
    script: 'server/index.js',
    ext: 'js,jsx',
    watch: ['server', 'src']
  });
});

// Webpack hot-reload server
// gulp.task('webpack-server', shell.task(['node ./hot/server']));

// Source maps server
// gulp.task('server:sources', function () {
//   connect.server({
//     root: __dirname,
//     port: 3001
//   });
// });

// Aliases

gulp.task('dev', ['build:dev', 'watch:dev', 'server']);

// gulp.task('hot', ['webpack-server']);

gulp.task('prod', ['build:prod', 'watch:prod', 'server']);

gulp.task('build', ['build:prod']);

gulp.task('default', ['dev']);