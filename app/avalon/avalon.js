import $ from 'jquery'
import AudioPlayer from './audio_player'
// import VideoPlayer from './video_player'
import Player from './player'
import { utilityHelpers } from './utility_helpers'

/** Class representing the avalon IIIF player */
export default class Avalon {
  initialize () {
    // Configuration object to hold element values, ids and such in one place
    this.configObj = {
      defaultManifest: 'lunchroom_manners_v2.json',
      mountElId: 'iiif-standalone-player-mount',
      playerElId: 'iiif-player-wrapper',
      structureElId: 'iiif-structure-wrapper',
      urlTextInputId: 'manifest-url'
    }

    // Save reference to manifest URL text input element
    this.manifestUrlEl = document.getElementById(this.configObj.urlTextInputId)

    // Root element necessary in HTML for our application to mount to
    this.mountEl = document.getElementById(this.configObj.mountElId)

    // Set up initial markup for elements to mount to
    this.setupMarkup()

    // Map of current manifest properties we need for parsing decisions
    this.manifestMap = {}

    // Set up a manifest URL form listener
    this.prepareForm()

    this.structureMarkup = ''
  }

  /**
   * Handle AJAX success response of supplied manifest URL
   * @param {object} data - AJAX data response
   * @param {string} textStatus - AJAX text response
   * @param {object} jqXHR - AJAX request response
   * @returns {*}
   */
  ajaxSuccessHandler (data, textStatus, jqXHR) {
    let manifest = ''
    let options = {}
    let contentItem = {}
    let playerType = ''

    try {
      manifest = JSON.parse(data)
    } catch (e) {
      manifest = data
    }
    options.manifest = manifest

    // Clear previous manifest's url hash
    utilityHelpers.clearHash()

    // Clear current structures markup
    this.structureMarkup = ''

    // Update current manifest message
    document.getElementById('manifest-current').innerText = (this.manifestUrlEl.value !== '') ? this.manifestUrlEl.value : this.configObj.defaultManifest

    // Build helper map for parsing
    this.manifestMap = this.buildManifestMap(manifest)

    // Get first content item to feed player
    contentItem = this.getFirstContentItem(manifest)

    // Determine whether first canvas in manifest is audio or video file
    playerType = utilityHelpers.determinePlayerType(contentItem)

    // Create structure markup, or display message if no structures exist in manifest
    this.structureMarkup = (manifest.hasOwnProperty('structures')) ? this.createStructure(manifest.structures, [], true) : '<p>No structures in manifest</p>'

    // Put structure markup in DOM
    this.mountStructure()

    // Create player instance
    if (playerType === 'Audio') {
      return new AudioPlayer(options)
    } else if (playerType === 'Video') {
      return new Player(options)
    }
  }

  /**
   * Build a manifest map helper object for parsing
   * @param {Object} manifest - Manifest object
   * @returns {Object} A generated helper map object with information about current manifest
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
      obj.hasCanvases = !!manifest.sequences[0].canvases
      if (obj.hasCanvases === true) {
        obj.hasMultipleCanvases = manifest.sequences[0].canvases.length > 1
      }
    }
    return obj
  }

  /**
   * Generate a structure nested list link
   * @param {Object} member - A member object
   * @returns {string} - HTML string for the anchor link
   */
  buildStructureLink (member) {
    let members = member.members
    let id = members[0].id
    let structureLink = '#'

    if (this.getMediaFragment(id) !== undefined) {
      let mediaFragment = this.getMediaFragment(id)
      let canvasIndex = utilityHelpers.getCanvasIndex(id)
      let canvasHash = (canvasIndex !== '') ? `/canvas/${canvasIndex}` : ''

      structureLink = `<a data-turbolinks='false' data-target="#" href="#avalon/time/${mediaFragment.start},${mediaFragment.stop}/quality/Medium${canvasHash}" class="media-structure-uri" >${member.label}</a>`
    }
    return structureLink
  }

  /**
   * Recurse the manifest 'structures' array and creates an html tree of section links
   * @param {object} members - A 'members' array in the manifest, under 'structures' array
   * @param {string[]} list - Markup temporary storage array while building the nested unordered lists
   * @param {boolean} newUl - Flag whether to write a nested unordered list
   * @return {string} - HTML string containing a nested unordered list and links to section content
   */
  createStructure (members, list = [], newUl = false) {
    if (newUl) {
      list.push('<ul>')
    }
    members.map((member, index) => {
      if (member.type === 'Range' && member.hasOwnProperty('members')) {
        let members = member.members

        // Multiple members, create a new <ul>
        if (members.length > 1 || members[0].type === 'Range') {
          newUl = true
          list.push(`<li>${member.label}`)
          this.createStructure(members, list, newUl)
          list.push(`</li>`)
        }
        // Create a link; don't send child members object back in
        if (members.length === 1 && members[0].type === 'Canvas') {
          let structureLink = this.buildStructureLink(member)
          list.push(`<li>${structureLink}</li>`)
        }
      }
    })
    if (newUl) {
      list.push('</ul>')
    }
    return list.join('')
  }

  /**
   * Get a manifest's content array
   * @param {Object} manifest - A json manifest
   * @returns {Object} The first element in content array
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
   * Takes a uri with a media fragment that looks like #=120,134 and returns an object
   * with start/stop in seconds and the duration in milliseconds
   * @param {string} uri - Uri value
   * @return {Object}
   */
  getMediaFragment (uri) {
    if (uri !== undefined) {
      const fragment = uri.split('#t=')[1]
      if (fragment !== undefined) {
        const splitFragment = fragment.split(',')
        return { 'start': splitFragment[0],
          'stop': splitFragment[1] }
      } else {
        return undefined
      }
    } else {
      return undefined
    }
  }

  /**
   * Add structures tree markup to DOM mount element
   */
  mountStructure () {
    document.getElementById(this.configObj.structureElId).innerHTML = this.structureMarkup
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
      this.getManifestAJAX(this.configObj.defaultManifest)
    }
  }

  /**
   * Set up the initial markup wrappers for structures links and the player,
   * then add markup to the DOM
   * @return {void}
   */
  setupMarkup () {
    let structureEl = document.createElement('div')
    let playerEl = document.createElement('div')

    structureEl.setAttribute('id', this.configObj.structureElId)
    playerEl.setAttribute('id', this.configObj.playerElId)

    this.mountEl.appendChild(structureEl)
    this.mountEl.appendChild(playerEl)
  }

  /**
   * Form submit event handler
   * @param {Object} e - the event object
   * @returns {boolean}
   */
  submitURLHandler (e) {
    e.preventDefault()

    // Remove any existing error messages
    utilityHelpers.removeErrorMessage()
    this.getManifestAJAX(this.manifestUrlEl.value)
    return false
  }
}
