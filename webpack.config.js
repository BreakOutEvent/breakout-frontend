'use strict';
const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: {
    reactApp: ['babel-polyfill', './src/client/react/App.jsx']
  },
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: path.resolve(__dirname, 'src/client/react/'),
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