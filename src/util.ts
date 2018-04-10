/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import * as stream from 'stream';

/**
 * Caches the output of a stream.Readable in a Promise string.
 */
export class ReadableStreamCache {
  /**
   * Promise that resolves with the contents of the given stream
   */
  readonly streamCached: Promise<string>;

  /**
   * @param stream Stream to be cached.
   */
  constructor(stream: stream.Readable) {
    this.streamCached = this.readStream(stream);
  }

  /**
   * Reads a stream and returns a promise that resolves with its contents when
   * stream ends.
   *
   * @param stream Stream to be cached
   */
  private readStream(stream: stream.Readable): Promise<string> {
    let resolveStreamCached: (value: string) => void;
    const streamCached: Promise<string> = new Promise((res) => {
      resolveStreamCached = res;
    });
    let streamOutput = '';

    stream.on('data', function(data) {
      streamOutput += data.toString();
    });

    stream.on('end', () => {
      resolveStreamCached(streamOutput);
    });

    return streamCached;
  }
}