/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {DEFAULT_CONFIG_FILENAME, readConfigFile, resolveConfigs} from './cli';
import {formatFiles, getFilesToFormat} from './format';

export async function run() {
  const [defaultConfig, userConfig] = await Promise.all(
      [readConfigFile(DEFAULT_CONFIG_FILENAME), readConfigFile()]);

  const activeConfig = resolveConfigs(defaultConfig, userConfig);
  const filesToFormat = await getFilesToFormat(activeConfig);
  await formatFiles(filesToFormat, activeConfig.style);
}
