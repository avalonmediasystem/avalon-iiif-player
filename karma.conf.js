const path = require('path')

let configuration = {
  // base path that will be used to resolve all patterns (eg. files, exclude)
  basePath: '',

  // To run Chrome browser on Travis CI environment
  customLaunchers: {
    Chrome_travis_ci: {
      base: 'Chrome',
      flags: ['--no-sandbox']
    }
  },

  // frameworks to use
  // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
  frameworks: ['jasmine-jquery', 'jasmine'],

  // list of files / patterns to load in the browser
  files: [
    'node_modules/jquery/dist/jquery.min.js',
    'spec/fixtures/*.html',
    'spec/**/*_spec.js',
    { pattern: 'build/*.json', watched: true, served: true, included: false }
  ],

  // preprocess matching files before serving them to the browser
  // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
  preprocessors: {
    'app/**/*.js': ['webpack', 'sourcemap'],
    'spec/**/*_spec.js': ['webpack', 'sourcemap'],
    'spec/fixtures/*.js': ['webpack']
  },
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
  },

  // test results reporter to use
  // possible values: 'dots', 'progress'
  // available reporters: https://npmjs.org/browse/keyword/karma-reporter
  reporters: ['progress'],

  // web server port
  port: 9876,

  // enable / disable colors in the output (reporters and logs)
  colors: true,

  // level of logging
  // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
  logLevel: config.LOG_INFO,

  // enable / disable watching file and executing tests whenever any file changes
  autoWatch: true,

  // start these browsers
  // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
  browsers: ['Chrome'],

  // Continuous Integration mode
  // if true, Karma captures browsers, runs the tests and exits
  singleRun: false,

  // Concurrency level
  // how many browser should be started simultaneous
  concurrency: Infinity
}

if (process.env.TRAVIS) {
  configuration.browsers = ['Chrome_travis_ci']
}

module.exports = function (config) {
  config.set(configuration)
}
