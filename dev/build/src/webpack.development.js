const path = require("path");
const htmlWepackPlugin = require("html-webpack-plugin");
const paths = require("../paths");
const { VueLoaderPlugin } = require("vue-loader");
console.log("🚀 ~ paths:", paths);

module.exports = {
  mode: "development",
  entry: paths.resolve(paths.src, "main.js"),
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true, // 在每次建構前清理 /dist 資料夾
  },
  plugins: [
    new htmlWepackPlugin({
      title: "Webpacksrc",
      template: path.resolve(paths.dev, "build/src/index.html"), // 指定模板 HTML
    }),
    new VueLoaderPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.js$/,
        use: ["babel-loader?cacheDirectory=true"],
        // include: path.resolve(__dirname, "../src"),
        // exclude: /(node_modules)/,
      },
      {
        test: /\.css$/i,
        use: [, "style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  devtool: "source-map",
  devServer: {
    // static: path.resolve(__dirname, "dist"),
    port: 9300, // 或者您喜歡的埠號
    open: true,
    hot: true,
  },
};
