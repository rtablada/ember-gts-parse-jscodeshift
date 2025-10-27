import jscodeshift from 'jscodeshift';
import { GlimmerPlugin } from './def/glimmer-v1';

const builders = jscodeshift.types.use(GlimmerPlugin);

export function cloneNode(node, typeReplacement) {
  const clone = builders.glimmerNode();

  Object.keys(node).forEach((key) => {
    if (key === 'type' && typeReplacement) {
      clone.type = typeReplacement(node);
    } else {
      clone[key] = node[key];
    }
  });

  return clone;
}
