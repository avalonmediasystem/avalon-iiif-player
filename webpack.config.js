let path = require('path')

module.exports = {
  devtool: 'cheap-module-source-map',
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
  }
}
