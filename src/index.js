import { GlimmerPlugin } from './def/glimmer-v1.js';
export { print } from './printer.js';
import { EmberParser } from './parser.js';

export { builders } from 'ember-template-recast';

export function glimmerCodeshift(codeshift, nonTemplateParser) {
  const parser = new EmberParser(nonTemplateParser);

  const glimmerNamedTypes = codeshift.types.use(GlimmerPlugin);
  const forkedCodeshiftCore = codeshift.withParser(parser);

  // Makes the glimmer named types available directly on the codeshift instance
  Object.assign(forkedCodeshiftCore, glimmerNamedTypes);

  return forkedCodeshiftCore;
}
