/**
 * @class UtilityHelpers
 * @classdesc Generic singleton utility helpers object for the application, which could potentially store application state
 */
export default class UtilityHelpers {
  constructor () {
    this.errorClass = 'error-message'
  }

  /**
   * Clear the hash params from URL
   * @function UtilityHelpers#clearHash
   * @return {void}
   */
  clearHash () {
    window.history.pushState('', document.title, window.location.pathname)
  }

  /**
   * Create and display default error message
   * @function UtilityHelpers#displayErrorMessage
   * @param {string} msg - Message to display
   * @return {void}
   */
  displayErrorMessage (msg) {
    let el = document.getElementById('alert-message')
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

  /**
   * Removes an error message if one exists
   * @function UtilityHelpers#removeErrorMessage
   * return {void}
   */
  removeErrorMessage () {
    let el = document.getElementsByClassName(this.errorClass)[0]
    if (el) {
      el.parentNode.removeChild(el)
    }
  }
}

// This creates a singleton instance of utilityHelpers to pass around the application
export let utilityHelpers = new UtilityHelpers()
