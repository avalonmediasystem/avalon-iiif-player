import $ from 'jquery'
import AudioPlayer from './avalon/audio-player'
import VideoPlayer from './avalon/video-player'

export default class Avalon {
  initialize () {
    if ($('[data-iiifav-source]').length > 0) {
      this.mediaPlayerVideo()
    }
    if ($('[data-iiifav-audio-source]').length > 0) {
      this.mediaPlayerAudio()
    }
  }

  createAudioPlayer (options) {
    return new AudioPlayer(options)
  }
  createVideoPlayer (options) {
    return new VideoPlayer(options)
  }

  mediaPlayerAudio () {
    var options = {}
    var manifestSource = $('[data-iiifav-audio-source]').data().iiifavAudioSource
    console.log(manifestSource)
    options.audio = {}
    options.target = $('[data-iiifav-audio-source]').attr('id')

    $.get(manifestSource, (manifest) => {
      console.log(manifest)
      options.manifest = JSON.parse(manifest)
      this.createAudioPlayer(options)
    })
  }

  mediaPlayerVideo () {
    var options = {}
    var manifestSource = $('[data-iiifav-source]').data().iiifavSource
    console.log(manifestSource)
    options.target = $('[data-iiifav-source]').attr('id')

    $.get(manifestSource, (manifest) => {
      console.log(manifest)
      options.manifest = manifest
      this.createVideoPlayer(options)
    })
  }
}

var avalon = new Avalon()
avalon.initialize()
