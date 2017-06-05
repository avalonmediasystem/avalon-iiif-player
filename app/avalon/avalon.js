import $ from 'jquery'
import AudioPlayer from './audio-player'
import VideoPlayer from './video-player'
import UtilityHelpers from './utility-helpers'

/** This class will look for certain data attributes in page markup
 * and then initiqlize a player. It uses an XHR request to get the
 * III-AV JSON.
 * @class Avalon
 */
export default class Avalon {
  initialize () {
    /**
     * this method checks the page markup for a iiif-av data attribute
     * @method Avalon#initialize
     */
    if ($('[data-iiifav-source]').length > 0) {
      this.mediaPlayerVideo()
    }
    if ($('[data-iiifav-audio-source]').length > 0) {
      this.mediaPlayerAudio()
    }
    this.prepareForm()
  }

  createAudioPlayer (options) {
    /**
     * this method will initlize create an AudioPlayer instance
     * @method Avalon#createAudioPlayer
     */
    return new AudioPlayer(options)
  }
  createVideoPlayer (options) {
    /**
     * this method will initlize create an VideoPlayer instance
     * @method Avalon#createVideoPlayer
     */
    return new VideoPlayer(options)
  }

  mediaPlayerAudio (manifestUrl) {
    /**
     * this method reads the manifest via XHR and then adds the player to the page
     * @method Avalon#mediaPlayerAudio
     */
    let utilityHelpers = new UtilityHelpers()
    let options = {}
    let $audioSource = $('[data-iiifav-audio-source]')
    let manifestSource = manifestUrl || $audioSource.data().iiifavAudioSource
    options.audio = {}
    options.target = $audioSource.attr('id')

    $.get(manifestSource)
      .done((manifest, textStatus, jqXHR) => {
        let json = ''
        try {
          json = JSON.parse(manifest)
        } catch (e) {
          json = manifest
        }
        options.manifest = json

        // New manifest URL, clear previous manifest's url hash
        if (manifestUrl) {
          utilityHelpers.clearHash()
        }

        // Create audio player
        this.createAudioPlayer(options)

        // Update current manifest message
        document.getElementById('manifest-current').innerText = manifestSource
      })
      .fail(function (error) {
        utilityHelpers.displayErrorMessage(`Manifest URL Error - ${error.statusText}`)
      })
      .always(function () {
      })
  }

  mediaPlayerVideo () {
    /**
     * this method reads the manifest via XHR and then adds the player to the page
     * @method Avalon#mediaPlayerVideo
     */
    var options = {}
    var manifestSource = $('[data-iiifav-source]').data().iiifavSource
    options.target = $('[data-iiifav-source]').attr('id')

    $.get(manifestSource, (manifest) => {
      options.manifest = manifest
      console.log(manifest)
      this.createVideoPlayer(options)
    })
  }

  /**
   * Set up listener for the Manifest Url form
   * @method Avalon#prepareForm
   * @return {void}
   */
  prepareForm () {
    let form = document.getElementById('manifest-url-form')
    if (!form) {
      return
    }
    let utilityHelpers = new UtilityHelpers()
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      utilityHelpers.removeErrorMessage()
      this.mediaPlayerAudio(document.getElementById('manifest-url').value)
      return false
    })
  }
}
