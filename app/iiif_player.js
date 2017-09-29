import $ from 'jquery'
import IIIFParser from './iiif_parser'
import { utilityHelpers } from './utility_helpers'
import 'mediaelement'
import '../node_modules/mediaelement/src/css/mediaelementplayer.css'

/**
 * @class IIIFPlayer
 * @classdesc A wrapper for the IIIFPlayer IIIF player
 */
export default class IIIFPlayer {
  /**
   * @function IIIFPlayer#initialize
   * @description Initializer function
   * @return {void}
   */
  initialize () {
    let starterManifestEl = document.getElementById(utilityHelpers.elementTitles.sourceElId)

    this.iiifParser = new IIIFParser()
    this.initializeClassVars()
    // Get initial default manifest file
    if (starterManifestEl) {
      this.getManifestAJAX(starterManifestEl.dataset.iiifavSource)
      // Update manifest url display
      this.manifestUrlEl.value = starterManifestEl.dataset.iiifavSource
    }
    // Add event listeners
    this.addEventListeners()
  }

  /**
   * List all variables this class uses in one location
   * @function IIIFPlayer.initializeClassVars
   * @return {void}
   */
  initializeClassVars () {
    this.canvases = []
    this.currentCanvasId = ''
    this.currentPlayerType = ''
    this.manifest = null
    this.mejsPlayer = null
    this.playerEl = null
    // Current player wrapper instance
    this.playerWrapper = null
    // Save reference to manifest URL text input element
    this.manifestUrlEl = document.getElementById(utilityHelpers.elementTitles.urlTextInputId)
  }

  /**
   * Add event listeners for submitting a new manifest url
   * and toggling display of manifest JSON code in UI
   * @function IIIFPlayer#addEventListeners
   * @return {void}
   */
  addEventListeners () {
    let form = document.getElementById(utilityHelpers.elementTitles.manifestUrlForm)

    utilityHelpers.closeAlertListener()
    utilityHelpers.manifestDisplayListener()
    if (form) {
      form.addEventListener('submit', this.submitURLHandler.bind(this))
    }
  }

  /**
   * Add a listener to the structures DOM element
   * to handle clicking of structured metadata nested links
   * @function IIIFPlayer#addStructureListeners
   * @return {void}
   */
  addStructureListeners () {
    const $el = $('#' + utilityHelpers.elementTitles.structureElId)

    $el.off().on('click', this.structureClickHandler.bind(this))
  }

  /**
   * Handle clicking nested structure links
   * @function IIIFPlayer#structureClickHandler
   * @param {Object} e Click event
   * @return {void}
   */
  structureClickHandler (e) {
    let t = this
    const target = e.target
    let updating = false
    let playerEl = document.getElementById(utilityHelpers.elementTitles.playerId)

    if (target.nodeName === 'A') {
      e.preventDefault()
      // Handle update interuptions with a flag
      if (updating) {
        return false
      }
      updating = true

      let newCanvasId = target.href.split('#')[0]
      let startStopTimes = t.iiifParser.getStartStopTimes(target.href)

      $(playerEl).one('canplay', (e) => {
        if (updating) {
          console.log('canplay')
          t.goToNewTime(startStopTimes[0])
          updating = false
        }
      })

      if (this.currentCanvasId === newCanvasId) {
        // Same canvas media object, just update the time
        t.goToNewTime(startStopTimes[0])
      } else {
        // Get the new canvas for clicked structured link
        let canvas = t.iiifParser.getCanvas(newCanvasId, this.canvases)
        const choiceItems = canvas.content[0].items[0].body[0].items
        let mejsPlayer = t.mejsPlayer

        // Update current canvasId
        t.currentCanvasId = newCanvasId
        // Is new canvas object media type same as current canvas media type?
        // ie. (Video old, Video new)
        if (choiceItems[0].type === t.currentPlayerType) {
          // Update the source media file feeding MEJS player
          mejsPlayer.pause()
          mejsPlayer.setSrc(choiceItems[0].id)
          mejsPlayer.load()
          mejsPlayer.play()
          console.log('loaded: ' + choiceItems[0].id)
        } else {
          // Destroy current player and render a new one
          // ie (Video old, Audio new)
          t.destroyPlayerInstance()
          t.createMediaElementPlayer(canvas.content[0])
        }
      }
    }
  }

  /**
   * Handle AJAX success response of supplied manifest URL
   * @function IIIFPlayer#ajaxSuccessHandler
   * @param {object} data - AJAX data response
   * @param {string} textStatus - AJAX text response
   * @param {object} jqXHR - AJAX request response
   * @return {void}
   */
  ajaxSuccessHandler (data, textStatus, jqXHR) {
    let manifest = ''
    let markup = ''

    try {
      manifest = JSON.parse(data)
    } catch (e) {
      manifest = data
    }
    // Do manifest related stuff
    this.manifest = manifest
    // Update manifest code in DOM
    $('#current-manifest-pre').html(JSON.stringify(manifest, null, 2))
    // Update manifest title in DOM
    document.getElementById(utilityHelpers.elementTitles.manifestTitle).innerHTML = utilityHelpers.getLabel(manifest.label) || 'Manifest does not have a parent label property'

    // Do canvases related stuff
    this.canvases = this.iiifParser.getCanvases(manifest)
    this.currentCanvasId = this.canvases[0].id

    // Create nested structure markup and put it in DOM
    markup = (manifest.hasOwnProperty('structures')) ? this.iiifParser.createStructure(manifest.structures, [], true) : '<div class="alert alert-danger"><p>No structures array in manifest root</p></div>'
    document.getElementById(utilityHelpers.elementTitles.structureElId).innerHTML = markup

    // Listen for clicks on nested structure links
    this.addStructureListeners()

    // Get first content item to feed player
    let contentObj = this.iiifParser.getFirstContentObj(this.canvases)

    // Create player instance
    this.createMediaElementPlayer(contentObj)
  }

