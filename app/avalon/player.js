import HashHandler from './hash_handler'
import IIIFParser from './iiif_parser'
import MediaPlayer from './media_player'

import 'mediaelement'

export default class Player extends MediaPlayer {
  constructor (options) {
    super(options)
    this.iiifParser = new IIIFParser()
    this.contentObj = options.contentObj
    this.hashHandler = new HashHandler({
      'qualityChoices': this.getQualityChoices(this.contentObj),
      'instance': this
    })
    // id attribute of player
    this.playerElId = 'iiif-av-player'
    this.render(this.contentObj)
  }

  /**
   * Generate player markup (<audio> or <video>) depending on type of contentObj processed
   * @param {Object} item - Item object for media file
   * @returns {string} - <audio> or <video> markup HTML string
   */
  generatePlayerMarkup (item) {
    let markup = ''

    // Audio File
    if (item.type === 'Audio') {
      markup = `<audio controls id="iiif-av-player" width="100%">
          <source src="${item.id}" type="audio/mp3" data-quality="${item.label}">
        </audio>`
    }
    // Video File
    if (item.type === 'Video') {
      markup = `<video class='av-player-controls' id="${this.playerElId}" class="mejs__player" height="${this.manifest.height}" width="${this.manifest.width}" controls data-mejsoptions='{"pluginPath": "", "alwaysShowControls": "true"}'>
          <source src="${item.id}" type="video/mp4">
          <track kind="subtitles" src="${this.getSubtitles().id}" srclang="${this.getSubtitles().language}" >
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
    let item = this.getMediaURI(contentObj, qualityLevel)
    let playerMarkup = this.generatePlayerMarkup(item)

    document.getElementById(this.configObj.playerWrapperId).innerHTML = playerMarkup

    // Instantiate MediaElement player
    let player = new MediaElementPlayer(this.playerElId, {}) // eslint-disable-line

    // Start listening for changes in the hash
    this.hashHandler.bindHashChange()
  }
}
