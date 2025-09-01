const path = require("path");
const paths = require("../paths.js");
const htmlWepackPlugin = require("html-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
module.exports = {
  mode: "development",
  entry: path.resolve(paths.domain, "main.js"),
  output: {
    filename: "domain.js",
    path: path.resolve(paths.root, "dist"),
    clean: true, // 在每次建構前清理 /dist 資料夾
  },
  plugins: [
    new htmlWepackPlugin({
      title: "d3组件",
      template: path.resolve(paths.dev, "build/src/index.html"), // 指定模板 HTML
    }),
    new VueLoaderPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
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
        use: [ "style-loader", "css-loader"],
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
    port: 9301, // 或者您喜歡的埠號
    open: true,
    hot: true,
  },
};