  createMediaElementPlayer (contentObj, qualityLevel = 'Medium') {
    // Get current item in manifest to render
    let item = this.iiifParser.getContentItem(contentObj, qualityLevel)
    let defaults = {
      alwaysShowControls: true,
      pluginPath: '',
      success: function (mediaElement, originalNode, instance) {
        console.log('created')
      }
    }
    // Generate HTML5 markup which Mediaelement will hook into
    let playerMarkup = this.generatePlayerMarkup(contentObj, item)

    // Update environmental vars
    this.currentPlayerType = item.type

    // Insert HTML5 tag markup
    document.getElementById(utilityHelpers.elementTitles.playerWrapperId).innerHTML = playerMarkup

    // Add poster image (if one exists) for video files
    if (this.currentPlayerType === 'Video') {
      let thumbnail = this.iiifParser.getThumbnail(this.manifest)
      if (thumbnail !== '') {
        defaults.poster = thumbnail
      }
    } else {
      defaults.stretching = 'responsive'
    }

    // Instantiate MediaElement player
    this.mejsPlayer = new MediaElementPlayer('iiif-av-player', defaults) // eslint-disable-line
  }

  /**
   * Completely remove the current player and it's Mediaelement instance
   * @function IIIFPlayer#destroyPlayerInstance
   * @return {void}
   */
  destroyPlayerInstance () {
    // Remove Mediaelement instance
    if (!this.mejsPlayer.paused) {
      this.mejsPlayer.pause()
    }
    this.mejsPlayer.remove()

    // Clear media tag (<audio> or <video>) from DOM
    let tagName = (this.currentPlayerType === 'Audio') ? 'audio' : 'video'
    let tagNameEl = document.getElementsByTagName(tagName)[0]
    tagNameEl.parentNode.removeChild(tagNameEl)
  }

  /**
   * Generate player markup (<audio> or <video>) depending on type of contentObj processed
   * @function IIIFPlayer#generatePlayerMarkup
   * @param {Object} item - Item object for media file
   * @returns {string} markup - <audio> or <video> markup HTML string
   */
  generatePlayerMarkup (contentObj, item) {
    let markup = ''
    const playerId = utilityHelpers.elementTitles.playerId
    let subtitlesObj = this.iiifParser.getSubtitles(contentObj)
    let dimensions = this.iiifParser.getPlayerDimensions(this.manifest, contentObj, item)
    let videoSourceFormat = item.format || 'video/mp4'
    let audioSourceFormat = item.format || 'audio/mp3'

    // Audio File
    if (item.type === 'Audio') {
      markup = `<audio width="100%" controls id="${playerId}">
          <source src="${item.id}" type="${audioSourceFormat}" data-quality="${item.label}">
        </audio>`
    }
    // Video File
    if (item.type === 'Video') {
      markup = `<video id="${playerId}" height="${dimensions.height}" width="${dimensions.width}" controls>
          <source src="${item.id}" type="${videoSourceFormat}">
          <track kind="subtitles" src="${subtitlesObj.id}" srclang="${subtitlesObj.language}">
        </video>`
    }
    return markup
  }

  /**
   * Retrieve a manifest via Ajax
   * @function IIIFPlayer#getManifestAJAX
   * @param {string} url - Url of manifest, either 'http...' or a local file
   * @return {void}
   */
  getManifestAJAX (url) {
    let t = this

    // Clear any error messages if they exist
    utilityHelpers.toggleAlertMessage('')

    $.ajax({
      dataType: 'json',
      url: url
    }).done(t.ajaxSuccessHandler.bind(t))
      .fail((error) => {
        utilityHelpers.toggleAlertMessage(`Manifest URL Error - ${error.statusText}`, true)
      })
  }

  /**
   * Safely set a new current time in player
   * @param  {[type]} startTime [description]
   * @return {[type]}           [description]
   */
  goToNewTime (startTime) {
    this.mejsPlayer.pause()
    this.mejsPlayer.setCurrentTime(startTime)
    this.mejsPlayer.play()
  }

  /**
   * Form submit event handler
   * @function IIIFPlayer#submitURLHandler
   * @param {Object} e - the event object
   * @return {boolean} false - Prevent default form submit behavior
   */
  submitURLHandler (e) {
    e.preventDefault()
    this.getManifestAJAX(this.manifestUrlEl.value)
    return false
  }
}
