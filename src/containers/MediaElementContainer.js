import React, { Component } from 'react';
import MediaElement from '../components/MediaElement';
import mockManifest from '../json/lunchroom-manners';

class MediaElementContainer extends Component {

  state = {
    manifestUrl: this.props.manifestUrl,
    manifest: null,
    ready: false,
    sources: []
  };

  componentDidMount() {
    this.handleGetManifest();
  }

  handleGetManifest() {
    const request = async () => {
      const manifest = await this.fetchManifest();
      this.setState({
        ready: true,
        sources: this.getSources(manifest)
      })
    };

    request();
  }

  // Mock API call
  fetchManifest() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockManifest);
      }, 500);
    });
  }

  getSources(manifest) {
    let sourceUrl = manifest.content["0"].items["0"].body["0"].items["0"].id;
    return [
      {
        src: sourceUrl,
        type: 'video/mp4'
      }
    ];
  }

  render() {
    const { ready, sources } = this.state;
    const options = {};

    if (ready) {
      return (
        <MediaElement
          id="avln-mediaelement-component"
          mediaType="video"
          preload="none"
          controls
          width="640"
          height="360"
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
