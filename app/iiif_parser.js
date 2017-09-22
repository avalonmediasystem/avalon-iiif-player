/**
 * @class IIIFParser
 * @classdesc Class representing parsing functionality of an IIIF Manifest
 */
export default class IIIFParser {
  /**
   * Build a manifest map helper object for parsing
   * @function IIIFParser#buildManifestMap
   * @param {Object} manifest - Manifest object
   * @returns {Object} obj - A generated helper map object with information about current manifest
   */
  buildManifestMap (manifest) {
    let obj = {
      hasCanvases: false,
      hasMultipleCanvases: false,
      hasSequences: false,
      isAudio: false,
      isVideo: false
    }

    obj.hasSequences = !!manifest.sequences
    if (obj.hasSequences === true) {
      obj.hasCanvases = !!manifest.sequences[0].canvases
      if (obj.hasCanvases === true) {
        obj.hasMultipleCanvases = manifest.sequences[0].canvases.length > 1
      }
    }
    return obj
  }

  /**
   * Generate a structure nested list link
   * @function IIIFParser#buildStructureLink
   * @param {Object} member - A member object
   * @returns {string} structureLink - HTML string for the anchor link
   */
  buildStructureLink (member) {
    let members = member.members
    let id = members[0].id
    let structureLink = '#'

    if (this.getMediaFragment(id) !== undefined) {
      let mediaFragment = this.getMediaFragment(id)
      let canvasIndex = this.getCanvasIndex(id)
      let canvasHash = (canvasIndex !== '') ? `/canvas/${canvasIndex}` : ''

      structureLink = `<a data-turbolinks='false' data-target="#" href="#avalon/time/${mediaFragment.start},${mediaFragment.stop}/quality/Medium${canvasHash}" class="media-structure-uri" >${member.label}</a>`
    }
    return structureLink
  }

  /**
   * Does the manifest have a canvases array?
   * @function IIIFParser#canvasesInManifest
   * @return {boolean} - Does manifest have a canvases array
   **/
  canvasesInManifest (manifest) {
    return manifest.sequences && manifest.sequences[0].canvases
  }

  /**
   * Parse what type of content the file is
   * @function IIIFParser#determinePlayerType
   * @param {object} contentObj - The content item for which to find type
   * @returns {string} 'Audio' or 'Video' text (for now)
   */
  determinePlayerType (contentObj) {
    let body = lookForBody(contentObj)

    function lookForBody (obj) {
      if (obj.body) {
        return obj.body
      } else if (obj.items) {
        return lookForBody(obj.items[0])
      }
    }
    return body[0].items[0].type
  }

  /**
   * Retrieve all canvases from a manifest
   * @function IIIFParser#getCanvases
   * @param options
   * @returns {Array} canvases - An array of canvases present in manifest
   */
  getCanvases (options) {
    let canvases = []
    let sequences = options.manifest.sequences
    if (sequences && sequences.length > 0) {
      // Default use the first sequence to grab canvases
      canvases = sequences[0].canvases || []
    }
    return canvases
  }

  /**
   * Parse canvasId URI for the canvas index
   * @function IIIFParser#getCanvasIndex
   * @param {string} canvasId - key in manifest
   * @returns {string} canvasIndex - URI canvas index
   */
  getCanvasIndex (canvasId = '') {
    let canvasPos = canvasId.indexOf('canvas')
    let hashPos = canvasId.indexOf('#')
    let canvasIndex = ''

    if (canvasPos > -1 && hashPos > -1) {
      canvasIndex = canvasId.slice(canvasId.indexOf('/', canvasPos) + 1, canvasId.indexOf('#', canvasPos))
    } else if (canvasPos > -1 && hashPos === -1) {
      canvasIndex = canvasId.slice(canvasId.indexOf('/', canvasPos) + 1)
    }
    return canvasIndex
  }

  /**
   * Get a canvas object from manifest 'canvases' array
   * @function IIIFParser#getCanvasByIndex
   * @param {string} index - target canvas index
   * @param {Object} manifest - Manifest object
   * @returns {Object} canvasObject - An individual canvas object
   */
  getCanvasByIndex (index, manifest) {
    if (!index) { return {} }

    const manifestMap = this.buildManifestMap(manifest)
    let sequences = []
    let canvases = []
    let canvasObject = {}

    if (manifestMap.hasSequences) {
      sequences = manifest.sequences
      sequences.forEach((sequence) => {
        canvases = sequence.canvases
        canvases.forEach((canvas) => {
          const canvasIndex = canvas.id.slice(canvas.id.lastIndexOf('/') + 1)
          if (canvasIndex === index) {
            canvasObject = canvas
          }
        })
      })
    }
    return canvasObject
  }

