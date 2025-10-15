import type j from 'jscodeshift';
import getParser from 'jscodeshift/dist/getParser.js';
import type { ASTNode } from 'ast-types/lib/types';
import { walk } from 'estree-walker';
import type { Node } from 'estree';
import { Transformer, coordinatesOf } from 'content-tag-utils';
import { parse as templateRecastParse } from 'ember-template-recast';

export class EmberParser implements j.Parser {
  #nonTemplateParser: j.Parser;
  constructor(nonTemplateParser: string | j.Parser = getParser('ts')) {
    if (typeof nonTemplateParser === 'string') {
      this.#nonTemplateParser = getParser(nonTemplateParser);
    } else {
      this.#nonTemplateParser = nonTemplateParser;
    }
  }

  parse(source: string, options?: unknown): ASTNode {
    const t = new Transformer(source);

    const updatedSource = t.toString({ placeholders: true });

    const contents = this.#nonTemplateParser.parse(updatedSource, options);

    for (const templateSection of t.parseResults) {
      const coordinates = coordinatesOf(source, templateSection);
      const tree = templateRecastParse(templateSection.contents);

      walk(tree as unknown as Node, {
        enter(node) {
          node.type = `Glimmer${node.type}` as typeof node.type;
        },
      });

      walk(contents as Node, {
        enter(node: Node) {
          if (node.loc?.start.line === coordinates.line) {
            this.replace(tree as unknown as Node);
          }
        },
      });
    }

    return contents;
  }
}
