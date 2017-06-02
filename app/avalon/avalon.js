import $ from 'jquery'
import AudioPlayer from './audio_player'
import VideoPlayer from './video_player'

/** This class will look for certain data attributes in page markup
 * and then initiqlize a player. It uses an XHR request to get the
 * III-AV JSON.
 * @class Avalon
 */
export default class Avalon {
  initialize () {
     /**
     * this method checks the page markup for a iiif-av data attribute
     *
     * @method Avalon#initialize
     */
    if ($('[data-iiifav-source]').length > 0) {
      this.mediaPlayerVideo()
    }
    if ($('[data-iiifav-audio-source]').length > 0) {
      this.mediaPlayerAudio()
    }
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

  mediaPlayerAudio () {
     /**
     * this method reads the manifest via XHR and then adds the player to the page
     * @method Avalon#mediaPlayerAudio
     */
    var options = {}
    var manifestSource = $('[data-iiifav-audio-source]').data().iiifavAudioSource
    options.audio = {}
    options.target = $('[data-iiifav-audio-source]').attr('id')

    $.get(manifestSource, (manifest) => {
      options.manifest = manifest
      this.createAudioPlayer(options)
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
      this.createVideoPlayer(options)
    })
  }
}
