import React, { Component } from 'react';
import IIIFParser from '../services/iiif-parser';

class StructuredNavigation extends Component {
  constructor(props) {
    super(props);
    this.iiifParser = new IIIFParser();
    this.manifest = this.props.manifest;

    // Start parsing
    this.parseManifest(this.manifest);
  }

  parseManifest(manifest) {
    const structure = this.iiifParser.createStructure(manifest.structures, undefined, true);
    console.log('structure', structure);
  }

  render() {
    return <h1>StructuredNavigation Here</h1>;
  }
}

export default StructuredNavigation;
