import IIIFParser from './iiif_parser'
import QualitySelector from './quality_selector'
import { utilityHelpers } from './utility_helpers'
import 'mediaelement'
import '../node_modules/mediaelement/src/css/mediaelementplayer.css'

/**
 * @class Player
 * @classdesc Class representing a MediaelementJS player wrapper
 */
export default class Player {
  constructor (options) {
    this.iiifParser = new IIIFParser()
    this.manifest = options.manifest

    // Initial contentObject to build player from
    this.contentObj = options.contentObj

    // Track current player by item.type ie. 'Audio' or 'Video'
    this.currentPlayerType = ''

    // Instance of player
    this.player = undefined

    this.playerElId = 'iiif-av-player'

    // Render initial player
    this.render(this.contentObj)
  }

  /**
   * Completely remove the current player and it's Mediaelement instance
   * @function Player#destroyPlayerInstance
   * @return {void}
   */
  destroyPlayerInstance () {
    // Remove Mediaelement instance
    if (!this.player.paused) {
      this.player.pause()
    }
    this.player.remove()

    // Clear media tag (<audio> or <video>) from DOM
    let tagName = (this.currentPlayerType === 'Audio') ? 'audio' : 'video'
    let tagNameEl = document.getElementsByTagName(tagName)[0]
    tagNameEl.parentNode.removeChild(tagNameEl)
  }

  /**
   * Generate player markup (<audio> or <video>) depending on type of contentObj processed
   * @function Player#generatePlayerMarkup
   * @param {Object} item - Item object for media file
   * @returns {string} markup - <audio> or <video> markup HTML string
   */
  generatePlayerMarkup (contentObj, item) {
    let markup = ''
    let subtitlesObj = this.iiifParser.getSubtitles(contentObj)
    let dimensions = this.iiifParser.getPlayerDimensions(this.manifest, contentObj, item)
    let videoSourceFormat = item.format || 'video/mp4'
    let audioSourceFormat = item.format || 'audio/mp3'

    // Audio File
    if (item.type === 'Audio') {
      markup = `<audio width="100%" controls id="${this.playerElId}" data-mejsoptions='{"stretching": "responsive"}'>
          <source src="${item.id}" type="${audioSourceFormat}" data-quality="${item.label}">
        </audio>`
    }
    // Video File
    if (item.type === 'Video') {
      markup = `<video class="av-player-controls" id="${this.playerElId}" height="${dimensions.height}" width="${dimensions.width}" controls>
          <source src="${item.id}" type="${videoSourceFormat}">
          <track kind="subtitles" src="${subtitlesObj.id}" srclang="${subtitlesObj.language}">
        </video>`
    }
    return markup
  }

  /**
   * Safely set a new current time in player
   * @param  {[type]} startTime [description]
   * @return {[type]}           [description]
   */
  goToNewTime (startTime) {
    this.player.pause()
    this.player.setCurrentTime(startTime)
    this.player.play()
  }

  /**
   * Create the player html tag (audio or video), and instantiate MediaElementPlayer
   * @function Player#render
   * @param {Object} contentObj - Object representing the media content item
   * @param {string} qualityLevel - Quality level desired ie: 'Low', 'High', 'Medium', etc.
   * @return {void}
   **/
  render (contentObj, qualityLevel = 'Medium') {
    // Get current item in manifest to render
    let item = this.iiifParser.getContentItem(contentObj, qualityLevel)
    let defaults = {
      alwaysShowControls: true,
      pluginPath: ''
    }
    // Generate HTML5 markup which Mediaelement will hook into
    let playerMarkup = this.generatePlayerMarkup(contentObj, item)

    // Update environmental vars
    this.currentPlayerType = item.type
    this.contentObj = contentObj

    // Insert HTML5 tag markup
    document.getElementById(utilityHelpers.elementTitles.playerWrapperId).innerHTML = playerMarkup

    // Add poster image (if one exists) for video files
    if (this.currentPlayerType === 'Video') {
      let thumbnail = this.iiifParser.getThumbnail(this.manifest)
      if (thumbnail !== '') {
        defaults.poster = thumbnail
      }
    }

    // Instantiate MediaElement player
    this.player = new MediaElementPlayer(this.playerElId, defaults) // eslint-disable-line

    // this.hashHandler = new HashHandler({
    //   'playerClass': this
    // })
  }

}
