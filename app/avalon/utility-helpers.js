/** Class representing a MediaPlayer
 * @class MediaPlayer
 */
export default class UtilityHelpers {
  /**
   * Create a UtilityHelper
   * @constructor
   */
  constructor () {
    this.errorClass = 'error-message'
  }

  /**
   * Clear the hash params from URL
   * @method UtilityHelpers#clearHash
   * @return {void}
   */
  clearHash () {
    window.history.pushState('', document.title, window.location.pathname)
  }

  /**
   * Display default error message
   * @param msg
   * @return void
   */
  displayErrorMessage (msg) {
    let el = document.getElementById('manifest-current-wrapper')
    let newNode = document.createElement('div')
    let markup = `<i class="icon warning circle"></i>
                  <div class="content">
                     <p>${msg}</p> 
                  </div>`
    newNode.classList.add(this.errorClass)
    newNode.classList.add('ui')
    newNode.classList.add('negative')
    newNode.classList.add('icon')
    newNode.classList.add('message')
    newNode.innerHTML = markup
    el.parentNode.insertBefore(newNode, el.nextSibling)
  }

  removeErrorMessage () {
    let el = document.getElementsByClassName(this.errorClass)[0]
    if (el) {
      el.parentNode.removeChild(el)
    }
  }
}
