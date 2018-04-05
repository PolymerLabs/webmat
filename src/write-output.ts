import * as dom5 from 'dom5'
import * as fs from 'fs';
import * as parse5 from 'parse5'

import {HtmlFileContent} from './format';

const SINGLE_TAB = '  ';

export async function writeTofile(formattedContent: (HtmlFileContent)):
    Promise<void> {
  const writableStream = fs.createWriteStream(formattedContent.filePath);
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

  writableStream.write(parse5.serialize(formattedContent.dom));
  writableStream.end();
}