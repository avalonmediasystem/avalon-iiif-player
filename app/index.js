import Avalon from './avalon/avalon'
import './css/demo.css'
import '../node_modules/mediaelement/src/css/mediaelementplayer.css'

document.addEventListener('DOMContentLoaded', () => {
  var avalon = new Avalon()
  avalon.initialize()
})
