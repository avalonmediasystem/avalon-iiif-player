import Avalon from './avalon'
import MediaPlayer from './media_player'
import HashHandler from './hash_handler'
import UtilityHelpers from './utility_helpers'

export default class AudioPlayer extends MediaPlayer {
  constructor (options) {
    super(options)
    let utilityHelpers = new UtilityHelpers()
    this.avalon = new Avalon()
    this.canvases = this.getCanvases(options)

    // Display error message and remove player UI if no canvases exist in manifest
    if (this.canvases.length === 0) {
      utilityHelpers.displayErrorMessage('Problem with manifest structure')
      document.getElementById('data-iiifav-source').innerHTML = ''
      return
    }
    this.currentCanvas = this.getCanvas(this.canvases[0].id)
    this.hashHandler = new HashHandler({
      'qualityChoices': this.getQualityChoices(this.currentCanvas),
      'instance': this
    })
    this.render(options)
  }

  // Audio player configurations
  getAudioConfig () {
    return {
      audioHeight: this.manifest.height || 50,
      audioWidth: '100%'
    }
  }

  getAudioItems (canvas) {
    let audioItems = []
    canvas.content[0].items[0].body[0].items.forEach((item) => {
      if (item.type === 'Audio') {
        audioItems.push(item)
      }
    })
    return audioItems
  }

  getCanvas (id) {
    let targetCanvas = {}
    this.canvases.forEach((canvas) => {
      if (id.slice(id.indexOf('://')) === canvas.id.slice(canvas.id.indexOf('://'))) {
        targetCanvas = canvas
      }
    })
    return targetCanvas
  }

  render (options = { audio: {} }) {
    // Assume for now only one audio item, with different quality files
    let audioItems = this.getAudioItems(this.currentCanvas)

    options.audio = options.audio || {}
    options.audio.quality = options.audio.quality || 'Medium'

    if (audioItems.length < 1) {
      return
    }

    audioItems.forEach((item) => {
      if (item.label === options.audio.quality) {
        const audioElement =
          `<audio controls id="iiif-av-player" width="100%">
              <source src="${item.id}" type="audio/mp3" data-quality="${item.label}">
            </audio>`
        const audioStructure = this.createStructure(this.manifest['structures'], [])

        this.target.innerHTML = `
            <section class="ui stackable two column grid">
              <article id="structure" class="six wide column">${audioStructure}</article>
              <article class="ten wide column player-wrapper">${audioElement}</article>
            </section>
          `
        let audioPlayer = new MediaElementPlayer('iiif-av-player', this.getAudioConfig()) // eslint-disable-line

        // Start listening for changes in the hash
        this.hashHandler.bindHashChange()
        // set the implicit links

        this.addUrlsForParents()
      }
    })
  }
}
