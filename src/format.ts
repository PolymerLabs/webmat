import * as clangFormat from 'clang-format';
import * as dom5 from 'dom5';
import * as fastGlob from 'fast-glob';
import * as fs from 'fs';
import * as parse5 from 'parse5';
import * as path from 'path';
import * as stream from 'stream';
import {promisify} from 'util';

import {FormatConfig} from './cli';
import {writeTofile} from './write-output';

const readFile = promisify(fs.readFile);

interface HtmlContentChunk {
  stream: stream.Readable, node: dom5.Node
}
export interface HtmlFileContent {
  filePath: string, contents: HtmlContentChunk[], dom: string
}

export async function formatFiles(filePaths: string[]): Promise<void> {
  const htmlFiles = filePaths.filter(file => path.extname(file) === '.html');
  const nonHtmlFiles = filePaths.filter(file => path.extname(file) !== '.html');
  const formatPromises: Promise<void>[] = [];

  for (const path of htmlFiles) {
    const htmlFormatted =
        formatHTMLFiles(path).then(function(formattedContent) {
          return writeTofile(formattedContent);
        });

    formatPromises.push(htmlFormatted);
  }

  for (const path of nonHtmlFiles) {
    formatInPlace(path);
  }

  // wait for all HTML files to be formatted as well
  await Promise.all(formatPromises);
};

async function formatHTMLFiles(filePath: string): Promise<HtmlFileContent> {
  const scriptContent = await getInlineScriptContents(filePath);
  const formattedContent: HtmlFileContent = {
    filePath: filePath,
    contents: [],
    dom: scriptContent.dom
  };

  for (const contentChunk of scriptContent.contents) {
    const cfChildProcess = clangFormat.spawnClangFormat(
        ['-assume-filename=.js'],
        function() {},
        ['pipe', 'pipe', process.stderr]);

    contentChunk.stream.pipe(cfChildProcess.stdin);

    const formattedChunk: HtmlContentChunk = {
      node: contentChunk.node,
      stream: cfChildProcess.stdout
    };

    formattedContent.contents.push(formattedChunk);
  }

  return formattedContent;
}

function formatInPlace(filePath: string): void {
  clangFormat.spawnClangFormat(
      [filePath, '-i'], function() {}, ['ignore', 'pipe', process.stderr]);
}

async function getInlineScriptContents(filePath: string):
    Promise<HtmlFileContent> {
  const htmlContent = await readFile(filePath, 'utf-8');
  const dom = parse5.parse(htmlContent, {locationInfo: true});
  const matcher = dom5.predicates.AND(
      dom5.predicates.hasTagName('script'),
      dom5.predicates.OR(
          dom5.predicates.NOT(dom5.predicates.hasAttr('type')),
          dom5.predicates.hasAttrValue('type', 'text/javascript'),
          dom5.predicates.hasAttrValue('type', 'application/javascript')));
  const scriptNodes = dom5.queryAll(dom, matcher);
  const contentChunks:
      HtmlFileContent = {filePath: filePath, contents: [], dom: htmlContent};

  for (const scriptNode of scriptNodes) {
    const content = dom5.getTextContent(scriptNode);
    const contentStream = new stream.Readable();


    contentStream._read = function() {};
    contentStream.push(content);
    contentStream.push(null);

    const contentChunk:
        HtmlContentChunk = {node: scriptNode, stream: contentStream};

    contentChunks.contents.push(contentChunk);
  }

  return contentChunks;
}

export function getFilesToFormat(config: FormatConfig): string[] {
  const filesToFormat =
      fastGlob.sync<string>(config.include, {ignore: config.exclude});

  return filesToFormat;
}