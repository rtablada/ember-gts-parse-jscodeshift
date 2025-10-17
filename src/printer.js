import { walk } from 'estree-walker';

import { print as templateRecastPrint } from 'ember-template-recast';
import recast from 'recast';
const { builders: b } = recast.types;

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
 * @param {recast.Options} options?
 * @returns string
 */
export function print(ast, options) {
  /**
   * @type {Map<string, string>}
   */
  const stuffToReplace = new Map();

  if (isCodeShiftCollection(ast)) {
    ast = ast.paths()[0];
  }

  walk(ast, {
    enter(node) {
      // @ts-expect-error This is fine
      if (node.type === 'GlimmerTemplate') {
        const uuid = Math.random();
        const placeholder = b.classProperty(
          b.identifier('__gts__' + uuid),
          null,
        );

        this.replace(placeholder);

        walk(node, {
          enter(node2) {
            if (node2.type?.startsWith('Glimmer')) {
              node2.type = node2.type.replace(/^Glimmer/, '');
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
