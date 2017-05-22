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
    }
}
