import {DEFAULT_CONFIG_FILENAME, readConfigFile, resolveConfigs} from './cli';
import {formatFiles, getFilesToFormat} from './format';

export async function run() {
  const [defaultConfig, userConfig] = await Promise.all(
      [readConfigFile(DEFAULT_CONFIG_FILENAME), readConfigFile()]);

  const activeConfig = resolveConfigs(defaultConfig, userConfig);
  const filesToFormat = await getFilesToFormat(activeConfig);
  await formatFiles(filesToFormat);
}
