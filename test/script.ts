import { readFile } from 'node:fs/promises';
import { dirname, join as pathJoin } from 'node:path';
import { fileURLToPath } from 'node:url';
import { diff } from 'jest-diff';
import { EmberParser, print } from '../src/index.js';

import j from 'jscodeshift';
import { glimmerCodeshift } from '../src/index.js';

// Get current file path and directory (ES module equivalent of __filename and __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const emberParser = new EmberParser();
const fixtureDirPath = pathJoin(__dirname, '../test/fixtures');

const FIXTURE_FILES = {
  RAW_JS: pathJoin(fixtureDirPath, 'raw-js.js'),
  RAW_TS: pathJoin(fixtureDirPath, 'raw-ts.ts'),
  GJS_COMPONENT: pathJoin(fixtureDirPath, 'component.gjs'),
  GTS_COMPONENT: pathJoin(fixtureDirPath, 'component.gts'),
};

const g = glimmerCodeshift(j);

// Now you can use __dirname as you would in CommonJS
const RAW_JS_SRC = await readFile(FIXTURE_FILES.RAW_JS, 'utf-8');

const parsedRawJS = g.withParser(emberParser)(RAW_JS_SRC);

const RAW_GJS_SRC = await readFile(FIXTURE_FILES.GJS_COMPONENT, 'utf-8');

const parsedRawGJS = g.withParser(emberParser)(RAW_GJS_SRC);

parsedRawGJS.find(g.StringLiteral).forEach((element) => {
  if (element.node.value.trim()) {
    element.node.value = element.node.value.toUpperCase();
  }
});

parsedRawGJS.find(g.GlimmerTextNode).forEach((element) => {
  if (element.node.chars.trim())
    element.node.chars = Array.from(element.node.chars).reverse().join('');
});

const ast = parsedRawGJS.getAST()[0];

console.log(diff(RAW_GJS_SRC, print(parsedRawGJS)));
