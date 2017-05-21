var path = require('path')
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
            use: [ 'svg-inline-loader' ]
        }
    ]
    },
    
  devServer: {
    proxy: { // proxy URLs to backend development server
      '/api': 'http://localhost:9999'
    },
    contentBase: path.join(__dirname, 'dist'), // boolean | string | array, static file location
    compress: true, // enable gzip compression
    historyApiFallback: true, // true for index.html upon 404, object for multiple paths
    hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
    https: false, // true for self-signed, object for cert authority
    noInfo: true, // only errors & warns on hot reload
    // ...
  }
}

