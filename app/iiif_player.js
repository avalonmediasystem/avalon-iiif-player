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

    this.canvases = []

    // Configuration object to hold element values, ids and such in one place
    this.configObj = {
      alertElId: 'alert-message',
      currentManifestId: 'manifest-current',
      defaultManifest: 'lunchroom_manners_v2.json',
      mountElId: 'iiif-standalone-player-mount',
      playerId: 'iiif-av-player',
      playerWrapperId: 'iiif-player-wrapper',
      sourceElId: 'data-iiifav-source',
      structureElId: 'iiif-structure-wrapper',
      urlTextInputId: 'manifest-url'
    }

    this.currentCanvasId = ''

    this.manifest = null

    // Map of current manifest properties we need for parsing decisions
    this.manifestMap = {}

    // Variable to hold structures HTML markup as a string
    this.structureMarkup = ''

    this.playerEl = null

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
   * Add event listeners for submitting a new manifest url
   * and toggling display of manifest JSON code in UI
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
   * Handle clicking nested structure links
   */
  addStructureListeners () {
    const $el = $('#' + this.configObj.structureElId)
    let t = this

    $el.off()
    $el.on('click', (e) => {
      const target = e.target
      let updating = false

      // Set the reference to the player element, since we know
      // it now exists in the DOM
      if (!t.playerEl) {
        t.playerEl = document.getElementById(t.configObj.playerId)
      }

      if (target.nodeName === 'A') {
        e.preventDefault()
        // Handle update interuptions with a flag
        if (updating) {
          return false
        }
        updating = true

        let newCanvasId = target.href.split('#')[0]
        let startStopTimes = t.iiifParser.getStartStopTimes(target.href)

        $(t.playerEl).one('canplay', (e) => {
          if (updating) {
            console.log('canplay')
            t.playerWrapper.goToNewTime(startStopTimes[0])
            updating = false
          }
        })

        if (this.currentCanvasId === newCanvasId) {
          // Same canvas media object, just update the time
          t.playerWrapper.goToNewTime(startStopTimes[0])
        } else {
          // Get the new canvas for clicked structured link
          let canvas = t.iiifParser.getCanvas(newCanvasId, this.canvases)
          const choiceItems = canvas.content[0].items[0].body[0].items

          // Update current canvasId
          t.currentCanvasId = newCanvasId
          // Is new canvas object media type same as current canvas media type?
          // ie. (Video old, Video new)
          if (choiceItems[0].type === t.playerWrapper.currentPlayerType) {
            // Update the source media file feeding MEJS player
            t.playerWrapper.player.pause()
            t.playerWrapper.player.setSrc(choiceItems[0].id)
            t.playerWrapper.player.load()
            t.playerWrapper.player.play()
            console.log('loaded: ' + choiceItems[0].id)
          } else {
            // Destroy current player and render a new one
            // ie (Video old, Audio new)
            t.playerWrapper.destroyPlayerInstance()
            // t.playerWrapper.render(canvas.content[0])
            delete t.playerWrapper
            let options = {}
            options.manifest = t.manifest
            options.configObj = t.configObj
            options.contentObj = canvas.content[0]
            this.playerWrapper = new Player(options)
          }
        }
      }
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
    // Manifest SHOULD have 'sequences' but if not the canvas object might be the root object
    this.canvases = (manifest.hasOwnProperty('sequences')) ? manifest.sequences[0].canvases : [manifest]
    this.currentCanvasId = this.canvases[0].id

    this.manifest = manifest
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

    // Listen to structure link clicks
    this.addStructureListeners()

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
