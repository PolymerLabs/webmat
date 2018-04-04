import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';

const readFile = promisify(fs.readFile);
const CONFIG_FILENAME = 'formatconfig.json';
export const DEFAULT_CONFIG_FILENAME =
    path.join(__dirname, '..', 'default_config.json');

export interface FormatConfig {
  include: string[], exclude: string[], ignoreDefaults: boolean
}
interface ParsedConfig {
  include?: string[], exclude?: string[], ignoreDefaults?: boolean
}

/**
 *
 * @param defaultConfig
 * @param userConfig
 */
export function resolveConfigs(
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

/**
 *
 * @param path
 */
export async function readConfigFile(path?: string):
    Promise<FormatConfig|null> {
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