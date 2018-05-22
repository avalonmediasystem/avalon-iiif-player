import React, { Component } from 'react';
import MediaElementContainer from './containers/MediaElementContainer';
import StructuredNav from './components/StructuredNav';
import * as api from './services/api';

class App extends Component {
  state = {
    manifest: null,
    manifestUrl: ''
  };

  componentDidMount() {
    const manifestUrl = this.getManifestUrl();
    if (manifestUrl === '') { return; }

    const request = async () => {
      const manifest = await api.fetchManifest(manifestUrl);

      this.setState({
        manifest,
        manifestUrl
      });
    }
    request();
  }

  getManifestUrl() {
    const el = document.getElementById('avln-iiif-player-root');
    if (!el) { return ''; }
    return el.getAttribute('data-manifest-url');
  }

  render() {
    const { manifest } = this.state;

    if (manifest) {
      return (
        <section>
          <MediaElementContainer manifest={manifest} />
          <StructuredNav manifest={manifest} />
        </section>
      )
    }
    return <p>...Loading</p>;
  }
}

export default App;
