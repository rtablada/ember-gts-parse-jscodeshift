import { walk } from 'estree-walker';
import type { Node } from 'estree';

import { print as templateRecastPrint } from 'ember-template-recast';
import recast from 'recast';
import type { ASTPath, Collection } from 'jscodeshift';
import type { ASTNode } from 'ast-types/lib/types';
const { builders: b } = recast.types;

function isCodeShiftCollection(
  ast: ASTPath<unknown> | Collection<unknown>,
): ast is Collection<unknown> {
  return (ast as Collection<unknown>).paths !== undefined;
}

export function print(
  ast: ASTPath<unknown> | Collection<unknown>,
  options?: recast.Options,
): string {
  const stuffToReplace = new Map<string, string>();

  if (isCodeShiftCollection(ast)) {
    ast = ast.paths()[0];
  } else {
    ast = ast as ASTPath<Node>;
  }

  walk(ast as unknown as Node, {
    enter(node) {
      // @ts-expect-error This is fine
      if (node.type === 'GlimmerTemplate') {
        const uuid = Math.random();
        const placeholder = b.classProperty(
          b.identifier('__gts__' + uuid),
          null,
        );

        this.replace(placeholder as unknown as Node);

        walk(node as unknown as Node, {
          enter(node2) {
            if (node2.type?.startsWith('Glimmer')) {
              node2.type = node2.type.replace(
                /^Glimmer/,
                '',
              ) as typeof node2.type;
            }
          },
        });

        stuffToReplace.set(
          recast.print(placeholder).code,
          templateRecastPrint(node),
        );
      }
    },
  });

  let nicePrettyJS = recast.print(ast as unknown as ASTNode, options).code;

  for (const [js, glimmer] of stuffToReplace) {
    nicePrettyJS = nicePrettyJS.replace(js, `<template>${glimmer}</template>`);
  }

  return nicePrettyJS;
}
