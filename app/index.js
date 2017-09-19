import IIIFPlayer from './iiif_player'
import './css/main.scss'

document.addEventListener('DOMContentLoaded', () => {
  var iiifPlayer = new IIIFPlayer()
  iiifPlayer.initialize()
})
