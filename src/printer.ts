import { walk } from 'estree-walker';
import type { Node } from 'estree';

import { print as templateRecastPrint } from 'ember-template-recast';
import recast from 'recast';
import type { ASTPath } from 'jscodeshift';
const { builders: b } = recast.types;

export function print(ast: ASTPath<unknown>, options?: recast.Options): string {
  const stuffToReplace = new Map<string, string>();

  walk(ast as unknown as Node, {
    enter(node) {
      if (node.type === 'TemplateTag') {
        node.content.replace(template.parse(node.content));
      }
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

  let nicePrettyJS = recast.print(ast, options).code;

  for (const [js, glimmer] of stuffToReplace) {
    nicePrettyJS = nicePrettyJS.replace(js, `<template>${glimmer}</template>`);
  }

  return nicePrettyJS;
}
