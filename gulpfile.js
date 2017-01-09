/**
 *
 *  Gulp Website Build Kit (based on Eskside Design Version)
 *  Leslie Glaves 01/04/2017
 *
 */

'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();  // Will lazy-load all package.json dependencies
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var reload = browserSync.reload;

// Set our autoprefix options
var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 6',
    'android >= 4.4',
    'bb >= 10'
];

// Concatenate and minify js files
gulp.task('js', function() {
    return gulp.src([
        'app/js/main.js',
        'app/js/perfmatters.js'
    ])
        //.pipe(concat("main.js"))
        // .pipe(gulp.dest('app/js'))
        .pipe(gulp.dest('dist/js'))
        //.pipe(rename('main.min.js'))
	    .pipe(uglify({
		    // mangle: {
			 //    except: ['timeToResize']
		    // }
            mangle: false
	    }))
	    .pipe(gulp.dest('dist/js'))
        .pipe(reload({stream: true, once: true}))
        .pipe(plugins.size({title: 'js'}));
});

// Compile, Concatenate and Minify CSS
gulp.task('sass', function () {
    return gulp.src('app/sass/*.scss')
        .pipe(plugins.changed('.tmp/styles', {extension: '.css'}))
        .pipe(plugins.sass({
            precision: 10
        }).on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(gulp.dest('.tmp'))
        // Concatenate and minify styles
        .pipe(plugins.if('*.css', plugins.minifyCss()))
        //.pipe(gulp.dest('app/css'))
        .pipe(gulp.dest('dist/css'))
        .pipe(plugins.size({title: 'sass'}));
});

// Optimize Images -- Skip Optimization Already Done Manually
 gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe(plugins.cache(plugins.imagemin({
            progressive: true,
            interlaced: true
        })))
         .pipe(gulp.dest('dist/images'))
         .pipe(plugins.size({title: 'images'}));
 });

// Minify HTML
gulp.task('html', function () {
    var opts = {comments:true,spare:true};
    return gulp.src('app/**/*.html')
        .pipe(plugins.if('*.html', plugins.minifyHtml(opts)))
        .pipe(gulp.dest('dist'))
        .pipe(plugins.size({title: 'html'}));
});

// Copy Fonts, Etc. to Build Folder
gulp.task('fonts', function () {
    return gulp.src(['app/fonts/**'])
        .pipe(gulp.dest('dist/fonts'))
        .pipe(plugins.size({title: 'fonts'}));
});

gulp.task('php', function() {
    return gulp.src('app/*.php')
        .pipe(gulp.dest('dist/'))
        .pipe(plugins.size({title: 'php'}));
});

gulp.task('extras', function() {
    return gulp.src([
        'app/*.ico',
        'app/*.xml',
        'app/.htaccess',
        'app/*.png',
        'app/*.txt'
    ])
        .pipe(gulp.dest('dist/'))
        .pipe(reload({stream: true}))
        .pipe(plugins.size({title: 'extras'}));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

// Start Development Server and Watch Files for Changes and Reload
gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: ['app/', '.tmp']
        },
        notify: false
    });
    gulp.watch(['app/**/*.html'], reload);
    gulp.watch(['app/css/**/*.css', 'app/sass/**/*.scss'], ['sass', reload]);
    gulp.watch(['app/js/**/*.js'], ['js', reload]);
    gulp.watch(['app/images/**/*'], ['images', reload]);
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
    runSequence(['js', 'sass', 'images', 'fonts', 'html', 'php', 'extras'], cb);
});

// Starts Production Server, runs the default (production build) task first,
// Then  Serves the Dist folder
gulp.task('serve:dist', ['default'], function () {
	//browserSync.init(paths.dist);
	browserSync.init({
		server: {
			baseDir: ['dist/']
		},
		notify: false
	});
});

// Run PageSpeed Insights on Actual Live Website
gulp.task('pagespeed', function (cb) {
    // Update the below URL to the public URL of your site
    pagespeed.output('http://your-website-url', {
    //pagespeed.output('http://192.168.1.11:3001', {
        strategy: 'mobile',
        // By default we use the PageSpeed Insights free (no API key) tier.
        // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
        // key: 'YOUR_API_KEY'
    }, cb);
});
