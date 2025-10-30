import typesPlugin from 'ast-types/lib/types';
import corePlugin from 'ast-types/lib/def/core';
import recast from 'recast';

function lightAssign(target, ...sources) {
  sources.forEach((source) => {
    Object.keys(source).forEach((key) => {
      if (target[key] === undefined) {
        target[key] = source[key];
      }
    });
  });
}

/**
 * This is an AST Types plugin that defines the Glimmer (Handlebars) AST nodes.
 *
 * It returns a set of type definitions to be used with jscodeshift or ast-types.
 */
export function GlimmerPlugin(fork) {
  fork.use(corePlugin);
  /**
   * This gets the local instance of ast-type for extension
   *
   * Using the module scope from import gives an immutable set
   * where `namedTypes` is not populated with new defs
   */
  const types = fork.use(typesPlugin);
  const Type = types.Type;
  const finalize = types.finalize;
  const or = Type.or;
  const def = Type.def;
  def('GlimmerNode').build().bases('Node');

  // StripFlags: Whitespace stripping configuration for mustache/block statements
  // Properties: open, close
  def('GlimmerStripFlags')
    .bases('GlimmerNode')
    .build('open', 'close')
    .field('open', Boolean)
    .field('close', Boolean);

  // CommonProgram: Base interface for program-like nodes that contain statements
  // Extends BaseNode and provides common body property
  // Properties: type, loc, body (array of Statement)
  def('GlimmerCommonProgram')
    .bases('GlimmerNode')
    .build('body')
    .field('body', [def('GlimmerNode')]);

  // Block: A block of statements with parameters (e.g., {{#each}} block)
  // Used in BlockStatement's program and inverse
  // Properties: type, loc, body, params, chained?, blockParams
  def('GlimmerBlock')
    .bases('GlimmerCommonProgram')
    .build('body', 'params', 'blockParams')
    .field('params', [def('GlimmerVarHead')])
    .field('chained', Boolean, () => false)
    .field('blockParams', [String]);

  // Template: The root node of a template, contains top-level statements
  // Properties: type, loc, body, blockParams
  def('GlimmerTemplate')
    .bases('GlimmerCommonProgram')
    .build('body', 'blockParams')
    .field('blockParams', [String]);

  def('GlimmerCallNode').bases('GlimmerNode');

  // MustacheStatement: A mustache interpolation {{...}} or {{{...}}}
  // Can be trusting (unescaped) or escaped
  // Properties: type, loc, path, params, hash, trusting, strip, escaped (deprecated)
  def('GlimmerMustacheStatement')
    .bases('GlimmerCallNode')
    .build('path', 'params', 'hash', 'trusting')
    .field('path', def('GlimmerNode')) // Expression
    .field('params', [def('GlimmerNode')]) // Expression[]
    .field('hash', def('GlimmerHash'))
    .field('trusting', Boolean)
    .field('strip', def('GlimmerStripFlags'))
    .field('escaped', Boolean); // deprecated

  // BlockStatement: A block helper {{#helper}}...{{/helper}}
  // Contains a program block and optional inverse (else) block
  // Properties: type, loc, path, params, hash, program, inverse?, openStrip, inverseStrip, closeStrip, chained?
  def('GlimmerBlockStatement')
    .bases('GlimmerCallNode')
    .build('path', 'params', 'hash', 'program')
    .field('path', def('GlimmerNode')) // CallableExpression
    .field('params', [def('GlimmerNode')]) // Expression[]
    .field('hash', def('GlimmerHash'))
    .field('program', def('GlimmerBlock'))
    .field('inverse', or(def('GlimmerBlock'), null), () => null)
    .field('openStrip', def('GlimmerStripFlags'))
    .field('inverseStrip', def('GlimmerStripFlags'))
    .field('closeStrip', def('GlimmerStripFlags'))
    .field('chained', Boolean, () => false);

  // ElementModifierStatement: A modifier on an element {{modifier}}
  // Properties: type, loc, path, params, hash
  def('GlimmerElementModifierStatement')
    .bases('GlimmerCallNode')
    .build('path', 'params', 'hash')
    .field('path', def('GlimmerNode')) // CallableExpression
    .field('params', [def('GlimmerNode')]) // Expression[]
    .field('hash', def('GlimmerHash'));

  // CommentStatement: An HTML comment <!-- ... -->
  // Properties: type, loc, value
  def('GlimmerCommentStatement')
    .bases('GlimmerNode')
    .build('value')
    .field('value', String);

  // MustacheCommentStatement: A Handlebars comment {{! ... }} or {{!-- ... --}}
  // Properties: type, loc, value
  def('GlimmerMustacheCommentStatement')
    .bases('GlimmerNode')
    .build('value')
    .field('value', String);

  // ElementNode: An HTML element or component <div>...</div>
  // Can have attributes, modifiers, params, and children
  // Properties: type, loc, path, selfClosing, attributes, params, modifiers, comments, children, openTag, closeTag, tag, blockParams
  def('GlimmerElementNode')
    .bases('GlimmerNode')
    .build(
      'path',
      'selfClosing',
      'attributes',
      'params',
      'modifiers',
      'comments',
      'children',
      'blockParams',
    )
    .field('path', def('GlimmerPathExpression'))
    .field('selfClosing', Boolean)
    .field('attributes', [def('GlimmerAttrNode')])
    .field('params', [def('GlimmerVarHead')])
    .field('modifiers', [def('GlimmerElementModifierStatement')])
    .field('comments', [def('GlimmerMustacheCommentStatement')])
    .field('children', [def('GlimmerNode')]) // Statement[]
    .field('openTag', def('GlimmerNode')) // SourceSpan - using GlimmerNode as placeholder
    .field('closeTag', or(def('GlimmerNode'), null), () => null) // Nullable<SourceSpan>
    .field('tag', String) // accessor for path.original
    .field('blockParams', [String]);

  // AttrNode: An attribute on an element (e.g., class="foo")
  // Properties: type, loc, name, value
  def('GlimmerAttrNode')
    .bases('GlimmerNode')
    .build('name', 'value')
    .field('name', String)
    .field('value', def('GlimmerNode')); // AttrValue: TextNode | MustacheStatement | ConcatStatement

  // TextNode: Plain text content in the template
  // Properties: type, loc, chars
  def('GlimmerTextNode')
    .bases('GlimmerNode')
    .build('chars')
    .field('chars', String);

  // ConcatStatement: Concatenation of text and mustaches in attribute values
  // e.g., class="foo {{bar}}"
  // Properties: type, loc, parts (PresentArray of TextNode | MustacheStatement)
  def('GlimmerConcatStatement')
    .bases('GlimmerNode')
    .build('parts')
    .field('parts', [def('GlimmerNode')]); // PresentArray<TextNode | MustacheStatement>

  // SubExpression: A nested expression (helper arg1 arg2)
  // Properties: type, loc, path, params, hash
  def('GlimmerSubExpression')
    .bases('GlimmerCallNode')
    .build('path', 'params', 'hash')
    .field('path', def('GlimmerNode')) // CallableExpression
    .field('params', [def('GlimmerNode')]) // Expression[]
    .field('hash', def('GlimmerHash'));

  // ThisHead: The 'this' keyword
  // Properties: type, loc, original (always 'this')
  def('GlimmerThisHead')
    .bases('GlimmerNode')
    .build('original')
    .field('original', String); // always 'this'

  // AtHead: An @argument reference like @name
  // Properties: type, loc, name, original (alias for name)
  def('GlimmerAtHead')
    .bases('GlimmerNode')
    .build('name')
    .field('name', String)
    .field('original', String); // alias for name

  // VarHead: A variable reference like foo
  // Properties: type, loc, name, original (alias for name)
  def('GlimmerVarHead')
    .bases('GlimmerNode')
    .build('name')
    .field('name', String)
    .field('original', String); // alias for name

  // PathExpression: A path like this, @arg, foo, or foo.bar.baz
  // Properties: type, loc, original, head, tail, parts (deprecated), this (deprecated), data (deprecated)
  def('GlimmerPathExpression')
    .bases('GlimmerNode')
    .build('original', 'head', 'tail')
    .field('original', String)
    .field('head', def('GlimmerNode')) // PathHead: ThisHead | AtHead | VarHead
    .field('tail', [String])
    .field('parts', [String]) // deprecated - readonly string[]
    .field('this', Boolean) // deprecated
    .field('data', Boolean); // deprecated

  // StringLiteral: A string value "foo" or 'foo'
  // Properties: type, loc, value, original (deprecated)
  def('GlimmerStringLiteral')
    .bases('GlimmerNode')
    .build('value')
    .field('value', String)
    .field('original', String); // deprecated

  // BooleanLiteral: true or false
  // Properties: type, loc, value, original (deprecated)
  def('GlimmerBooleanLiteral')
    .bases('GlimmerNode')
    .build('value')
    .field('value', Boolean)
    .field('original', Boolean); // deprecated

  // NumberLiteral: A numeric value like 42 or 3.14
  // Properties: type, loc, value, original (deprecated)
  def('GlimmerNumberLiteral')
    .bases('GlimmerNode')
    .build('value')
    .field('value', Number)
    .field('original', Number); // deprecated

  // UndefinedLiteral: The undefined value
  // Properties: type, loc, value (always undefined), original (deprecated)
  def('GlimmerUndefinedLiteral')
    .bases('GlimmerNode')
    .build('value')
    .field('value', or(undefined, null)) // undefined
    .field('original', or(undefined, null)); // deprecated

  // NullLiteral: The null value
  // Properties: type, loc, value (always null), original (deprecated)
  def('GlimmerNullLiteral')
    .bases('GlimmerNode')
    .build('value')
    .field('value', or(null, undefined)) // null
    .field('original', or(null, undefined)); // deprecated

  // Hash: A collection of key-value pairs (foo=bar baz=qux)
  // Properties: type, loc, pairs
  def('GlimmerHash')
    .bases('GlimmerNode')
    .build('pairs')
    .field('pairs', [def('GlimmerHashPair')]);

  // HashPair: A single key-value pair in a hash
  // Properties: type, loc, key, value
  def('GlimmerHashPair')
    .bases('GlimmerNode')
    .build('key', 'value')
    .field('key', String)
    .field('value', def('GlimmerNode')); // Expression

  finalize();

  /**
   * Type assertion to cast the ast-types namedTypes to GlimmerNamedTypes.
   * @type {import('./glimmer-v1.d.ts').GlimmerNamedTypes}
   */
  const namedTypes = types.namedTypes;
  const builders = types.builders;

  // Recast has readonly properties on namedTypes/builders, so lightAssign is
  // basically Object.assign but only assigns if the property is undefined
  lightAssign(recast.types.namedTypes, namedTypes);
  lightAssign(recast.types.builders, builders);

  return {
    GlimmerNode: namedTypes.GlimmerNode,
    glimmerNode: builders.glimmerNode,
    GlimmerStripFlags: namedTypes.GlimmerStripFlags,
    glimmerStripFlags: builders.glimmerStripFlags,
    GlimmerCommonProgram: namedTypes.GlimmerCommonProgram,
    glimmerCommonProgram: builders.glimmerCommonProgram,
    GlimmerBlock: namedTypes.GlimmerBlock,
    glimmerBlock: builders.glimmerBlock,
    GlimmerTemplate: namedTypes.GlimmerTemplate,
    glimmerTemplate: builders.glimmerTemplate,
    GlimmerCallNode: namedTypes.GlimmerCallNode,
    glimmerCallNode: builders.glimmerCallNode,
    GlimmerMustacheStatement: namedTypes.GlimmerMustacheStatement,
    glimmerMustacheStatement: builders.glimmerMustacheStatement,
    GlimmerBlockStatement: namedTypes.GlimmerBlockStatement,
    glimmerBlockStatement: builders.glimmerBlockStatement,
    GlimmerElementModifierStatement: namedTypes.GlimmerElementModifierStatement,
    glimmerElementModifierStatement: builders.glimmerElementModifierStatement,
    GlimmerCommentStatement: namedTypes.GlimmerCommentStatement,
    glimmerCommentStatement: builders.glimmerCommentStatement,
    GlimmerMustacheCommentStatement: namedTypes.GlimmerMustacheCommentStatement,
    glimmerMustacheCommentStatement: builders.glimmerMustacheCommentStatement,
    GlimmerElementNode: namedTypes.GlimmerElementNode,
    glimmerElementNode: builders.glimmerElementNode,
    GlimmerAttrNode: namedTypes.GlimmerAttrNode,
    glimmerAttrNode: builders.glimmerAttrNode,
    GlimmerTextNode: namedTypes.GlimmerTextNode,
    glimmerTextNode: builders.glimmerTextNode,
    GlimmerConcatStatement: namedTypes.GlimmerConcatStatement,
    glimmerConcatStatement: builders.glimmerConcatStatement,
    GlimmerSubExpression: namedTypes.GlimmerSubExpression,
    glimmerSubExpression: builders.glimmerSubExpression,
    GlimmerThisHead: namedTypes.GlimmerThisHead,
    glimmerThisHead: builders.glimmerThisHead,
    GlimmerAtHead: namedTypes.GlimmerAtHead,
    glimmerAtHead: builders.glimmerAtHead,
    GlimmerVarHead: namedTypes.GlimmerVarHead,
    glimmerVarHead: builders.glimmerVarHead,
    GlimmerPathExpression: namedTypes.GlimmerPathExpression,
    glimmerPathExpression: builders.glimmerPathExpression,
    GlimmerStringLiteral: namedTypes.GlimmerStringLiteral,
    glimmerStringLiteral: builders.glimmerStringLiteral,
    GlimmerBooleanLiteral: namedTypes.GlimmerBooleanLiteral,
    glimmerBooleanLiteral: builders.glimmerBooleanLiteral,
    GlimmerNumberLiteral: namedTypes.GlimmerNumberLiteral,
    glimmerNumberLiteral: builders.glimmerNumberLiteral,
    GlimmerUndefinedLiteral: namedTypes.GlimmerUndefinedLiteral,
    glimmerUndefinedLiteral: builders.glimmerUndefinedLiteral,
    GlimmerNullLiteral: namedTypes.GlimmerNullLiteral,
    glimmerNullLiteral: builders.glimmerNullLiteral,
    GlimmerHash: namedTypes.GlimmerHash,
    glimmerHash: builders.glimmerHash,
    GlimmerHashPair: namedTypes.GlimmerHashPair,
    glimmerHashPair: builders.glimmerHashPair,
  };
}
