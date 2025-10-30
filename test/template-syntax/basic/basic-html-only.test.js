import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { glimmerCodeshift, print } from '../../../src/index.js';
import j from 'jscodeshift';

const fixturePath = join(process.cwd(), 'test/fixtures/basic-html-only.gjs');
const source = readFileSync(fixturePath, 'utf-8');

describe('basic-html-only.gjs', () => {
  it('can find HBS syntax node using codeshift', () => {
    const g = glimmerCodeshift(j);
    const root = g(source);

    // Find template nodes
    const templates = root.find(g.GlimmerTemplate);

    expect(templates.length).toBeGreaterThan(0);
  });

  it('can print without loosing AST tree', () => {
    const g = glimmerCodeshift(j);
    const root = g(source);

    const result = print(root);

    // Find template nodes with partial string match
    const textNode = root.find(g.GlimmerElementNode);

    const result2 = print(root);

    expect(result).toBe(result2);
    expect(textNode.length).toBeGreaterThan(0);
  });

  it('can recursively find HBS syntax nodes', () => {
    const g = glimmerCodeshift(j);
    const root = g(source);

    // Find template nodes
    const elements = root.find(g.GlimmerElementNode);

    const firstElement = elements.nodes()[0];
    const textNode = g(firstElement).find(g.GlimmerTextNode);
    expect(textNode.length).toBeGreaterThan(0);
  });
});
