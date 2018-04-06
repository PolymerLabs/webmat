import * as stream from 'stream';

export class ReadableStreamCache {
  readonly streamCached: Promise<string>;

  constructor(stream: stream.Readable) {
    this.streamCached = this.readStream(stream);
  }

  private readStream(stream: stream.Readable): Promise<string> {
    let resolveStreamCached: (value: string) => void;
    const streamCached: Promise<string> =
        new Promise(res => {resolveStreamCached = res});
    let streamOutput = '';

    stream.on('data', function(data) {
      streamOutput += data.toString();
    });

    stream.on('end', () => {
      resolveStreamCached(streamOutput);
    });

    return streamCached;
  };
}