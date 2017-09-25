import $ from 'jquery'
import IIIFParser from './iiif_parser'
import Player from './player'
import { utilityHelpers } from './utility_helpers'

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
    this.iiifParser = new IIIFParser()

    // Configuration object to hold element values, ids and such in one place
    this.configObj = {
      alertElId: 'alert-message',
      currentManifestId: 'manifest-current',
      defaultManifest: 'lunchroom_manners_v2.json',
      mountElId: 'iiif-standalone-player-mount',
      playerWrapperId: 'iiif-player-wrapper',
      sourceElId: 'data-iiifav-source',
      structureElId: 'iiif-structure-wrapper',
      urlTextInputId: 'manifest-url'
    }

    // Map of current manifest properties we need for parsing decisions
    this.manifestMap = {}

    // Variable to hold structures HTML markup as a string
    this.structureMarkup = ''

    // Current player wrapper instance
    this.playerWrapper = null

    // Save reference to manifest URL text input element
    this.manifestUrlEl = document.getElementById(this.configObj.urlTextInputId)

    // Root element necessary in HTML for our application to mount to
    this.mountEl = document.getElementById(this.configObj.mountElId)

    // Set up a manifest URL form listener
    this.prepareForm()

    // Get initial default manifest file
    let sourceEl = document.getElementById(this.configObj.sourceElId)
    if (sourceEl) {
      this.getManifestAJAX(sourceEl.dataset.iiifavSource)
      // Update manifest url display
      this.manifestUrlEl.value = sourceEl.dataset.iiifavSource
    }

    // Add event listeners
    this.addEventListeners()
  }

  /**
   * Add event listeners to UI elements
   * @function IIIFPlayer#addEventListeners
   * @return {void}
   */
  addEventListeners () {
    let $currentManifest = $('section.current-manifest')

    // Add click listener to close alert
    $(document.getElementById(this.configObj.alertElId)).find('button').on('click', (e) => {
      this.toggleAlertMessage('', false)
    })

    // Slide toggle the DOM section which displays current manifest JSON object
    $currentManifest.find('h4').on('click', (e) => {
      $currentManifest.find('pre').slideToggle()
    })
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
    let options = {}

    try {
      manifest = JSON.parse(data)
    } catch (e) {
      manifest = data
    }
    options.manifest = manifest
    options.configObj = this.configObj

    // Clear previous manifest's url hash
    utilityHelpers.clearHash()

    // Clear current structures markup
    this.structureMarkup = ''

    // Build helper map for current manifest
    this.manifestMap = this.iiifParser.buildManifestMap(manifest)

    // Create structure markup, or display message if no structures exist in manifest
    this.structureMarkup = (manifest.hasOwnProperty('structures')) ? this.createStructure(manifest.structures, [], true) : '<div class="alert alert-danger"><p>No structures array in manifest root</p></div>'

    // Put structure markup in DOM
    this.mountStructure()

    // Update manifest code in DOM
    $('#current-manifest-pre').html(JSON.stringify(manifest, null, 2))

    // Update manifest title in DOM
    document.getElementById('current-manifest-title').innerHTML = manifest.label || 'Manifest does not have a parent label property'

    // Get first content item to feed player
    options.contentObj = this.iiifParser.getFirstContentObj(manifest, this.manifestMap)

    // Create player instance
    this.playerWrapper = new Player(options)
  }

  /**
   * Recurse the manifest 'structures' array and creates an html tree of section links
   * @function IIIFPlayer#createStructure
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
          let structureLink = this.iiifParser.buildStructureLink(member)
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
   * Retrieve a manifest via Ajax
   * @function IIIFPlayer#getManifestAJAX
   * @param {string} url - Url of manifest, either 'http...' or a local file
   * @return {void}
   */
  getManifestAJAX (url) {
    let t = this

    // Clear any error messages if they exist
    t.toggleAlertMessage('')

    $.ajax({
      dataType: 'json',
      url: url
    })
      .done(t.ajaxSuccessHandler.bind(t))
      .fail((error) => {
        t.toggleAlertMessage(`Manifest URL Error - ${error.statusText}`, true)
      })
      .always(function () {
      })
  }

  /**
   * Add structures tree markup to DOM mount element
   * @function IIIFPlayer#mountStructure
   * @return {void}
   */
  mountStructure () {
    document.getElementById(this.configObj.structureElId).innerHTML = this.structureMarkup
  }

  /**
   * Set up listener for the Manifest Url form
   * @function IIIFPlayer#prepareForm
   * @return {void}
   */
  prepareForm () {
    let form = document.getElementById('manifest-url-form')

    if (!form) { return }
    // Add form submit event listener
    form.addEventListener('submit', this.submitURLHandler.bind(this))
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

  /**
   * Helper method to toggle the alert message
   * @param  {string} msg     Test message to display
   * @param  {boolean} display Whether to display the alert, or hide the alert
   * @return {null}
   */
  toggleAlertMessage (msg, display) {
    let el = document.getElementById('alert-message')
    let textEl = document.getElementById('alert-message-text')

    if (display) {
      textEl.innerText = msg
      el.classList.remove('hide')
    } else {
      textEl.innerText = ''
      el.classList.add('hide')
    }
  }
}
