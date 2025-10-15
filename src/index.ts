import { use } from 'ast-types';
import { GlimmerPlugin } from './def/glimmer-v1.ts';

export const g = use(GlimmerPlugin);
export { EmberParser } from './parser.ts';
export { print } from './printer.ts';
