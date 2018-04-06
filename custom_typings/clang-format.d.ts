/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

declare module 'clang-format' {
import {ChildProcess} from 'child_process';
import * as stream from 'stream';
import * as vinyl from 'vinyl';

  type ClangFormatStyle = 'llvm'|'google'|'chromium'|'mozilla'|'webkit'|'file';

  namespace ClangFormat {
    function spawnClangFormat(args: string[], done: () => void, stdio: any):
        ChildProcess;
  }
  function ClangFormat(
      file: vinyl,
      enc: string,
      style: ClangFormatStyle,
      done: (err?: any) => void): stream.Readable;

  export = ClangFormat;
}