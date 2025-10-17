import { use } from 'ast-types';
import { GlimmerPlugin } from './def/glimmer-v1.js';

export const g = use(GlimmerPlugin);
export { EmberParser } from './parser.js';
export { print } from './printer.js';
