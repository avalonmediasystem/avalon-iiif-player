import MediaPlayer from './media_player'
import HashHandler from './hash_handler'
import 'mediaelement'

export default class Player extends MediaPlayer {
  constructor (options) {
    super(options)
    this.hashHandler = new HashHandler({
      'qualityChoices': this.getQualityChoices(),
      'instance': this
    })
    this.render()
  }

  /**
   * Create the player element
   * @param {Object} uri - a uri
   * @return {void}
   **/
  render (uri) {
    // Get the 'Medium' quality item if no uri provided
    if (uri === undefined) { uri = this.getVideoUri().id }

    const videoElement = `<video class='av-player-controls' id="iiif-av-player" class="mejs__player" height="${this.manifest.height}" width="${this.manifest.width}" controls data-mejsoptions='{"pluginPath": "", "alwaysShowControls": "true"}'>
  <source src="${uri}" type="video/mp4">
  <track kind="subtitles" src="${this.getSubtitles().id}" srclang="${this.getSubtitles().language}" >
</video>`

    const videoStructure = this.createStructure(this.manifest['structures'], [])

    this.target.innerHTML = `<div class='av-player'><div class='av-controls'>${videoStructure}</div><div class='av-controls'>${videoElement}</div></div>`

    // Activate MediaElement
    let player = new MediaElementPlayer('iiif-av-player', {}) // eslint-disable-line

    // Start listening for changes in the hash
    this.hashHandler.bindHashChange()

    // Place quality selector on element
    let iiifPlayer = document.getElementById('iiif-av-player')
    iiifPlayer.insertAdjacentHTML('beforeend', this.qualitySelectorMarkup())

    // set the implicit links
    // this eventListenerer is only for getting the tests to pass with PhantomJS
    this.addUrlsForParents()
  }
}
