import $ from 'jquery'
import './css/quality-selector.css'

export default class QualitySelector {
/**
 * this class creates a UI compontent that controls the quality of the video
 *
 * @class QualitySelector
 */
  changeQualityMarkup (markup, original, replacement) { var re = new RegExp(original, 'g'); return markup.replace(re, replacement) }

  currentQuality (windowLocationHash) {
/**
 * this method returns the current quality if it's present in the URL hash
 *
 * @method QualitySelector#currentQuality
 */
    return windowLocationHash.split('/quality/')[1]
  }

  qualityChoices (obj, stack, choices) {
/**
 * this method returns the quality choices in the manifest
 *
 * @method QualitySelector#qualityChoices
 */
    for (var property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (typeof obj[property] === 'object') {
          if (obj.type === 'Choice') {
            choices.push(obj.items)
          }
          this.qualityChoices(obj[property], stack + '.' + property, choices)
        }
      }
    }
    return choices[0]
  }

  renderChoices (ch) {
/**
 * this method will render markup containing an html list of the quality choices
 *
 * @method QualitySelector#renderChoices
 */
    var choiceList = ch.map((choice) => { return `<li class='quality-choice' data-quality-choice='${choice.id}'>${choice.label}</li>` })
    this.bindClick()
    this.bindSettings()
    return `<ul class='quality-selector'><li class='quality-settings'>Quality</li>${choiceList.join(',').replace(/,/g, '')}</ul>`
  }
  bindSettings () {
/**
 * this method toggles the display of the list of choices
 *
 * @method QualitySelector#bindSettings
 */
    $('body').on('click', '.quality-settings', (event) => {
      $('.quality-choice').toggle()
    })
  }
  bindClick () {
/**
 * this method controls the behavior of the quality selection interface
 *
 * @method QualitySelector#bindClick
 */
    $('body').on('click', '.quality-choice', (event) => {
      $('.quality-choice').removeClass('quality-selected')
      $('.quality-choice').toggle()
      $(event.target).addClass('quality-selected')
      var newMarkup
          // Change or add the hash to the url
      if (window.location.hash.search('/quality/') >= 0) {
        newMarkup = this.changeQualityMarkup($('.av-controls > ul').html(), this.currentQuality(window.location.hash), event.target.innerText)
          // Change the links in the structure
        $('.av-controls > ul').html(newMarkup)
        window.location.hash = window.location.hash.replace(`/quality/${this.currentQuality(window.location.hash)}`, `/quality/${event.target.innerText}`)
      } else {
          // In case there isn't a hash in the url already, Medium is the default so replace that
        newMarkup = this.changeQualityMarkup($('.av-controls > ul').html(), 'Medium', event.target.innerText)
        $('.av-controls > ul').html(newMarkup)
        window.location.hash = `#avalon/quality/${event.target.innerText}`
      }
    })
  }
  highlightQualityChoice () {

  }
}