  /**
   *  Get a target item at desired quality level
   *  @function IIIFParser#getContentItem
   *  @param {Object} contentObj - Canvas content object in manifest
   *  @param {string} qualityLevel - Quality level from manifest: ie. 'Medium', 'High'
   *  @return {Object} targetItem - An item object at desired quality level
   */
  getContentItem (contentObj, qualityLevel) {
    let targetItem = {}
    contentObj.items.forEach((item) => {
      item.body.forEach((body) => {
        if (body.hasOwnProperty('items')) {
          body.items.forEach((item) => {
            if (item.label === qualityLevel) {
              targetItem = item
            }
          })
        }
      })
    })
    return targetItem
  }

  /**
   * Get a manifest's content array
   * @function IIIFParser#getFirstContentObj
   * @param {Object} manifest - A json manifest
   * @param {Object} manifestMap - Helper object of manifest details
   * @returns {Object} firstContent[0] - The first element in content array
   */
  getFirstContentObj (manifest, manifestMap) {
    let firstContent = {}

    // No sequences, go right to content key
    if (!manifestMap.hasSequences) {
      firstContent = manifest.content

      // Has sequences and canvases
    } else if (manifestMap.hasSequences && manifestMap.hasCanvases) {
      firstContent = manifest.sequences[0].canvases[0].content

      // Has sequences, no root manifest canvases
    } else if (manifestMap.hasSequences && !manifestMap.hasCanvases) {
      // Sequence first object has 'items' key
      if (manifest.sequences[0].hasOwnProperty('items')) {
        // items first object has 'content' key
        if (manifest.sequences[0].items[0].hasOwnProperty('content')) {
          firstContent = manifest.sequences[0].items[0].content
        }
      }
    }
    return firstContent[0]
  }

  /**
   * Takes a uri with a media fragment that looks like #=120,134 and returns an object
   * with start/stop in seconds and the duration in milliseconds
   * @function IIIFParser#getMediaFragment
   * @param {string} uri - Uri value
   * @return {Object} - Representing the media fragment, or undefined
   */
  getMediaFragment (uri) {
    if (uri !== undefined) {
      const fragment = uri.split('#t=')[1]
      if (fragment !== undefined) {
        const splitFragment = fragment.split(',')
        return { 'start': splitFragment[0],
          'stop': splitFragment[1] }
      } else {
        return undefined
      }
    } else {
      return undefined
    }
  }

  /**
   * Determine quality choices present in the manifest
   * @function IIIFParser#getQualityChoices
   * @param {Object} contentObj - A contentObj object in the manifest
   * @return {Object[]} choices - An array of quality choices
   */
  getQualityChoices (contentObj) {
    let choices = []

    contentObj.items.forEach((item) => {
      item.body.forEach((body) => {
        if (body.hasOwnProperty('items')) {
          body.items.forEach((item) => {
            choices.push(item)
          })
        }
      })
    })
    return choices
  }

  /**
   * Determine a video's (no audio dimensions?) presentation dimensions
   * @function IIIFParser#getPlayerDimensions
   * @param {Object} manifest - Current manifest
   * @param {Object} contentObj - Element in content array
   * @param {Object} item - Element of manifest's body.items array
   * @returns {Object} dimensions - Dimensions key/value pair
   */
  getPlayerDimensions (manifest, contentObj, item) {
    let dimensions = {
      height: 480,
      width: 640
    }
    const canvasIndex = this.getCanvasIndex(contentObj.id)
    const canvas = this.getCanvasByIndex(canvasIndex, manifest)

    // Dimensions are at manifest root level
    if (manifest && manifest.hasOwnProperty('width')) {
      dimensions.height = manifest.height
      dimensions.width = manifest.width
    }

    // Dimensions are at canvas level
    if (canvas && canvas.hasOwnProperty('width')) {
      dimensions.height = canvas.height
      dimensions.width = canvas.width
    }

    // Dimensions are at item level
    if (item && item.hasOwnProperty('width')) {
      dimensions.height = item.height
      dimensions.width = item.width
    }
    return dimensions
  }

  /**
   * Determines whether manifest content object has subtitles included
   * @function IIIFParser#getSubtitles
   * @param {Object} contentObj - Manifest canvas content object
   * @return {Object} subtitlesObj - Object of subtitles in body array
   */
  getSubtitles (contentObj) {
    let subtitlesObj = {}

    contentObj.items.forEach((item) => {
      item.body.forEach((body) => {
        if (body.type === 'Text') {
          subtitlesObj = body
        }
      })
    })

    // Create any properties not present which the renderer depends upon
    subtitlesObj.id = subtitlesObj.id || ''
    subtitlesObj.language = subtitlesObj.language || ''

    return subtitlesObj
  }
}
