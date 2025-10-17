import { GlimmerPlugin } from './def/glimmer-v1.js';

// export const g = use(GlimmerPlugin);
export { GlimmerPlugin } from './def/glimmer-v1.js';
export { EmberParser } from './parser.js';
export { print } from './printer.js';
import { importModule } from 'local-pkg';
import { EmberParser } from './parser.js';

export const setupAstTypes = async () => {
  const astTypes = await importModule('ast-types');

  return astTypes.use(GlimmerPlugin);
};

/**
 * @import j from 'jscodeshift';
 * @import { GlimmerNamedTypes } from './def/glimmer-v1';
 * @param {j.JSCodeshift} codeshift
 * @param {j.Parser} nonTemplateParser
 * @returns j.JSCodeshift & GlimmerNamedTypes
 */
export function glimmerCodeshift(codeshift, nonTemplateParser) {
  const parser = new EmberParser(nonTemplateParser);

  const glimmerNamedTypes = codeshift.types.use(GlimmerPlugin);
  const forkedCodeshiftCore = codeshift.withParser(parser);

  // Makes the glimmer named types available directly on the codeshift instance
  Object.assign(forkedCodeshiftCore, glimmerNamedTypes);

  return forkedCodeshiftCore;
}
