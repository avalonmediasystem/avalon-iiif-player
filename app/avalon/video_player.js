import MediaPlayer from './media_player'
import HashHandler from './hash_handler'
import 'mediaelement'

export default class VideoPlayer extends MediaPlayer {
  constructor (options) {
    super(options)
    this.hashHandler = new HashHandler({
      'qualityChoices': this.getQualityChoices(),
      'instance': this
    })
    this.render()
  }

  render (mediaFragment) {
    /**
     * @param {object} mediaFragment - a mediaFragment
     * this method creates the video element
     **/

    if (mediaFragment === undefined) { mediaFragment = this.getVideoUri().id }
    const videoElement = `<video class='av-player-controls' id="iiif-av-player" class="mejs__player" height="${this.manifest.height}" width="${this.manifest.width}" controls data-mejsoptions='{"pluginPath": "", "alwaysShowControls": "true"}'>
  <source src="${mediaFragment}" type="video/mp4">
  <track kind="subtitles" src="${this.getSubtitles().id}" srclang="${this.getSubtitles().language}" >
</video>`
    const videoStructure = this.createStructure(this.manifest['structures'], [])
    this.target.innerHTML = `<div class='av-player'><div class='av-controls'>${videoStructure}</div><div class='av-controls'>${videoElement}</div></div>`

    // Activate MediaElement
    var player = new MediaElementPlayer('iiif-av-player', {}) // eslint-disable-line

    // Start listening for changes in the hash
    this.hashHandler.bindHashChange()
    var iiifPlayer = document.getElementById('iiif-av-player')
    iiifPlayer.insertAdjacentHTML('beforeend', this.qualitySelectorMarkup())

    // set the implicit links
    // this eventListenerer is only for getting the tests to pass with PhantomJS
    document.addEventListener('DOMContentLoaded', () => {
      this.addUrlsForParents()
    })
  }
}
