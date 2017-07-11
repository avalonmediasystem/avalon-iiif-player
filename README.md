# Avalon IIIF-AV player 

[![Build Status](https://travis-ci.org/avalonmediasystem/avalon-poc-standalone.svg?branch=master)](https://travis-ci.org/avalonmediasystem/avalon-poc-standalone) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


This is a JavaScript player that displays a player and navagation when given IIIF-AV 
JSON. 

## Demo Page:
- [https://avalonmediasystem.github.io/avalon-poc-standalone/build/](https://avalonmediasystem.github.io/avalon-poc-standalone/build/)

## Developing
Navigate to project root directory and run the following commands. A webpack dev server (with live re-loading) will start at: http://localhost:8080/

```
npm install
npm run start
```

## Building 

To build the bundle:

```
npm run build
```

## Running tests:

To run the project's Karma / Jasmine unit tests:

```base
npm run test
```

## Travis Runs...
```base
standard
karma start --single-run --browsers PhantomJS
```

## To use on a page:

```html
 <html>
   <head>
     <title>Avalon Player Webpack Version</title>
   </head>
   <body>
     <div id="iiif-standalone-player-mount"></div>
     <div id="data-iiifav-source"  data-iiifav-source="lunchroom_manners_v2.json"></div>
     <script src="iiif-player-bundle.js"></script>
   </body>
 </html>
```
The `data-iiifav-source` attribute should link to a publically accesible IIIF-AV manifest.

## JSDoc Documentation

Documentation generated from JSDoc comments is published <a href="https://avalonmediasystem.github.io/avalon-poc-standalone/out/">here</a>. 

To run the JSDoc utility and update documentation:
```
npm run jsdoc
```

## Using with GitHub Pages

You can fork this repository to host your own IIIF Player. 

First fork this repository, then edit the HTML pages and upload your own manifests in the `build` folder. 

Commit the changes and then push. 
