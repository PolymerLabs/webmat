# 🕸💎 webmat 💎🕸
> web + format = webmat. It formats your web projects!

# ⚠️ Warning: Still under early development ⚠️
Webmat is still under development and you may run into issues. Issues may range
from a lot of memory usage to ruining your project. Use at your own risk for
now.

# 💡 Highlights
* 🌎 Formats multiple files at once using an include / exclude glob api
* 🔭 Searches through HTML files and formats only the script tags with contents
* 🐀 Vaugely sounds like the word "wombat"

webmat is a formatter will run mulitple files in your project through a
formatter (currently only clang-format). It will gather all the js, ts, and html
files and format them in place. The trick of this pony is that it will format
your HTML files by gathering their script tags, formatting them, and replacing
only your script tags without touching the rest of your DOM.

# Usage
Install webmat from npm:
```bash
npm install -g webmat
```

## Simple usage
webmat will select files to format based off of a default set of globs defined
in [`default_config.json`](https://github.com/PolymerLabs/webmat/blob/master/default_config.json).
If those defaults are fine, then you can simply run:
```bash
webmat
```

## File Selection
If you would like to include or exclude files not included by the default
config, then you can specify a set of globs in a `formatconfig.json` file in the
directory that you are running webmat. An example:

```json
{
  "include": [ "protos/*.proto", "wasm/**/*.cpp" ],
  "exclude": [ "generated_files/**/*", "formatter-mangles-my-code.html" ]
}
```

## Clang-format styles
You can also override our clang-format styling using `formatconfig.json`'s `style` property. It should follow clang-format's [style options](https://clang.llvm.org/docs/ClangFormatStyleOptions.html).
```json
{
  "style": {
    "KeepEmptyLinesAtTheStartOfBlocks": true,
    "ReflowComments": true,
    "MaxEmptyLinesToKeep": 5
  }
}
```

webmat will simply append your custom config to the default config and then
select files using [fast-glob](https://github.com/mrmlnc/fast-glob)'s set of
selection rules. fast-glob's reading algorithm will run the excludes first, so
if you want to format a file that is in the default config's exclude list, then
you will have to add the `ignoreDefaultGlobs` flag to completely ignore the
default include / exclude configurations.

# API
I haven't totally made this user friendly yet, please come back later!

# Options
There are currently no command-line flags only `formatconfig.json`.

## formatconfig.json
Types:
```ts
{
  include: string[],
  exclude: string[],
  ignoreDefaultGlobs: boolean,
  style: {[string]: any}
}
```

Descriptions:

| property | description |
| -------- | ----------- |
| include | List of globs to include in format selection |
| exclude | List of globs to exclude from format selection |
| ignoreDefaultGlobs  | Completely ignores default include / exclude globs |
| style  | JSON [clang-format style options](https://clang.llvm.org/docs/ClangFormatStyleOptions.html) config |