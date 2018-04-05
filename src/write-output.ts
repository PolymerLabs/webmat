import * as dom5 from 'dom5'
import * as fs from 'fs';
import * as parse5 from 'parse5'

import {HtmlFileContent} from './format';

const SINGLE_TAB = '  ';

export async function writeTofile(formattedContent: (HtmlFileContent)):
    Promise<void> {
  const writableStream = fs.createWriteStream(formattedContent.filePath);
  await updateAst(formattedContent);
  const formattedDom = generateDom(formattedContent);

  writableStream.write(formattedDom);
  writableStream.end();
}

async function updateAst(formattedContent: HtmlFileContent): Promise<void> {
  for (const chunk of formattedContent.contents) {
    let stringifiedContents = '';
    const nodeLocation = chunk.node.__location as parse5.LocationInfo;
    let numTabs = 1;

    if (nodeLocation.col) {
      numTabs = Math.floor(nodeLocation.col / SINGLE_TAB.length) + 1;
    }

    const tabbedString = SINGLE_TAB.repeat(numTabs);

    chunk.stream.on('data', function(data) {
      let splitData = data.toString().split('\n');

      const tabbedData = splitData.join(`\n${tabbedString}`);
      stringifiedContents += tabbedData;
    });

    await new Promise(resolve => {
      chunk.stream.on('end', () => {
        resolve();
      });
    });

    let trimmedContents = stringifiedContents.trim();

    // deal with tabs at the beginning and end if the script is not empty
    if (stringifiedContents) {
      stringifiedContents = `\n${tabbedString}${trimmedContents}` +
          `\n${SINGLE_TAB.repeat(numTabs - 1)}`;
    }

    dom5.setTextContent(chunk.node, stringifiedContents);
  }
}

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