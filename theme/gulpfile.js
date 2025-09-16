const { series, src, dest } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cached = require('gulp-cached');
const watch = require('gulp-watch');
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-cssmin');
// const sass = gulpSass(dartSass);
function compile() {
    return src('./build/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(
            autoprefixer({
                browsers: ['ie > 9', 'last 2 versions'],
                cascade: false,
            }),
        )
        .pipe(cssmin({ removeComments: true }))
        .pipe(dest('./lib'));
}

function copyfont() {
    return src('./fonts/**').pipe(cssmin()).pipe(dest('./lib/fonts'));
}

function devCompile() {
    const path = './build/*.scss';
    return watch(path, { verbose: true }, () => {
        src(path).pipe(sass().on('error', sass.logError)).pipe(dest('./lib'));
    });
}

exports.build = series(compile, copyfont);
exports.dev = devCompile;