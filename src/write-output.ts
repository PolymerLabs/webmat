import * as dom5 from 'dom5'
import * as fs from 'fs';
import * as parse5 from 'parse5'

import {HtmlFileContent} from './format';

const SINGLE_TAB = '  ';

/**
 * Indents and writes the content to the file.
 *
 * @param formattedContent Content to be written to the file.
 */
export async function writeTofile(formattedContent: (HtmlFileContent)):
    Promise<void> {
  const writableStream = fs.createWriteStream(formattedContent.filePath);
  await updateAst(formattedContent);
  const formattedDom = generateDom(formattedContent);

  writableStream.write(formattedDom);
  writableStream.end();
}

/**
 * Tabs the given content and writes it to the AST in the content chunks
 *
 * @param formattedContent Content to be written to the AST
 */
function updateAst(formattedContent: HtmlFileContent): Promise<void[]> {
  const updatePromises: Promise<void>[] = [];

  for (const chunk of formattedContent.contents) {
    const nodeLocation = chunk.node.__location as parse5.LocationInfo;
    let numTabs = 1;

    if (nodeLocation.col) {
      numTabs = Math.floor(nodeLocation.col / SINGLE_TAB.length) + 1;
    }

    const tabbedString = SINGLE_TAB.repeat(numTabs);

    const updatePromise = chunk.streamReader.streamCached.then(data => {
      let stringifiedContents = '';
      let splitData = data.split('\n');
      const tabbedData = splitData.join(`\n${tabbedString}`);
      stringifiedContents += tabbedData;
      let trimmedContents = stringifiedContents.trim();

      // deal with tabs at the beginning and end if the script is not empty
      if (stringifiedContents) {
        stringifiedContents = `\n${tabbedString}${trimmedContents}` +
            `\n${SINGLE_TAB.repeat(numTabs - 1)}`;
      }

      dom5.setTextContent(chunk.node, stringifiedContents);
    });

    updatePromises.push(updatePromise);
  }

  return Promise.all(updatePromises);
}

/**
 * Transforms the content into a dom string with prpoper spacing around the
 * spliced inline scripts.
 *
 * @param formattedContent Content to be transformed into a dom string.
 */
function generateDom(formattedContent: HtmlFileContent): string {
  const sortedChunks = formattedContent.contents.sort((a, b) => {
    const aLine =
        (a.node.__location as parse5.ElementLocationInfo).startTag.line;
    const bLine =
        (b.node.__location as parse5.ElementLocationInfo).startTag.line;

    if (aLine > bLine) {
      return -1;
    } else if (aLine < bLine) {
      return 1;
    }

    return 0;
  });

  let splitDom = formattedContent.dom.split('\n');

  for (const chunk of sortedChunks) {
    const location = chunk.node.__location as parse5.ElementLocationInfo;
    const startTag = location.startTag;
    const endTag = location.endTag;
    const numLines = endTag.line - startTag.line + 1;
    const scriptTagWhitespace: dom5.Node = {
      attrs: [],
      nodeName: '#text',
      value: ' '.repeat(startTag.col - 1),
      __location: {} as parse5.ElementLocationInfo
    };
    const fakeNode: dom5.Node = {
      attrs: [],
      childNodes: [scriptTagWhitespace, chunk.node],
      nodeName: 'div',
      __location: {} as parse5.ElementLocationInfo
    };
    const formattedChunk = parse5.serialize(fakeNode);

    splitDom.splice(startTag.line - 1, numLines, formattedChunk);
  }

  return splitDom.join('\n');
}