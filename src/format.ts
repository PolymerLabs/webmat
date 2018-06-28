/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import * as clangFormat from 'clang-format';
import * as dom5 from 'dom5';
import * as fastGlob from 'fast-glob';
import * as fs from 'fs';
import * as parse5 from 'parse5';
import * as path from 'path';
import * as stream from 'stream';
import {promisify} from 'util';

import {ClangFormatStyle} from '../custom_typings/clang-format-style';

import {FormatConfig} from './cli';
import {ReadableStreamCache} from './util';
import {writeTofile} from './write-output';

const readFile = promisify(fs.readFile);

interface HtmlContentChunk {
  streamReader: ReadableStreamCache;
  node: dom5.Node;
}
export interface HtmlFileContent {
  filePath: string;
  contents: HtmlContentChunk[];
  dom: string;
}

/**
 * Runs the files through the formatter, and overwrites them.
 *
 * @param filePaths Paths of the files to be formatted.
 */
export async function formatFiles(
    filePaths: string[], style: ClangFormatStyle): Promise<void> {
  const htmlFiles = filePaths.filter((file) => path.extname(file) === '.html');
  const nonHtmlFiles =
      filePaths.filter((file) => path.extname(file) !== '.html');
  const formatPromises: Promise<void>[] = [];

  for (const path of htmlFiles) {
    const htmlFormatted =
        formatHTMLFiles(path, style).then(function(formattedContent) {
          return writeTofile(formattedContent);
        });

    formatPromises.push(htmlFormatted);
  }

  for (const path of nonHtmlFiles) {
    formatInPlace(path, style);
  }

  // wait for all HTML files to be formatted as well
  await Promise.all(formatPromises);
}

/**
 * Runs the contents of the script tags in an HTML document through the
 * formatter and returns their unindented, formatted contents.
 *
 * @param filePath Path of HTML file.
 */
async function formatHTMLFiles(
    filePath: string, style: ClangFormatStyle): Promise<HtmlFileContent> {
  const scriptContent = await getInlineScriptContents(filePath);
  const formattedContent: HtmlFileContent = {
    filePath: filePath,
    contents: [],
    dom: scriptContent.dom
  };

  for (const contentChunk of scriptContent.contents) {
    const cfChildProcess = clangFormat.spawnClangFormat(
        ['-assume-filename=.js', `-style=${JSON.stringify(style)}`],
        function() {},
        ['pipe', 'pipe', process.stderr]);

    const cachedStdout = new ReadableStreamCache(cfChildProcess.stdout);
    const readable = new stream.PassThrough();

    readable.pipe(cfChildProcess.stdin);
    readable.push(await contentChunk.streamReader.streamCached);
    readable.push(null);

    const formattedChunk: HtmlContentChunk = {
      node: contentChunk.node,
      streamReader: cachedStdout
    };

    formattedContent.contents.push(formattedChunk);
  }

  return formattedContent;
}

/**
 * Runs the given file through the formatter which overwrites the file's
 * contents.
 *
 * @param filePath Path of file to be formatted in place.
 */
function formatInPlace(filePath: string, style: ClangFormatStyle): void {
  clangFormat.spawnClangFormat(
      [filePath, '-i', `-style=${JSON.stringify(style)}`],
      function() {},
      ['ignore', 'pipe', process.stderr]);
}

/**
 * Gathers all the contents of an HTML file's inline scripts.
 *
 * @param filePath Path of the flile to be searched.
 */
async function getInlineScriptContents(filePath: string):
    Promise<HtmlFileContent> {
  const htmlContent = await readFile(filePath, 'utf-8');
  const dom = parse5.parse(htmlContent, {locationInfo: true});
  const matcher = dom5.predicates.AND(
      dom5.predicates.hasTagName('script'),
      dom5.predicates.OR(
          dom5.predicates.NOT(dom5.predicates.hasAttr('type')),
          dom5.predicates.hasAttrValue('type', 'text/javascript'),
          dom5.predicates.hasAttrValue('type', 'application/javascript'),
          dom5.predicates.hasAttrValue('type', 'module')));
  const scriptNodes = dom5.queryAll(dom, matcher);
  const contentChunks:
      HtmlFileContent = {filePath: filePath, contents: [], dom: htmlContent};

  for (const scriptNode of scriptNodes) {
    const content = dom5.getTextContent(scriptNode);
    const contentStream = new stream.PassThrough();
    const cachedContentStream = new ReadableStreamCache(contentStream);

    contentStream.push(content);
    contentStream.push(null);

    const contentChunk: HtmlContentChunk = {
      node: scriptNode,
      streamReader: cachedContentStream
    };

    contentChunks.contents.push(contentChunk);
  }

  return contentChunks;
}

/**
 * Executes the globs inside of a given format config.
 *
 * @param config Config file to be executed.
 */
export function getFilesToFormat(config: FormatConfig): string[] {
  const filesToFormat =
      fastGlob.sync<string>(config.include, {ignore: config.exclude});

  return filesToFormat;
}