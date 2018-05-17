import React, { Component } from 'react';
import MediaElementContainer from './containers/MediaElementContainer';
import StructuredNavigation from './components/StructuredNavigation';

class App extends Component {
  constructor(props) {
    super(props);
    this.getManifestUrl();
  }

  getManifestUrl() {
    const el = document.getElementById('avln-iif-player-root');
    const manifestUrl = el.getAttribute('data-manifest-url');
    console.log('manifestUrl', manifestUrl);
  }

  render() {
    return (
      <section>
        <MediaElementContainer />
        <StructuredNavigation />
      </section>
    );
  }
}

export default App;
