import $ from 'jquery'

/** Class representing a HashHandler
 * this class is used for functionality based on the hash in the url
 * @class HashHandler
 */
export default class HashHandler {
  constructor (options) {
    this.currentCanvasIndex = undefined
    this.instance = options.instance
    this.qualityChoices = options.qualityChoices
    this.player = undefined
    this.updating = false
    //this.bindHashLinkClick()
  }

  /**
   * The function adds and handles a click listener for structure links
   * TODO: Fix this implementation, as it adds extra event listeners when a new manifest URL is loaded
   *
   * @method HashHandler#bindHashLinkClick
   * @returns {void}
   */
  // bindHashLinkClick () {
  //   let el = document.getElementById('data-iiifav-source').firstChild
  //   el.addEventListener('click', (event) => {
  //     if (event.target.className.indexOf('media-structure-uri') > -1 && window.location.hash.search('/time/') > -1) {
  //       this.playFromHash(event.target.hash)
  //     }
  //   })
  // }

  bindHashChange () {
    /**
     * this method binds the onhashchange event and checks the location.hash if a user comes directly from a URL with a hash in it
     * @method HashHandler#bindHashChange
     **/
    // Get the player instance
    this.player = document.getElementById('iiif-av-player')

    if (window.location.hash.indexOf('#avalon') >= 0) {
      this.playFromHash(window.location.hash)
    }
    window.onhashchange = () => {
      this.playFromHash(window.location.hash)
    }
  }

  canvasesInManifest () {
     /**
     * @method HashHandler#canvasesInManifest
     **/
    return this.instance.manifest.sequences && this.instance.manifest.sequences[0].canvases
  }

  playFromHash (hash) {
    /**
     * this method will read a media fragment from a hash in the URL and then play the starting location from the hash
     * @method HashHandler#playFromHash
     **/
    if (this.updating) {
      return
    }
    this.updating = true
    let options = this.processHash(hash)
    let canvasesExist = this.canvasesInManifest()
    let src = ''

    // Safari will only setCurrentTime() after 'canplay' event is fired
    // Using jQuery's 'one' method ensures event only fires once, but there may be a better solution to limit
    //   event listeners being unnecessarily added
    $(this.player).one('canplay', () => {
      this.player.setCurrentTime(parseInt(options.start))
      this.player.play()
      this.updating = false
    })

    // Is canvas in the hash different from canvas currently in the player?
    if (canvasesExist && (options.canvas !== this.currentCanvasIndex)) {
      // Get current canvas object from canvas index
      let canvasObj = this.instance.getCanvasByIndex(options.canvas)
      this.qualityChoices = this.instance.getQualityChoices(canvasObj)
      this.currentCanvasIndex = options.canvas
    }

    // Find the new source media file
    this.qualityChoices.forEach((choice) => {
      if (choice.label === options.quality) {
        src = choice.id
      }
    })

    // Load the new source file
    this.player.pause()
    this.player.setSrc(src)
    this.player.load()
  }

  processHash (hash) {
    /**
     *
     * This method processes a window.location.hash and creates an object.
     * It can take any number of parameters. Strings at even locations are keys
     * and odd locations are values.
     * Example: /key/value/someotherkey/value will give you {'key':'value','somotherkey':'value'}
     * @method HashHandler#processHash
     * @param {string} hash - a window.location.hash
     * @return {object}
     **/

    return hash.split('/').splice(1).reduce((result, item, index, array) => {
      if (index % 2 === 0) {
        if (item === 'time') {
          const time = array[index + 1].split(',')
          console.log('time', time)
          result['start'] = time[0]
          result['stop'] = time[1]
        }
        result[item] = array[index + 1]
      }
      return result
    }, {})
  }
}
