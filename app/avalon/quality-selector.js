import $ from 'jquery'
import '../css/quality-selector.css'

export default class QualitySelector {
  changeQualityMarkup (markup, original, replacement) { var re = new RegExp(original, 'g'); return markup.replace(re, replacement) }

  currentQuality (windowLocationHash) {
    return windowLocationHash.split('/quality/')[1]
  }

  qualityChoices (obj, stack, choices) {
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
    console.log(ch)
    var choiceList = ch.map((choice) => { return `<li class='quality-choice' data-quality-choice='${choice.id}'>${choice.label}</li>` })  
      this.bindClick()
      this.bindSettings()
    return `<ul class='quality-selector'><li class='quality-settings'>Settings</li>${choiceList.join(',').replace(/,/g, '')}</ul>`
  }
    bindSettings () {
       
       $('body').on('click', '.quality-settings', (event) => {
           
           $('.quality-choice').toggle()
       })
   }
  bindClick () {
      $('body').on('click', '.quality-choice', (event) => {
          $('.quality-choice').removeClass('quality-selected')
          console.log($(event.target).addClass('quality-selected'))
          // Change or add the hash to the url
        if (window.location.hash.search('/quality/') >= 0) {
          var newMarkup = this.changeQualityMarkup($('.av-controls > ul').html(), this.currentQuality(window.location.hash), event.target.innerText)
          // Change the links in the structure
          $('.av-controls > ul').html(newMarkup)
          window.location.hash = window.location.hash.replace(`/quality/${this.currentQuality(window.location.hash)}`, `/quality/${event.target.innerText}`)
        } else {
          // In case there isn't a hash in the url already, Medium is the default so replace that
          var newMarkup = this.changeQualityMarkup($('.av-controls > ul').html(), 'Medium', event.target.innerText)
          $('.av-controls > ul').html(newMarkup)
            window.location.hash = `#avalon/quality/${event.target.innerText}`
        }
      })
  }
    highlightQualityChoice() {
        
    }
}
