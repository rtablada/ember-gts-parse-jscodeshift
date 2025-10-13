import { Type } from 'ast-types';
const { def } = Type;

export function defGlimmerAst() {
  def('GlimmerNode').bases('Node').finalize();

  // CommonProgram: Base interface for program-like nodes that contain statements
  // Extends BaseNode and provides common body property
  // Properties: type, loc, body (array of Statement)
  def('GlimmerCommonProgram')
    .bases('GlimmerNode')
    .build('body')
    .field('body', [def('GlimmerNode')])
    .finalize();

  // Block: A block of statements with parameters (e.g., {{#each}} block)
  // Used in BlockStatement's program and inverse
  // Properties: type, loc, body, params, chained?, blockParams
  def('GlimmerBlock').bases('GlimmerCommonProgram').finalize();

  // Template: The root node of a template, contains top-level statements
  // Properties: type, loc, body, blockParams
  def('GlimmerTemplate').bases('GlimmerCommonProgram').finalize();

  // MustacheStatement: A mustache interpolation {{...}} or {{{...}}}
  // Can be trusting (unescaped) or escaped
  // Properties: type, loc, path, params, hash, trusting, strip, escaped (deprecated)
  def('GlimmerMustacheStatement').bases('GlimmerNode').finalize();

  // BlockStatement: A block helper {{#helper}}...{{/helper}}
  // Contains a program block and optional inverse (else) block
  // Properties: type, loc, path, params, hash, program, inverse?, openStrip, inverseStrip, closeStrip, chained?
  def('GlimmerBlockStatement').bases('GlimmerNode').finalize();

  // ElementModifierStatement: A modifier on an element {{modifier}}
  // Properties: type, loc, path, params, hash
  def('GlimmerElementModifierStatement').bases('GlimmerNode').finalize();

  // CommentStatement: An HTML comment <!-- ... -->
  // Properties: type, loc, value
  def('GlimmerCommentStatement').bases('GlimmerNode').finalize();

  // MustacheCommentStatement: A Handlebars comment {{! ... }} or {{!-- ... --}}
  // Properties: type, loc, value
  def('GlimmerMustacheCommentStatement').bases('GlimmerNode').finalize();

  // ElementNode: An HTML element or component <div>...</div>
  // Can have attributes, modifiers, params, and children
  // Properties: type, loc, path, selfClosing, attributes, params, modifiers, comments, children, openTag, closeTag, tag, blockParams
  def('GlimmerElementNode').bases('GlimmerNode').finalize();

  // AttrNode: An attribute on an element (e.g., class="foo")
  // Properties: type, loc, name, value
  def('GlimmerAttrNode').bases('GlimmerNode').finalize();

  // TextNode: Plain text content in the template
  // Properties: type, loc, chars
  def('GlimmerTextNode').bases('GlimmerNode').finalize();

  // ConcatStatement: Concatenation of text and mustaches in attribute values
  // e.g., class="foo {{bar}}"
  // Properties: type, loc, parts (PresentArray of TextNode | MustacheStatement)
  def('GlimmerConcatStatement').bases('GlimmerNode').finalize();

  // SubExpression: A nested expression (helper arg1 arg2)
  // Properties: type, loc, path, params, hash
  def('GlimmerSubExpression').bases('GlimmerNode').finalize();

  // ThisHead: The 'this' keyword
  // Properties: type, loc, original (always 'this')
  def('GlimmerThisHead').bases('GlimmerNode').finalize();

  // AtHead: An @argument reference like @name
  // Properties: type, loc, name, original (alias for name)
  def('GlimmerAtHead').bases('GlimmerNode').finalize();

  // VarHead: A variable reference like foo
  // Properties: type, loc, name, original (alias for name)
  def('GlimmerVarHead').bases('GlimmerNode').finalize();

  // PathExpression: A path like this, @arg, foo, or foo.bar.baz
  // Properties: type, loc, original, head, tail, parts (deprecated), this (deprecated), data (deprecated)
  def('GlimmerPathExpression').bases('GlimmerNode').finalize();

  // StringLiteral: A string value "foo" or 'foo'
  // Properties: type, loc, value, original (deprecated)
  def('GlimmerStringLiteral').bases('GlimmerNode').finalize();

  // BooleanLiteral: true or false
  // Properties: type, loc, value, original (deprecated)
  def('GlimmerBooleanLiteral').bases('GlimmerNode').finalize();

  // NumberLiteral: A numeric value like 42 or 3.14
  // Properties: type, loc, value, original (deprecated)
  def('GlimmerNumberLiteral').bases('GlimmerNode').finalize();

  // UndefinedLiteral: The undefined value
  // Properties: type, loc, value (always undefined), original (deprecated)
  def('GlimmerUndefinedLiteral').bases('GlimmerNode').finalize();

  // NullLiteral: The null value
  // Properties: type, loc, value (always null), original (deprecated)
  def('GlimmerNullLiteral').bases('GlimmerNode').finalize();

  // Hash: A collection of key-value pairs (foo=bar baz=qux)
  // Properties: type, loc, pairs
  def('GlimmerHash').bases('GlimmerNode').finalize();

  // HashPair: A single key-value pair in a hash
  // Properties: type, loc, key, value
  def('GlimmerHashPair').bases('GlimmerNode').finalize();
}
