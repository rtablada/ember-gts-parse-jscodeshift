import { diff } from 'jest-diff';
import { EmberParser } from './parser.ts';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { join as pathJoin } from 'node:path';
import j from 'jscodeshift';
import { Type, builtInTypes } from 'ast-types';
import { defGlimmerAst } from './def/glimmer-v1.ts';
import type { ASTv1 } from '@glimmer/syntax';

defGlimmerAst();

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

// Now you can use __dirname as you would in CommonJS
const RAW_JS_SRC = await readFile(FIXTURE_FILES.RAW_JS, 'utf-8');

const parsedRawJS = j.withParser(emberParser)(RAW_JS_SRC);

const RAW_GJS_SRC = await readFile(FIXTURE_FILES.GJS_COMPONENT, 'utf-8');

const parsedRawGJS = j.withParser(emberParser)(RAW_GJS_SRC);

const results = parsedRawGJS
  .find('GlimmerTextNode')
  .forEach((element: { node: ASTv1.TextNode }) => {
    if (element.node.chars.trim()) {
      element.node.chars = element.node.chars.toUpperCase();
    }
  });

console.log(
  diff(
    RAW_GJS_SRC,
    results.toSource({
      parser: emberParser,
    }),
  ),
);

// await writeFile(FIXTURE_FILES.GJS_COMPONENT, parsedRawGJS.toSource());
