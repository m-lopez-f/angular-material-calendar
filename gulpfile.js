/* eslint-env node */
const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const autoprefixer = require('gulp-autoprefixer');
const runSequence = require('run-sequence');
const connect = require('gulp-connect');
const gfi = require('gulp-file-insert');
const uglify = require('gulp-uglify');
const eslint = require('gulp-eslint');
const size = require('gulp-size');
const replace = require('gulp-replace');
const protractor = require('gulp-protractor').protractor;
const Karma = require('karma').Server;
const rename = require('gulp-rename');

function p(path) {
    return __dirname + (path.charAt(0) === '/' ? '' : '/') + path;
}

gulp.task('js', function() {
    return gulp
        .src(p('src/angular-material-calendar.js'))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest(''))
        .pipe(uglify())
        .pipe(size({gzip: true, prettySize: true}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest(''));
});

gulp.task('html', function() {
    return gulp
        .src(p('src/angular-material-calendar.html'))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(replace('\"', '\''))
        .pipe(gulp.dest(p('dist')))
        .pipe(gulp.dest(''))
        .pipe(connect.reload());
});

gulp.task('js:lint', function() {
    return gulp
      .src(p('src/angular-material-calendar.js'))
      .pipe(eslint())
      .pipe(eslint.format());
});

gulp.task('js:lint-ci', function() {
    return gulp
      .src(p('src/angular-material-calendar.js'))
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failOnError());
});

gulp.task('scss', function() {
    return gulp
        .src(p('src/**/*.scss'))
        .pipe(sass()).on('error', sass.logError)
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest(''))
        .pipe(cleanCSS())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest(''))
        .pipe(connect.reload());
});

gulp.task('karma:tdd', function(done) {
    new Karma({
        configFile: __dirname + '/karma.conf.js',
        singleRun: false
    }, done).start();
});

gulp.task('test', ['js:lint-ci'], function() {
    connect.server({root: 'website', port: 3000});
    gulp
      .src(['./tests/e2e/**/*.spec.js'])
      .pipe(protractor({configFile: p('protractor.conf.js')}))
      .on('error', function(e) { throw e; })
      .on('end', connect.serverClose);
});

gulp.task('build', function() {
    runSequence('scss', 'html', 'js');
});

gulp.task('connect', function() {
    connect.server({livereload: true, root: 'website', port: 3000});
});

gulp.task('watch', function() {
    gulp.watch(p('src/**/*'), ['js:lint', 'build']);
});

gulp.task('default', ['karma:tdd', 'connect', 'watch']);
