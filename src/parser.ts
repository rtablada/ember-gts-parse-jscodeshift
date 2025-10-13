import j from 'jscodeshift';
import getParser from 'jscodeshift/dist/getParser.js';
import ContentTag from 'content-tag';
import type { ASTNode } from 'ast-types/lib/types';
import { walk } from 'estree-walker';
import type { Node } from 'estree';
import { Transformer, coordinatesOf } from 'content-tag-utils';
import { parse as templateRecastParse } from 'ember-template-recast'

const BufferMap = new Map<string, Buffer>();

function getBuffer(str: string) {
  let buf = BufferMap.get(str);
  if (!buf) {
    buf = Buffer.from(str);
    BufferMap.set(str, buf);
  }
  return buf;
}

function sliceByteRange(str: string, a: number, b?: number | undefined) {
  const buf = getBuffer(str);
  return buf.slice(a, b).toString();
}

function replaceRange(
  s: string,
  start: number,
  end: number,
  substitute: string,
) {
  return sliceByteRange(s, 0, start) + substitute + sliceByteRange(s, end);
}

const STATIC_MEMBER_PREABLE = 'template = ';

export class EmberParser implements j.Parser {
  #contentTagProcessor = new ContentTag.Preprocessor();
  #nonTemplateParser: j.Parser;

  constructor(nonTemplateParser: string | j.Parser = getParser('ts')) {
    if (typeof nonTemplateParser === 'string') {
      this.#nonTemplateParser = getParser(nonTemplateParser);
    } else {
      this.#nonTemplateParser = nonTemplateParser;
    }
  }

  parse(source: string, options?: { jsParser: j.Parser }): ASTNode {
		const t = new Transformer(source);

    const updatedSource = t.toString({ placeholders: true });

    const contents = this.#nonTemplateParser.parse(updatedSource, options);

    for (const templateSection of t.parseResults) {
      const coordinates = coordinatesOf(source, templateSection);
      
      walk(contents as Node, {
        enter(node) {
          if (node.loc?.start.line === coordinates.line) {
            let tree = templateRecastParse(templateSection.contents);
            this.replace(tree as unknown as Node);
          }
        },
      });
    }

    return contents;

    // return preprocessedASTs[0]!;
  }

  replaceSource(source: string, preprocessedASTs: ContentTag.Parsed[]): string {
    let jsCode = source;

    for (const tplInfo of preprocessedASTs.reverse()) {
      const content = tplInfo.contents
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$');
      if (tplInfo.type === 'class-member') {
        const templateAsStringLength =
          tplInfo.range.endChar - tplInfo.range.startChar;
        const textLength =
          templateAsStringLength - STATIC_MEMBER_PREABLE.length - 2; // account for the two quotes

        // For now just replace with a HUGE set of spaces to preserve character positions
        // Wrapping in ` is causing an invariant error in jscodeshift... WAT
        const replacementText = `${STATIC_MEMBER_PREABLE}'${' '.repeat(textLength)}'`;

        jsCode = replaceRange(
          jsCode,
          tplInfo.range.startChar,
          tplInfo.range.endChar,
          replacementText,
        );
      } else {
        const tplLength = tplInfo.range.endChar - tplInfo.range.startChar;
        const byteLength = tplInfo.range.endByte - tplInfo.range.startByte;
        const spaces = tplLength - '`'.length - '`'.length;
        const total = content + ' '.repeat(spaces);
        const replacementCode = `\`${total}\``;
        jsCode = replaceRange(
          jsCode,
          tplInfo.range.startChar,
          tplInfo.range.endChar,
          replacementCode,
        );
      }
    }

    return jsCode;
  }
}
