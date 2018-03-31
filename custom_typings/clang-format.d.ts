declare module 'clang-format' {
import {ChildProcess, SpawnOptions} from 'child_process';
import * as stream from 'stream';
import * as vinyl from 'vinyl';

  type ClangFormatStyle = 'llvm'|'google'|'chromium'|'mozilla'|'webkit'|'file';



  namespace ClangFormat {
    function spawnClangFormat(args: string[], done: () => void, stdio: any):
        ChildProcess;
  }
  function ClangFormat(
      file: vinyl, enc: string, style: ClangFormatStyle, done: () => void):
      stream.Readable;

  export = ClangFormat;
}