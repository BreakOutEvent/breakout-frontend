'use strict';
var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: ['babel-polyfill', './src/js/reactTest.jsx'],
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: 'reactTest.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: path.resolve(__dirname, 'src/js/'),
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      }
    ]
  }
};