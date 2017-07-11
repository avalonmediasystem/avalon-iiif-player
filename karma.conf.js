const path = require('path')

let configuration = {
  // enable / disable watching file and executing tests whenever any file changes
  autoWatch: true,

  // base path that will be used to resolve all patterns (eg. files, exclude)
  basePath: '',

  // start these browsers
  // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
  browsers: ['Chrome', 'PhantomJS'],

  // enable / disable colors in the output (reporters and logs)
  colors: true,

  // Concurrency level
  // how many browser should be started simultaneous
  concurrency: Infinity,

  // list of files / patterns to load in the browser
  files: [
    'node_modules/jquery/dist/jquery.min.js',
    'spec/fixtures/*.html',
    'spec/**/*_spec.js',
    { pattern: 'build/*.json', watched: true, served: true, included: false }
  ],

  // frameworks to use
  // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
  frameworks: ['jasmine-jquery', 'jasmine'],

  // web server port
  port: 9876,

  // preprocess matching files before serving them to the browser
  // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
  preprocessors: {
    'app/**/*.js': ['webpack', 'sourcemap'],
    'spec/**/*_spec.js': ['webpack', 'sourcemap'],
    'spec/fixtures/*.js': ['webpack']
  },

  // test results reporter to use
  // possible values: 'dots', 'progress'
  // available reporters: https://npmjs.org/browse/keyword/karma-reporter
  reporters: ['progress'],

  // Continuous Integration mode
  // if true, Karma captures browsers, runs the tests and exits
  singleRun: false,

  webpack: {
    devtool: 'inline-source-map',
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
}

module.exports = function (config) {
  // level of logging
  // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
  configuration.logLevel = config.LOG_INFO

  config.set(configuration)
}
