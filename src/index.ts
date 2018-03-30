import * as fastGlob from 'fast-glob'
import * as fs from 'fs';
import * as path from 'path';
import {resolve} from 'url';
import {promisify} from 'util';

const readFile = promisify(fs.readFile);
const exists = promisify(fs.exists);
const CONFIG_FILENAME = 'formatconfig.json';
const DEFAULT_CONFIG_FILENAME =
    path.join(__dirname, '..', 'default_config.json');

interface FormatConfig {
  include: string[], exclude: string[], ignoreDefaults: boolean
}

interface ParsedConfig {
  include?: string[], exclude?: string[], ignoreDefaults?: boolean
}

interface FormatFileSet {
  include: Set<string>, exclude: Set<string>
}

export async function run() {
  const [defaultConfig, userConfig] = await Promise.all(
      [readConfigFile(DEFAULT_CONFIG_FILENAME), readConfigFile()]);

  const activeConfig = resolveConfigs(defaultConfig, userConfig);
  const filesToFormat = await getFilesToFormat(activeConfig);

  console.log(filesToFormat);
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

  console.log(config.include, config.exclude)

  return filesToFormat;
}

// async function resolveGlobs(
//     include: string[], exclude: string[]): Promise<FormatFileSet> {
//   const includePromises: Promise<string[]>[] = [];
//   const excludePromises: Promise<string[]>[] = [];

//   for (const globPattern of include) {
//     includePromises.push(globbed(globPattern));
//   }

//   for (const globPattern of exclude) {
//     excludePromises.push(globbed(globPattern));
//   }

//   const [includeGlobResults, excludeGlobResults] = await Promise.all(
//       [Promise.all(includePromises), Promise.all(excludePromises)]);

//   const includeSet: Set<string> = new Set();
//   for (const globResult of includeGlobResults) {
//     for (const file of globResult) {
//       const fullPath = path.join(process.cwd(), file);
//       includeSet.add(fullPath);
//     }
//   }

//   const excludeSet: Set<string> = new Set();
//   for (const globResult of excludeGlobResults) {
//     for (const file of globResult) {
//       const fullPath = path.join(process.cwd(), file);
//       excludeSet.add(fullPath);
//     }
//   }

//   const formatFileSet:
//       FormatFileSet = {include: includeSet, exclude: excludeSet};

//   return formatFileSet;
// }

// function setSubtract<T>(originalSet: Set<T>, toDelete: Set<T>): Set<T> {
//   for (const element of toDelete) {
//     originalSet.delete(element);
//   }

//   return originalSet;
// }

// function setAdd<T>(a: Set<T>, b: Set<T>): Set<T> {
//   return new Set([...a, ...b])
// }