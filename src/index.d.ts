import type { GlimmerNamedTypes } from './def/glimmer-v1.js';
export { EmberParser } from './parser.d.ts';
export { print } from './printer.js';
import type * as j from 'jscodeshift';

export type { GlimmerNamedTypes } from './def/glimmer-v1.js';

export function glimmerCodeshift(
  codeshift: j.JSCodeshift,
  parser?: j.Parser,
): j.JSCodeshift & GlimmerNamedTypes;
