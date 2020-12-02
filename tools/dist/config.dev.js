"use strict";

var path = require('path');

var webpack = require('webpack');

var nodeExternals = require('webpack-node-externals');

var isDev = process.argv.indexOf('--develop') >= 0;
var isWatch = process.argv.indexOf('--watch') >= 0;
var demoSrc = path.resolve(__dirname, './demo');
var demoDist = path.resolve(__dirname, '../miniprogram_dev');
var src = path.resolve(__dirname, '../src');
var dev = path.join(demoDist, 'components');
var dist = path.resolve(__dirname, '../miniprogram_dist');
module.exports = {
  entry: ['index', 'lib'],
  isDev: isDev,
  isWatch: isWatch,
  srcPath: src,
  // 源目录
  distPath: isDev ? dev : dist,
  // 目标目录
  demoSrc: demoSrc,
  // demo 源目录
  demoDist: demoDist,
  // demo 目标目录
  wxss: {
    less: false,
    // 使用 less 来编写 wxss
    sourcemap: false // 生成 less sourcemap

  },
  js: {
    webpack: true // 使用 webpack 来构建 js

  },
  webpack: {
    mode: 'production',
    output: {
      filename: '[name].js',
      libraryTarget: 'commonjs2'
    },
    target: 'node',
    externals: [nodeExternals()],
    // 忽略 node_modules
    module: {
      rules: [{
        test: /\.js$/i,
        use: [{
          loader: 'thread-loader'
        }, {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        } // ,{
        //   loader: 'eslint-loader',
        // }
        ],
        exclude: /node_modules/
      }, {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [{
          loader: 'thread-loader'
        }, {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }, {
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/],
            happyPackMode: true
          }
        } // , {
        //     loader: 'eslint-loader',
        //   }
        ]
      }]
    },
    resolve: {
      modules: [src, 'node_modules'],
      extensions: ['.js', '.json']
    },
    plugins: [new webpack.DefinePlugin({}), new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    })],
    optimization: {
      minimize: false
    },
    devtool: 'source-map',
    // 生成 js sourcemap
    performance: {
      hints: 'warning',
      assetFilter: function assetFilter(assetFilename) {
        return assetFilename.endsWith('.js');
      }
    }
  },
  copy: ['./assets', './utils.js'] // 将会复制到目标目录

};