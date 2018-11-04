const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
      alias: {
        globals: path.resolve(__dirname, 'globals/')
      }
    },
    devServer: {
      contentBase: './dist'
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: [
            {
              loader: 'thread-loader'
            },
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/env'],
                plugins: ['transform-class-properties']
              }
            }]
        }        ]
    },
    stats: {
      colors: true,
      reasons: true,
      hash: true,
      version: true,
      timings: true,
      chunks: true,
      chunkModules: true,
      cached: true,
      cachedAssets: true
    },
};
