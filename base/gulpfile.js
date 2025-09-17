import gulp from "gulp";
import rollup from "gulp-rollup";
import terser from "@rollup/plugin-terser";
import fs from "fs";
import path from "path";
import babel from 'rollup-plugin-babel'

// // 扫描 utils 下所有 js 文件作为入口
// function getEntries() {
//   const dir = "./utils";
//   return fs.readdirSync(dir)
//     .filter(f => f.endsWith(".js"))
//     .map(f => path.join(dir, f));
// }
const mainEntry = './utils/index.js'
export function buildESM() {
  return gulp.src("./utils/**/*.js")
    .pipe(rollup({
      input: mainEntry,
      output: { format: "es" },
      plugins: [terser(), babel()]
    }))
    .pipe(gulp.dest("./dist/esm"));
}

export function buildCJS() {
  return gulp.src("./utils/**/*.js")
    .pipe(rollup({
      input: mainEntry,
      output: { format: "cjs", exports: "named" },
      plugins: [terser(), babel()]
    }))
    .pipe(gulp.dest("./dist/cjs"));
}

export default gulp.series(buildESM, buildCJS);
