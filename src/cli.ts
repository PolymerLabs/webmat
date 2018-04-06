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
 * Resolves a user config against the default config. If the user config has the
 * `ignoreDefaults` flag, then it returns the user config. If not, then it
 * merges the user config with the default config.
 *
 * @param defaultConfig default_config.json parsed file contents.
 * @param userConfig user config (formatconfig.json) parsed file contents.
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
 * Reads and parses a format config file.
 *
 * @param path path of the file to be parsed (defaults to formatconfig.json).
 */
export async function readConfigFile(path: string = CONFIG_FILENAME):
    Promise<FormatConfig|null> {
  let configContents: string|null;

  try {
    configContents = await readFile(path, 'utf8');
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