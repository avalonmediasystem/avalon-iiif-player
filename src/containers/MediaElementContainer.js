import React, { Component } from 'react';
import MediaElement from '../components/MediaElement';

class MediaElementContainer extends Component {
  state = {
    manifestUrl: this.props.manifestUrl,
    manifest: this.props.manifest,
    ready: false,
    sources: []
  };

  componentDidMount() {
    const { manifest } = this.state;

    this.getSources(manifest);
    this.setState({
      ready: true,
      sources: this.getSources(manifest)
    });
  }

  getSources(manifest) {
    let sourceUrl = '';
    try {
      sourceUrl = manifest.items['0'].items['0'].items['0'].body.items['0'].id;
    } catch (err) {
      console.log('Error parsing "sourceUrl" from manifest');
    }

    return [
      {
        src: sourceUrl,
        type: 'video/mp4'
      }
    ];
  }

  render() {
    const { manifest, ready, sources } = this.state;
    const options = {};

    if (ready) {
      return (
        <MediaElement
          id="avln-mediaelement-component"
          mediaType="video"
          preload="none"
          controls
          width={manifest.width || 480}
          height={manifest.height || 360}
          poster=""
          sources={JSON.stringify(sources)}
          options={JSON.stringify(options)}
        />
      );
    }
    return null;
  }
}

export default MediaElementContainer;
