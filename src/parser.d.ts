import type j from 'jscodeshift';

import type { ASTNode } from 'ast-types/lib/types';

export class EmberParser implements j.Parser {
  constructor(nonTemplateParser?: string | j.Parser);

  parse(source: string, options?: unknown): ASTNode;
}
