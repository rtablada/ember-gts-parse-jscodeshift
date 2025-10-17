import type { GlimmerNamedTypes } from './def/glimmer-v1';

export const g: GlimmerNamedTypes;
export { EmberParser } from './parser';
export { print } from './printer';
import type * as j from 'jscodeshift';

export function glimmerCodeshift(
  codeshift: j.JSCodeshift,
  parser?: j.Parser,
): j.JSCodeshift & GlimmerNamedTypes;
