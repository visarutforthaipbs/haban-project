#!/bin/bash

# This script creates JavaScript versions of all TypeScript files in the src directory

# Find all .ts files in the src directory
find src -name "*.ts" | while read -r tsfile; do
  # Create the corresponding .js file path
  jsfile="${tsfile%.ts}.js"
  
  echo "Converting $tsfile to $jsfile"
  
  # Create a JavaScript version of the TypeScript file
  # by replacing TypeScript-specific syntax with JavaScript
  sed -E \
    -e 's/import ([^{]*) from "(.*?)"/const \1 = require("\2")/' \
    -e 's/import \{ (.*?) \} from "(.*?)"/const { \1 } = require("\2")/' \
    -e 's/export default/module.exports =/' \
    -e 's/export interface .*//g' \
    -e 's/export type .*//g' \
    -e 's/interface .*//g' \
    -e 's/type .*//g' \
    -e 's/: [A-Za-z<>\[\]|,]+//g' \
    -e 's/: [A-Za-z]+\[[A-Za-z]+\]//g' \
    -e 's/: [A-Za-z]+//g' \
    -e 's/as [A-Za-z]+//g' \
    "$tsfile" > "$jsfile"
done

echo "Conversion completed. JS files have been created alongside TS files." 