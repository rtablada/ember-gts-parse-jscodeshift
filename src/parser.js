import getParser from 'jscodeshift/dist/getParser.js';
import { walk } from 'estree-walker';
import { Transformer, coordinatesOf } from 'content-tag-utils';
import { parse as templateRecastParse } from 'ember-template-recast';

/**
 * @implements {jimport('jscodeshift').Parser}
 */
export class EmberParser {
  /**
   * @type {import('jscodeshift').Parser}
   */
  #nonTemplateParser;

  /**
   *
   * @param {string | import('jscodeshift').Parser} nonTemplateParser
   */
  constructor(nonTemplateParser = getParser('ts')) {
    if (typeof nonTemplateParser === 'string') {
      this.#nonTemplateParser = getParser(nonTemplateParser);
    } else {
      this.#nonTemplateParser = nonTemplateParser;
    }
  }

  /**
   *
   * @param {string} source
   * @param {unknown} options
   * @returns import('ast-types/lib/types').ASTNode
   */
  parse(source, options) {
    const t = new Transformer(source);

    const updatedSource = t.toString({ placeholders: true });

    /**
     * @type import('estree').Node
     */
    const contents = this.#nonTemplateParser.parse(updatedSource, options);

    for (const templateSection of t.parseResults) {
      const coordinates = coordinatesOf(source, templateSection);
      /**
       * @type import('estree').Node
       */
      const tree = templateRecastParse(templateSection.contents);

      walk(tree, {
        enter(node) {
          const x = { ...node };
          x.type = `Glimmer${node.type}`;

          this.replace(x);
        },
      });

      if (tree.type === 'Template') {
        tree.type = 'GlimmerTemplate';
      }

      walk(contents, {
        enter(node) {
          if (
            node.loc?.start.line === coordinates.line &&
            !node.type.startsWith('Glimmer')
          ) {
            this.replace(tree);
          }
        },
      });
    }

    return contents;
  }
}
