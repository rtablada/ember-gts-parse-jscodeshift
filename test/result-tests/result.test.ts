import { writeFileSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import j from 'jscodeshift';
import { glimmerCodeshift, print } from '../../src/index.js';
import emberRecast from 'ember-template-recast';

const { builders } = emberRecast;

function getFileTrimmed(filePath: string) {
  return readFileSync(filePath, 'utf-8').trim();
}

function fixtures(filename: string) {
  const fixturesDir = path.join(__dirname, 'fixtures');
  const inputPath = path.join(fixturesDir, 'input', filename);
  const outputPath = path.join(fixturesDir, 'output', filename);
  const outputNoChangesPath = path.join(
    fixturesDir,
    'output-no-changes',
    filename,
  );

  return {
    get inputFixture() {
      return getFileTrimmed(inputPath);
    },
    get outputFixture() {
      return getFileTrimmed(outputPath);
    },
    get outputNoChangesFixture() {
      return getFileTrimmed(outputNoChangesPath);
    },
  };
}

const g = glimmerCodeshift(j);

describe('write basic', () => {
  test('template only', async () => {
    const { inputFixture, outputNoChangesFixture } =
      fixtures('template-only.gjs');

    const root = g(inputFixture);
    const result = print(root);

    expect(result).toBeTruthy();
    expect(result).toBe(outputNoChangesFixture);
  });

  test('nested component', async () => {
    const { inputFixture, outputNoChangesFixture } = fixtures(
      'nested-component.gjs',
    );

    const root = g(inputFixture);

    root
      .find(g.GlimmerElementNode, {
        tag: 'span',
      })
      .forEach((textPath) => {
        const ifBlock = builders.block(
          builders.path('if'),
          [builders.path('@active')],
          builders.hash(),
          builders.template([textPath.node]),
        );

        textPath.replace(ifBlock);
      });

    const result = print(root);

    writeFileSync('/tmp/output.gjs', result ?? ''); // For debugging purposes

    expect(result).toBeTruthy();
    expect(result).toBe(outputFixture);
  });
});
