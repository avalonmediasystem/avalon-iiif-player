import '../../node_modules/mediaelement/src/css/mediaelementplayer.css'
import QualitySelector from './quality_selector'

/** Class representing a MediaPlayer */
export default class MediaPlayer {
  /**
   * Create a media player instance
   * @param {Object} options - Options object containing manifest and possibly other things?
   */
  constructor (options) {
    this.manifest = options.manifest
    this.configObj = options.configObj
  }

  /**
   * This takes a url generated by this software (not a URI from the manifest) and returns an object with start/stop in seconds and the duration in milliseconds
   * @param {string} url - URL string value
   * @return {Object}
   */
  getTimeFromUrl (url) {
    let re = new RegExp(/\d*,\d*/)
    let time = url.match(re)[0]
    let splitTime = time.split(',')
    return {
      start: splitTime[0],
      stop: splitTime[1]
    }
  }

  /**
   * This will replace the /time/345,536/ with a new time when given object like this: { start: 230 , stop : 340 }
   * @param {string} url - Url string
   * @param {Object} childStartStopTime
   * @return {string} - Start stop time key value for url hash
   */

  replaceTimeInUrl (url, childStartStopTime) {
    let startTime = this.getTimeFromUrl(url)
    let ourStart = startTime.start
    let theirStop = childStartStopTime.stop
    let newTimeString = `/time/${ourStart},${theirStop}/`
    let oldTime = (`/time/${startTime.start},${startTime.stop}/`)

    return url.replace(oldTime, newTimeString)
  }

  /**
   * This will add urls to labels in the structure navigation if they have the class .implicit
   * TODO: Revisit and fix this
   */
  addUrlsForParents () {
    try {
      var parentStopTimes = document.querySelectorAll('.implicit')
      parentStopTimes.forEach((el) => {
        let lastTimeIndex = el.querySelectorAll('.explicit').length - 1
        let childStartStopTime = this.getTimeFromUrl(el.querySelectorAll('.explicit')[lastTimeIndex].querySelector('a').href)
        let newTime = this.replaceTimeInUrl(el.querySelector('.media-structure-uri').href, childStartStopTime)

        let label = el.querySelector('li').textContent
        el.querySelector('li').textContent = ''

        let link = document.createElement('a')
        link.setAttribute('class', 'media-structure-uri')
        link.setAttribute('href', newTime)
        link.text = label
        el.querySelector('li').appendChild(link)
      })
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * Creates the quality selector markup
   * @returns {*}
   */
  qualitySelectorMarkup () {
    let qs = new QualitySelector()
    let choices = qs.qualityChoices(this.manifest, '', [])

    return qs.renderChoices(choices)
  }
}
