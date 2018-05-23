import React, { Component } from 'react';
import MediaElementContainer from './containers/MediaElementContainer';
import StructuredNav from './components/StructuredNav';
import ErrorMessage from './components/ErrorMessage';
import * as api from './services/api';

class App extends Component {
  state = {
    manifest: null,
    manifestUrl: ''
  };

  componentDidMount() {
    const manifestUrl = this.getManifestUrl();
    if (manifestUrl === '') {
      return;
    }

    const request = async () => {
      const response = await api.fetchManifest(manifestUrl);

      if (response.error) {
        this.setState({
          error: 'There was an error fetching the manifest',
          manifest: null
        });
        return;
      }
      
      this.setState({
        manifest: response,
        manifestUrl
      });
    };
    request();
  }

  getManifestUrl() {
    const el = document.getElementById('avln-iiif-player-root');
    if (!el) {
      return '';
    }
    return el.getAttribute('data-manifest-url');
  }

  render() {
    const { manifest, error } = this.state;

    if (manifest) {
      return (
        <section>
          <MediaElementContainer manifest={manifest} />
          <StructuredNav manifest={manifest} />
        </section>
      );
    }
    if (error) {
      return <ErrorMessage message={error} />;
    }
    return <p>...Loading</p>;
  }
}

export default App;
