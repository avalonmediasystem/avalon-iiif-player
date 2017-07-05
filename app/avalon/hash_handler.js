import $ from 'jquery'
import IIIFParser from './iiif_parser'

/** Class representing a HashHandler
 * this class is used for functionality based on the hash in the url
 * @class HashHandler
 */
export default class HashHandler {
  constructor (options) {
    this.iiifParser = new IIIFParser()

    this.currentCanvasIndex = undefined
    this.playerClass = options.playerClass
    this.manifest = this.playerClass.manifest

    // Initialize based on first contentObject
    this.qualityChoices = this.iiifParser.getQualityChoices(this.playerClass.contentObj)

    this.updating = false
    // this.bindHashLinkClick()

    // Start listening for changes in the hash
    this.bindHashChange()
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

  /**
   * Binds the onhashchange event and checks the location.hash if a user comes directly from a URL with a hash in it
   * @method HashHandler#bindHashChange
   * @return {void}
   */
  bindHashChange () {
    // Get the player instance
    this.player = document.getElementById('iiif-av-player')

    if (window.location.hash.indexOf('#avalon') >= 0) {
      this.playFromHash(window.location.hash)
    }
    window.onhashchange = () => {
      this.playFromHash(window.location.hash)
    }
  }

  /**
   * Read a media fragment from a hash in the URL and then play the starting location from the hash
   * @param {string} hash - Url hash value
   * @return {void}
   */
  playFromHash (hash) {
    if (this.updating) {
      return
    }
    this.updating = true
    let hashOptions = this.processHash(hash)
    let canvasesExist = this.iiifParser.canvasesInManifest(this.manifest)
    let src = ''

    // Safari will only setCurrentTime() after 'canplay' event is fired
    // Using jQuery's 'one' method ensures event only fires once, but there may be a better solution to limit
    //   event listeners being unnecessarily added
    $(this.player).one('canplay', () => {
      this.player.setCurrentTime(parseInt(hashOptions.start))
      this.player.play()
      this.updating = false
    })

    // Is canvas in the hash different from canvas currently in the player?
    if (canvasesExist && (hashOptions.canvas !== this.currentCanvasIndex)) {
      // Get the new canvas object from canvas index
      let canvasObj = this.iiifParser.getCanvasByIndex(hashOptions.canvas, this.manifest)

      let playerType = this.iiifParser.determinePlayerType(canvasObj.content[0])

      // Different type of player required.
      // Destroy current instance and create a new instance of different player
      if (playerType !== this.playerClass.currentPlayerType) {
        this.playerClass.destroyPlayerInstance(canvasObj.content[0])
        return
      }

      this.qualityChoices = this.iiifParser.getQualityChoices(canvasObj.content[0])
      this.currentCanvasIndex = hashOptions.canvas
    }

    // Find the new source media file
    this.qualityChoices.forEach((choice) => {
      if (choice.label === hashOptions.quality) {
        src = choice.id
      }
    })

    // Load the new source file
    this.player.pause()
    this.player.setSrc(src)
    this.player.load()
  }

  /**
   * Processes a window.location.hash and creates an object.
   * It can take any number of parameters. Strings at even locations are keys
   * and odd locations are values.
   * Example: /key/value/someotherkey/value will give you {'key':'value','somotherkey':'value'}
   * @param {string} hash - a window.location.hash
   * @return {Object} - Representation of hash values in key/value pair
   **/
  processHash (hash) {
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
