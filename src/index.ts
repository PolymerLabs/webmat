import * as commandLineArgs from 'command-line-args';
import * as fs from 'fs';
import {promisify} from 'util';

const optionDefinitions: commandLineArgs.OptionDefinition[] =
    [{name: 'include', type: Array}, {name: 'exclude', type: Array}];

export interface CliOptions { include?: string[], exclude?: string[] }

const options = commandLineArgs(optionDefinitions) as CliOptions;

async function run() {
  const readFile = promisify(fs.readFile);
  console.log(await readFile('.format-ignore'));
}