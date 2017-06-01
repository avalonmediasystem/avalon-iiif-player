var path = require('path')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: path.resolve('./app/index.js'),
  output: {
    filename: './dist/bundle.js'
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
  },
  plugins: [
    new UglifyJSPlugin()
  ]
}
