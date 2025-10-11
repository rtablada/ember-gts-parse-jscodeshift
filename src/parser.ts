import j from 'jscodeshift';
import getParser from 'jscodeshift/src/getParser.js';
import ContentTag from 'content-tag';
import type { ASTNode } from 'ast-types/lib/types';

export class EmberParser implements j.Parser {
  #contentTagProcessor = new ContentTag.Preprocessor();
  #nonTemplateParser: j.Parser;

  constructor(nonTemplateParser: string | j.Parser = getParser()) {
    if (typeof nonTemplateParser === 'string') {
      nonTemplateParser = getParser(nonTemplateParser);
    }

    this.#nonTemplateParser = nonTemplateParser;
  }

  parse(source: string, options?: { jsParser: j.Parser }): ASTNode {
    const preprocessedASTs = this.#contentTagProcessor.parse(source);
    // throw new Error('Method not implemented.');
    if (!preprocessedASTs.length) {
      return this.#nonTemplateParser.parse(source, options);
    }

    return preprocessedASTs[0]!;
  }
}
