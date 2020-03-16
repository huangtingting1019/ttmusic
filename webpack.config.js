let path = require('path');

let MiniCssExtractPlugin = require('mini-css-extract-plugin');

let miniCssExtractPlugin = new MiniCssExtractPlugin({
  filename: '[name][hash].css'
});

let HtmlWebpackPlugin = require('html-webpack-plugin');

let htmlWebpackPlugin = new HtmlWebpackPlugin({
  template: './index.html',
  inject: true,
  minify: {
    removeComments: true,
    removeAttributeQuotes: true,
    collapseWhitespace: true
  },
  filename: 'index.html'
});

//压缩css
let OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

//压缩js
let TerserJSPlugin = require('terser-webpack-plugin');

//压缩css实例
let optimizeCSSAssetsPlugin = new OptimizeCSSAssetsPlugin({});

//压缩JS实例
let terserJSPlugin = new TerserJSPlugin({});

module.exports = {

  //优化项
  optimization: {

    //压缩
    minimizer: [terserJSPlugin, optimizeCSSAssetsPlugin]
  },

  mode: 'production',

  entry: {
    index: ['./js/index.js']
  },

  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name][hash].min.js'
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {loader: MiniCssExtractPlugin.loader},
          {loader: 'css-loader'}
        ]
      },

      {
        test: /\.(png|gif|jpg|jpeg|webp)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 5120,
              esModule: false
            }
          }
        ]
      },

      {
        test: /\.html?$/,
        use: [
          {loader: 'html-withimg-loader'}
        ]
      }
    ]
  },

  plugins: [
    miniCssExtractPlugin,
    htmlWebpackPlugin
  ],

  devServer: {
    host: 'localhost',

    port: 8003
  }

}