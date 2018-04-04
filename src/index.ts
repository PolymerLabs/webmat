import {readConfigFile, resolveConfigs, DEFAULT_CONFIG_FILENAME} from './cli';
import {getFilesToFormat, formatFiles} from './format';

export async function run() {
  const [defaultConfig, userConfig] = await Promise.all(
      [readConfigFile(DEFAULT_CONFIG_FILENAME), readConfigFile()]);

  const activeConfig = resolveConfigs(defaultConfig, userConfig);
  const filesToFormat = await getFilesToFormat(activeConfig);
  formatFiles(filesToFormat);
}
