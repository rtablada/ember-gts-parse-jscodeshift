import jscodeshift from 'jscodeshift';
import { GlimmerPlugin } from './def/glimmer-v1.js';

const builders = jscodeshift.types.use(GlimmerPlugin);

export function cloneNode(node, typeReplacement) {
  const clone = builders.glimmerNode();

  Object.keys(node).forEach((key) => {
    if (key === 'type' && typeReplacement) {
      clone.type = typeReplacement(node);
    } else if (key === 'original' || key === '_original') {
      clone['original'] = node[key];
      clone['_original'] = node[key];
    } else {
      clone[key] = node[key];
    }
  });

  return clone;
}
