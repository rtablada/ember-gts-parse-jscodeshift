import { walk } from 'estree-walker';

import { print as templateRecastPrint } from 'ember-template-recast';
import recast from 'recast';
const { builders: b } = recast.types;
import { cloneNode } from './clone-node.js';
import { cloneDeep } from 'lodash-es';

/**
 *
 * @import {ASTPath, Collection} from 'jscodeshift';
 * @param { ASTPath<unknown> | Collection<unknown>} ast
 * @returns ast is Collection<unknown>
 */
function isCodeShiftCollection(ast) {
  return ast.paths !== undefined;
}

/**
 *
 * @param { ASTPath<unknown> | Collection<unknown>} ast
 * @param {recast.Options} options
 * @returns string
 */
export function print(ast, options = {}) {
  /**
   * @type {Map<string, string>}
   */
  const stuffToReplace = new Map();

  if (isCodeShiftCollection(ast)) {
    ast = ast.paths()[0];
  }

  ast = cloneDeep(ast.node);

  walk(ast, {
    enter(node) {
      if (node.type === 'GlimmerClassDeclaration') {
        node.type = 'ClassDeclaration';
      } else if (node.type === 'GlimmerClassBody') {
        node.type = 'ClassBody';
      }

      // @ts-expect-error This is fine
      if (node.type === 'GlimmerTemplate') {
        node.type = 'Template';

        const uuid = Math.random();
        const placeholder = b.classProperty(
          b.identifier('__gts__' + uuid),
          null,
        );

        this.replace(placeholder);

        walk(node, {
          enter(innerNode) {
            if (innerNode.type?.startsWith('Glimmer')) {
              let replacement = cloneNode(innerNode, () =>
                innerNode.type.replace(/^Glimmer/, ''),
              );

              this.replace(replacement);
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
