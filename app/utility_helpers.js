import $ from 'jquery'

/**
 * @class UtilityHelpers
 * @classdesc Generic singleton utility helpers object for the application, which could potentially store application state
 */
export default class UtilityHelpers {
  constructor () {
    this.errorClass = 'error-message'
    this.elementTitles = this.getElementTitles()
  }

  closeAlertListener () {
    // Add click listener to close alert
    $(document.getElementById(utilityHelpers.elementTitles.alertElId)).find('button').on('click', (e) => {
      this.toggleAlertMessage('', false)
    })
  }

  getElementTitles () {
    return {
      alertElId: 'alert-message',
      currentManifestId: 'manifest-current',
      defaultManifest: 'lunchroom_manners_v2.json',
      manifestTitle: 'current-manifest-title',
      mountElId: 'iiif-standalone-player-mount',
      playerId: 'iiif-av-player',
      playerWrapperId: 'iiif-player-wrapper',
      sourceElId: 'data-iiifav-source',
      structureElId: 'iiif-structure-wrapper',
      urlTextInputId: 'manifest-url'
    }
  }

  /**
   * Slide toggle the DOM section which displays current manifest JSON object
   * @return {[type]} [description]
   */
  manifestDisplayListener () {
    let $currentManifest = $('section.current-manifest')

    $currentManifest.find('h4').on('click', (e) => {
      $currentManifest.find('pre').slideToggle()
    })
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

// This creates a singleton instance of utilityHelpers to pass around the application
export let utilityHelpers = new UtilityHelpers()
