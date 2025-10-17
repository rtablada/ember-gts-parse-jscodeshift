import type recast from 'recast';
import type { ASTPath, Collection } from 'jscodeshift';

export function print(
  ast: ASTPath<unknown> | Collection<unknown>,
  options?: recast.Options,
): string;
