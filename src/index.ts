import { EmberParser } from './parser.ts';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { join as pathJoin } from 'node:path';
import j from 'jscodeshift';

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

debugger;
