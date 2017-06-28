import $ from 'jquery'
import AudioPlayer from './audio_player'
import VideoPlayer from './video_player'
import { utilityHelpers } from './utility_helpers'

/** Class representing the avalon IIIF player */
export default class Avalon {
  constructor () {
    // Set a default local manifest to kick off application
    this.defaultManifest = 'lunchroom_manners_v2.json'

    // Save reference to manifest URL text input element
    this.manifestUrlEl = document.getElementById('manifest-url')

    // Map of current manifest properties we need for parsing decisions
    this.manifestMap = {}

    // Set up a manifest URL form listener
    this.prepareForm()
  }

  /**
   * Handle AJAX success response of supplied manifest URL
   * @param {object} manifest - AJAX data response
   * @param {string} textStatus - AJAX text response
   * @param {object} jqXHR - AJAX request response
   * @returns {*}
   */
  ajaxSuccessHandler (manifest, textStatus, jqXHR) {
    let json = ''
    let options = {}
    let contentItem = {}
    let playerType = ''

    try {
      json = JSON.parse(manifest)
    } catch (e) {
      json = manifest
    }
    options.manifest = json

    // Clear previous manifest's url hash
    utilityHelpers.clearHash()

    // Update current manifest message
    document.getElementById('manifest-current').innerText = (this.manifestUrlEl.value !== '') ? this.manifestUrlEl.value : this.defaultManifest

    // Get initial manifest structural info
    this.manifestMap = this.buildManifestMap(json)

    // Get first content item to feed player
    contentItem = this.getFirstContentItem(json)

    // Determine whether first canvas in manifest is audio or video file
    playerType = utilityHelpers.determinePlayerType(contentItem)

    if (playerType === 'Audio') {
      return new AudioPlayer(options)
    } else if (playerType === 'Video') {
      return new VideoPlayer(options)
    }
  }

  /**
   * Get a manifest's content array
   * @param {object} manifest - A json manifest
   * @returns {object} The first element in content array
   */
  getFirstContentItem (manifest) {
    let firstContent = {}

    // No sequences, go right to content key
    if (!this.manifestMap.hasSequences) {
      firstContent = manifest.content

    // Has sequences and canvases
    } else if (this.manifestMap.hasSequences && this.manifestMap.hasCanvases) {
      firstContent = manifest.sequences[0].canvases[0].content
    }
    return firstContent[0]
  }

  /**
   * Retrieve a manifest via Ajax
   * @param {string} url - Url of manifest, either 'http...' or a local file
   * @return {void}
   */
  getManifestAJAX (url) {
    $.ajax({
      dataType: 'json',
      url: url
    })
      .done(this.ajaxSuccessHandler.bind(this))
      .fail(function (error) {
        utilityHelpers.displayErrorMessage(`Manifest URL Error - ${error.statusText}`)
      })
      .always(function () {
      })
  }

  /**
   * Set up listener for the Manifest Url form
   * @method Avalon#prepareForm
   * @return {void}
   */
  prepareForm () {
    let form = document.getElementById('manifest-url-form')

    if (!form) { return }

    // Add form submit event listener
    form.addEventListener('submit', this.submitURLHandler.bind(this))

    // Initialize app with default local manifest
    if (this.manifestUrlEl.value.trim() === '') {
      this.getManifestAJAX(this.defaultManifest)
    }
  }

  /**
   * Form submit event handler
   * @param {object} e - the event object
   * @returns {boolean}
   */
  submitURLHandler (e) {
    e.preventDefault()

    // Remove any existing error messages
    utilityHelpers.removeErrorMessage()
    this.mediaPlayerAudio(document.getElementById('manifest-url').value)
    return false
  }

  /**
   * Build a manifest map helper object for parsing
   * @param {object} manifest - Manifest object
   * @returns {object} A generated map object
   */
  buildManifestMap (manifest) {
    let obj = {
      hasCanvases: false,
      hasMultipleCanvases: false,
      hasSequences: false,
      isAudio: false,
      isVideo: false
    }

    obj.hasSequences = !!manifest.sequences
    if (obj.hasSequences === true) {
      obj.hasCanvases = !!obj.sequences.canvases
      if (obj.hasCanvases === true) {
        obj.hasMultipleCanvases = obj.sequences.canvases.length > 1
      }
    }
    return obj
  }
}
