import React, { Component } from 'react';
import MediaElementContainer from './containers/MediaElementContainer';
import StructuredNavigation from './components/StructuredNavigation';

class App extends Component {
  state = {
    manifestUrl: ''
  };

  componentDidMount() {
    this.getManifestUrl();
  }

  getManifestUrl() {
    const el = document.getElementById('avln-iif-player-root');
    const manifestUrl = el.getAttribute('data-manifest-url');
    this.setState({ manifestUrl });
  }

  renderOutput() {
    return this.state.manifestUrl === '' ? (
      <p>You must declare a manifest url attribute on mounting element</p>
    ) : (
      <section>
        <MediaElementContainer manifestUrl={this.state.manifestUrl} />
        <StructuredNavigation />
      </section>
    );
  }

  render() {
    const markup = this.renderOutput();
    return <div>{markup}</div>;
  }
}

export default App;
