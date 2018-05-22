# Avalon IIIF-AV player

[![Build Status](https://travis-ci.org/avalonmediasystem/avalon-iiif-player.svg?branch=master)](https://travis-ci.org/avalonmediasystem/avalon-iiif-player) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


This is a React JavaScript application that displays a player and structured navigation when given a IIIF-AV
JSON manifest (spec 3.0).

## Demo Page:
- [https://avalonmediasystem.github.io/avalon-iiif-player/build/](https://avalonmediasystem.github.io/avalon-iiif-player/build/)

## Developing
Navigate to project root directory and run the following commands. A webpack dev server (with live re-loading) will start at: http://localhost:3334/

```
yarn install
yarn start
```

## Building

To build the bundle:

```
yarn build
```

## Running tests:

To run the project's Just unit tests:

```base
yarn test
```

## Travis Runs...


## To use on a page:

```html
 <html>
   <head>
     <title>Avalon IIIF Player Example</title>
   </head>
   <body>
     <div id="avln-iiif-player-root" class="avln-iiif-player" data-manifest-url="http://yourmanifest.com"></div>
     <script src="[INCLUDE /build/static/js/your-compiled-js-file-here.js]"></script>
   </body>
 </html>
```
The `data-manifest-url` attribute should link to a publicly accessible IIIF-AV manifest.
