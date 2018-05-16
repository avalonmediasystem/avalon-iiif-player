import React, {Component} from 'react';
import MediaElement from '../components/MediaElement';

class MediaElementContainer extends Component {
  render() {
    const sources = [
      {
        src: 'http://www.streambox.fr/playlists/test_001/stream.m3u8',
        type: 'application/x-mpegURL'
      },
      {
        src: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
        type: 'video/mp4'
      },
      {
        src: 'rtmp://firehose.cul.columbia.edu:1935/vod/mp4:sample.mp4',
        type: 'video/rtmp'
      }
    ];
    const options = {};

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
    )
  }
}

export default MediaElementContainer;
