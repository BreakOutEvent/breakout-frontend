'use strict';
const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractLess = new ExtractTextPlugin({
  filename: '[name].css'
});

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js)$/,
        include: path.resolve(__dirname, 'src/client/react/'),
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.(js|jsx)$/,
        include: path.resolve(__dirname, 'src/client/js'),
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(less)$/,
        include: path.resolve(__dirname, 'src/client/less/'),
        use: extractLess.extract({
          use: [{
            loader: 'css-loader',
          }, {
            loader: 'postcss-loader'
          }, {
            loader: 'less-loader'
          }]
        })
      }, {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 10000
        }
      }
    ]
  },
  plugins: [extractLess]
};