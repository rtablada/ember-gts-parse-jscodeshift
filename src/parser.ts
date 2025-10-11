import type{BaseNode} from 'estree';
import j from 'jscodeshift';

export class EmberParser implements j.Parser {
   parse(source: string, options?: { jsParser: j.Parser }): BaseNode {
    throw new Error('Method not implemented.');
  }
}
