'use strict';
var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'src/js/main.js'),
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { 
        test: /\.js$/, 
        include: [
          path.resolve(__dirname, 'src/js')
        ],
        exclude: /node_modules/, 
        loader: 'babel-loader' 
      }
    ]
  }
};