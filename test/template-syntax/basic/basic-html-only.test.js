import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { glimmerCodeshift } from '../../../src/index.js';
import j from 'jscodeshift';

const fixturePath = join(process.cwd(), 'test/fixtures/component.gjs');
const source = readFileSync(fixturePath, 'utf8');

describe('basic-html-only.gjs', () => {
  it('can find HBS syntax node using codeshift', () => {
    const g = glimmerCodeshift(j);
    const root = g(source);

    // Find template nodes
    const templates = root.find(g.GlimmerTemplate);

    expect(templates.length).toBeGreaterThan(0);
  });
});
