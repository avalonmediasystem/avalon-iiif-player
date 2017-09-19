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
      // filename: '[name].js'
      filename: 'iiif-player-bundle.js'
    },
    plugins: []
  },
  // Lint JS during development with StandardJs
  parts.lintJavaScript({ include: PATHS.app }),
  parts.loadCSS({
    include: [
      PATHS.app,
      path.resolve(__dirname, 'node_modules/mediaelement/src/css'),
      path.resolve(__dirname, 'node_modules/bootstrap/scss')
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
