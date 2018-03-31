import * as clangFormat from 'clang-format';
import * as dom5 from 'dom5';
import * as fastGlob from 'fast-glob'
import * as fs from 'fs';
import * as parse5 from 'parse5';
import * as path from 'path';
import * as stream from 'stream';
import {promisify} from 'util';
import * as Vinyl from 'vinyl';

const readFile = promisify(fs.readFile);
const CONFIG_FILENAME = 'formatconfig.json';
const DEFAULT_CONFIG_FILENAME =
    path.join(__dirname, '..', 'default_config.json');

interface FormatConfig {
  include: string[], exclude: string[], ignoreDefaults: boolean
}

interface ParsedConfig {
  include?: string[], exclude?: string[], ignoreDefaults?: boolean
}

interface ContentChunk {
  stream: stream.Readable
}

interface HtmlContentChunk extends ContentChunk {
  node: dom5.Node
}

interface FileContent {
  filePath: string, contents: (ContentChunk|HtmlContentChunk)[], isHtml: Boolean
}

interface HtmlFileContent extends FileContent {
  contents: HtmlContentChunk[], isHtml: true
}

interface NonHtmlFileContent extends FileContent {
  contents: ContentChunk[], isHtml: false
}

export async function run() {
  const [defaultConfig, userConfig] = await Promise.all(
      [readConfigFile(DEFAULT_CONFIG_FILENAME), readConfigFile()]);

  const activeConfig = resolveConfigs(defaultConfig, userConfig);
  const filesToFormat = await getFilesToFormat(activeConfig);
  formatFiles(filesToFormat);
}

async function formatFiles(filePaths: string[]): Promise<void> {
  const htmlFiles = filePaths.filter(file => path.extname(file) === '.html');
  const nonHtmlFiles = filePaths.filter(file => path.extname(file) !== '.html');
  const htmlFormatPromises: Promise<void>[] = [];

  for (const path of htmlFiles) {
    const htmlFormatted =
        formatHTMLFiles(path).then(function(formattedContent) {
          writeTofile(formattedContent);
        });

    htmlFormatPromises.push(htmlFormatted);
  }

  for (const path of nonHtmlFiles) {
    const formattedContent = formatNonHTMLFiles(path);
    writeTofile(formattedContent);
  }

  // wait for all HTML files to be formatted as well
  await Promise.all(htmlFormatPromises);
};

function writeTofile(formattedContent: (HtmlFileContent|NonHtmlFileContent)):
    void {
  if (formattedContent.isHtml) {
  } else {
  }
}

async function formatHTMLFiles(filePath: string): Promise<HtmlFileContent> {
  const scriptContent = await getInlineScriptContents(filePath);
  const formattedContent:
      HtmlFileContent = {filePath: filePath, contents: [], isHtml: true};

  for (const contentChunk of scriptContent.contents) {
    const cfChildProcess = clangFormat.spawnClangFormat(
        [], function() {}, ['pipe', 'pipe', process.stderr]);

    contentChunk.stream.pipe(cfChildProcess.stdin);

    const formattedChunk: HtmlContentChunk = {
      node: contentChunk.node,
      stream: cfChildProcess.stdout
    };

    formattedContent.contents.push(formattedChunk);
  }

  return formattedContent;
}

function formatNonHTMLFiles(filePath: string): NonHtmlFileContent {
  const file = new Vinyl({path: filePath});
  const stream = clangFormat(file, 'utf-8', 'file', function() {});
  const contentChunk: ContentChunk = {stream: stream};
  const formattedContent: NonHtmlFileContent = {
    filePath: filePath,
    contents: [contentChunk],
    isHtml: false
  };

  return formattedContent;
}

async function getInlineScriptContents(filePath: string):
    Promise<HtmlFileContent> {
  const htmlContent = await readFile(filePath, 'utf-8');
  const dom = parse5.parse(htmlContent);
  const scriptNodes = dom5.queryAll(dom, dom5.predicates.hasTagName('script'));
  const contentChunks:
      HtmlFileContent = {filePath: filePath, contents: [], isHtml: true};

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

function resolveConfigs(
    defaultConfig: FormatConfig|null,
    userConfig: FormatConfig|null): FormatConfig {
  let activeConfig: FormatConfig|null = null;

  if (userConfig && userConfig.ignoreDefaults) {
    return userConfig;
  }

  if (defaultConfig) {
    activeConfig = defaultConfig;

    if (userConfig) {
      activeConfig.include = activeConfig.include.concat(userConfig.include);
      activeConfig.exclude = activeConfig.exclude.concat(userConfig.exclude);
    }
  }

  if (!activeConfig) {
    throw new Error(`Default config file could not be found at ${
        DEFAULT_CONFIG_FILENAME}.`);
  }

  return activeConfig;
}

async function readConfigFile(path?: string): Promise<FormatConfig|null> {
  const configFilepath = path || CONFIG_FILENAME;

  let configContents: string|null;

  try {
    configContents = await readFile(configFilepath, 'utf8');
  } catch (e) {
    configContents = null;
  }

  let formatConfig:
      FormatConfig = {include: [], exclude: [], ignoreDefaults: false};

  if (configContents) {
    let parsedContents: ParsedConfig;

    try {
      parsedContents = JSON.parse(configContents) as ParsedConfig;
    } catch (e) {
      throw new Error(
          `${CONFIG_FILENAME} is not valid JSON.` +
          '\n' + e);
    }

    if (parsedContents) {
      formatConfig.include = parsedContents.include || [];
      formatConfig.exclude = parsedContents.exclude || [];
      formatConfig.ignoreDefaults = parsedContents.ignoreDefaults || false;
    }

    return formatConfig;
  }

  return null;
}

function getFilesToFormat(config: FormatConfig): string[] {
  const filesToFormat =
      fastGlob.sync<string>(config.include, {ignore: config.exclude});

  return filesToFormat;
}