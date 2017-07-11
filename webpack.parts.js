exports.devServer = ({ host, port } = {}) => ({
  devServer: {
    contentBase: 'build',
    // Enable history API fallback so HTML5 History API based
    // routing works. Good for complex setups.
    historyApiFallback: true,

    // Display only errors to reduce the amount of output.
    // stats: 'errors-only',

    host, // Defaults to `localhost`
    port, // Defaults to 8080
    overlay: {
      errors: true,
      warnings: true
    }
  }
})

exports.lintJavaScript = ({ include }) => ({
  module: {
    rules: [
      {
        // set up standard-loader as a pre-loader
        enforce: 'pre',
        test: /\.js$/,
        loader: 'standard-loader',
        include,
        exclude: /(node_modules|bower_components)/,
        options: {
          // Emit errors instead of warnings (default = false)
          error: false,
          // enable snazzy output (default = true)
          snazzy: true
          // other config options to be passed through to standard e.g.
          // parser: 'babel-eslint'
        }
      },
      {
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      }
    ]
  }
})

exports.loadCSS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.css$/,
        include,
        exclude,
        loaders: ['style-loader', 'css-loader']
      },
      {
        test: /\.scss$/,
        include,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  }
})

exports.loadSVG = () => ({
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: [ 'svg-url-loader' ]
      }
    ]
  }
})
