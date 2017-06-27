const path = require('path')
const merge = require('webpack-merge')
const parts = require('./webpack.parts')
const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
}

const commonConfig = merge([
  {
    devtool: 'source-map',
    entry: {
      app: PATHS.app
    },
    output: {
      path: PATHS.build,
      filename: '[name].js'
    },
    plugins: [
    ]
  },
  // Lint JS during development with StandardJs
  parts.lintJavaScript({ include: PATHS.app }),
  parts.loadCSS({
    include: [
      PATHS.app,
      path.resolve(__dirname, 'node_modules/mediaelement/src/css')
    ]
  }),
  parts.loadSVG()
])

const productionConfig = merge([
])

const developmentConfig = merge([
  parts.devServer({
    // Customize host/port here if needed
    host: process.env.HOST,
    port: process.env.PORT
  })
])

module.exports = (env) => {
  if (env === 'production') {
    return merge(commonConfig, productionConfig)
  }

  return merge(commonConfig, developmentConfig)
}

/*
module.exports = {
  devtool: 'cheap-module-source-map',
  entry: path.resolve('./app/index.js'),
  output: {
    filename: './build/bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        include: [
          path.join(__dirname, 'app'),
          path.join(__dirname, 'spec')
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]

      },
      {
        test: /\.svg$/,
        use: [ 'svg-url-loader' ]
      }
    ]
  }
}
*/
