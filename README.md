# Avalon IIIF-AV player 

[![Build Status](https://travis-ci.org/avalonmediasystem/avalon-poc-standalone.svg?branch=master)](https://travis-ci.org/avalonmediasystem/avalon-poc-standalone)

This is a JavaScript player that displays a player and navagation when given IIIF-AV 
JSON. 

## Demo Pages:
- [Video](https://avalonmediasystem.github.io/avalon-poc-standalone/dist/index.html)
  - [IIIF-AV Manifest](https://github.com/avalonmediasystem/avalon-poc-standalone/blob/master/dist/lunchroom_manners_v2.json)
- [Audio](https://avalonmediasystem.github.io/avalon-poc-standalone/dist/audio.html)
  - [IIIF-AV Manifest](https://github.com/avalonmediasystem/avalon-poc-standalone/blob/master/dist/mahler-symphony-3.json)
## Running tests:

To run the project's tests:

```base
./node_modules/karma/bin/karma start
```

## Building 

To build the bundle:

```bash
 ./node_modules/.bin/webpack
```

## To use on a page:

```html
 <html>
   <head>
     <title>Avalon Player Webpack Version</title>
   </head>
   <body>
     <div class="iiif-av-player"></div>
     <div id="data-iiifav-source"  data-iiifav-source="lunchroom_manners_v2.json"></div>
     <script src="bundle.js"></script>
   </body>
 </html>
```
The `data-iiifav-source` attribute should link to a publically accesible IIIF-AV manifest.
