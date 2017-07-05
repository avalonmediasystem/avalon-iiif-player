import HashHandler from './hash_handler'
import IIIFParser from './iiif_parser'
import MediaPlayer from './media_player'

import 'mediaelement'

export default class Player extends MediaPlayer {
  constructor (options) {
    super(options)
    this.iiifParser = new IIIFParser()
    this.contentObj = options.contentObj
    this.currentPlayerType = ''

    // Instance of player
    this.player = undefined

    this.playerElId = 'iiif-av-player'

    // Render initial player
    this.render(this.contentObj)
  }

  /**
   * Generate player markup (<audio> or <video>) depending on type of contentObj processed
   * @param {Object} item - Item object for media file
   * @returns {string} - <audio> or <video> markup HTML string
   */
  generatePlayerMarkup (contentObj, item) {
    let markup = ''
    let subtitlesObj = this.iiifParser.getSubtitles(contentObj)
    let dimensions = this.iiifParser.getPlayerDimensions(this.manifest, contentObj, item)

    // Audio File
    if (item.type === 'Audio') {
      markup = `<audio controls id="${this.playerElId}" width="100%">
          <source src="${item.id}" type="audio/mp3" data-quality="${item.label}">
        </audio>`
    }
    // Video File
    if (item.type === 'Video') {
      markup = `<video class='av-player-controls' id="${this.playerElId}" class="mejs__player" height="${dimensions.height}" width="${dimensions.width}" controls data-mejsoptions='{"pluginPath": "", "alwaysShowControls": "true"}'>
          <source src="${item.id}" type="video/mp4">
          <track kind="subtitles" src="${subtitlesObj.id}" srclang="${subtitlesObj.language}">
        </video>`
    }
    return markup
  }

  /**
   * Create the player html tag (audio or video), and instantiate MediaElementPlayer
   * @param {Object} contentObj - Object representing the media content item
   * @param {string} qualityLevel - Quality level desired ie: 'Low', 'High', 'Medium', etc.
   * @return {void}
   **/
  render (contentObj, qualityLevel = 'Medium') {
    // Get current item in manifest to render
    let item = this.getContentItem(contentObj, qualityLevel)

    // Generate HTML5 markup which Mediaelement will hook into
    let playerMarkup = this.generatePlayerMarkup(contentObj, item)

    // Update environmental vars
    this.currentPlayerType = item.type
    this.contentObj = contentObj

    // Insert HTML5 tag markup
    document.getElementById(this.configObj.playerWrapperId).innerHTML = playerMarkup

    // Instantiate MediaElement player
    this.player = new MediaElementPlayer(this.playerElId, {}) // eslint-disable-line

    this.hashHandler = new HashHandler({
      'playerClass': this
    })
  }

  destroyPlayerInstance (newContentObj) {
    // Remove old instance
    if (!this.player.paused) {
      this.player.pause()
    }
    this.player.remove()

    let tagName = (this.currentPlayerType === 'Audio') ? 'audio' : 'video'
    let tagNameEl = document.getElementsByTagName(tagName)[0]
    tagNameEl.parentNode.removeChild(tagNameEl)

    // Create new
    this.render(newContentObj)
  }
}
