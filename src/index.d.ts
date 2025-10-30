import type * as j from 'jscodeshift';
import type { ASTv1 } from '@glimmer/syntax';
import type { Type } from 'ast-types/lib/types';
import type recast from 'recast';
import type { ASTPath, Collection } from 'jscodeshift';

export { builders } from 'ember-template-recast';

interface GlimmerNamedTypes {
  GlimmerNode: Type<ASTv1.Node>;
  GlimmerStripFlags: Type<ASTv1.StripFlags>;
  GlimmerCommonProgram: Type<ASTv1.CommonProgram>;
  GlimmerBlock: Type<ASTv1.Block>;
  GlimmerTemplate: Type<ASTv1.Template>;
  GlimmerCallNode: Type<ASTv1.CallNode>;
  GlimmerMustacheStatement: Type<ASTv1.MustacheStatement>;
  GlimmerBlockStatement: Type<ASTv1.BlockStatement>;
  GlimmerElementModifierStatement: Type<ASTv1.ElementModifierStatement>;
  GlimmerCommentStatement: Type<ASTv1.CommentStatement>;
  GlimmerMustacheCommentStatement: Type<ASTv1.MustacheCommentStatement>;
  GlimmerElementNode: Type<ASTv1.ElementNode>;
  GlimmerAttrNode: Type<ASTv1.AttrNode>;
  GlimmerTextNode: Type<ASTv1.TextNode>;
  GlimmerConcatStatement: Type<ASTv1.ConcatStatement>;
  GlimmerSubExpression: Type<ASTv1.SubExpression>;
  GlimmerThisHead: Type<ASTv1.ThisHead>;
  GlimmerAtHead: Type<ASTv1.AtHead>;
  GlimmerVarHead: Type<ASTv1.VarHead>;
  GlimmerPathExpression: Type<ASTv1.PathExpression>;
  GlimmerStringLiteral: Type<ASTv1.StringLiteral>;
  GlimmerBooleanLiteral: Type<ASTv1.BooleanLiteral>;
  GlimmerNumberLiteral: Type<ASTv1.NumberLiteral>;
  GlimmerUndefinedLiteral: Type<ASTv1.UndefinedLiteral>;
  GlimmerNullLiteral: Type<ASTv1.NullLiteral>;
  GlimmerHash: Type<ASTv1.Hash>;
  GlimmerHashPair: Type<ASTv1.HashPair>;
}

export function glimmerCodeshift(
  codeshift: j.JSCodeshift,
  parser?: j.Parser,
): j.JSCodeshift & GlimmerNamedTypes;

export function print(
  ast: ASTPath<unknown> | Collection<unknown>,
  options?: recast.Options,
): string;
