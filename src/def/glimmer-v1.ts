import { Type } from 'ast-types';
const { def } = Type;

export function defGlimmerAst() {
  // CommonProgram: Base interface for program-like nodes that contain statements
  // Extends BaseNode and provides common body property
  // Properties: type, loc, body (array of Statement)
  def('GlimmerCommonProgram').bases('Node').finalize();

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
  def('GlimmerMustacheStatement').bases('Node').finalize();

  // BlockStatement: A block helper {{#helper}}...{{/helper}}
  // Contains a program block and optional inverse (else) block
  // Properties: type, loc, path, params, hash, program, inverse?, openStrip, inverseStrip, closeStrip, chained?
  def('GlimmerBlockStatement').bases('Node').finalize();

  // ElementModifierStatement: A modifier on an element {{modifier}}
  // Properties: type, loc, path, params, hash
  def('GlimmerElementModifierStatement').bases('Node').finalize();

  // CommentStatement: An HTML comment <!-- ... -->
  // Properties: type, loc, value
  def('GlimmerCommentStatement').bases('Node').finalize();

  // MustacheCommentStatement: A Handlebars comment {{! ... }} or {{!-- ... --}}
  // Properties: type, loc, value
  def('GlimmerMustacheCommentStatement').bases('Node').finalize();

  // ElementNode: An HTML element or component <div>...</div>
  // Can have attributes, modifiers, params, and children
  // Properties: type, loc, path, selfClosing, attributes, params, modifiers, comments, children, openTag, closeTag, tag, blockParams
  def('GlimmerElementNode').bases('Node').finalize();

  // AttrNode: An attribute on an element (e.g., class="foo")
  // Properties: type, loc, name, value
  def('GlimmerAttrNode').bases('Node').finalize();

  // TextNode: Plain text content in the template
  // Properties: type, loc, chars
  def('GlimmerTextNode').bases('Node').finalize();

  // ConcatStatement: Concatenation of text and mustaches in attribute values
  // e.g., class="foo {{bar}}"
  // Properties: type, loc, parts (PresentArray of TextNode | MustacheStatement)
  def('GlimmerConcatStatement').bases('Node').finalize();

  // SubExpression: A nested expression (helper arg1 arg2)
  // Properties: type, loc, path, params, hash
  def('GlimmerSubExpression').bases('Node').finalize();

  // ThisHead: The 'this' keyword
  // Properties: type, loc, original (always 'this')
  def('GlimmerThisHead').bases('Node').finalize();

  // AtHead: An @argument reference like @name
  // Properties: type, loc, name, original (alias for name)
  def('GlimmerAtHead').bases('Node').finalize();

  // VarHead: A variable reference like foo
  // Properties: type, loc, name, original (alias for name)
  def('GlimmerVarHead').bases('Node').finalize();

  // PathExpression: A path like this, @arg, foo, or foo.bar.baz
  // Properties: type, loc, original, head, tail, parts (deprecated), this (deprecated), data (deprecated)
  def('GlimmerPathExpression').bases('Node').finalize();

  // StringLiteral: A string value "foo" or 'foo'
  // Properties: type, loc, value, original (deprecated)
  def('GlimmerStringLiteral').bases('Node').finalize();

  // BooleanLiteral: true or false
  // Properties: type, loc, value, original (deprecated)
  def('GlimmerBooleanLiteral').bases('Node').finalize();

  // NumberLiteral: A numeric value like 42 or 3.14
  // Properties: type, loc, value, original (deprecated)
  def('GlimmerNumberLiteral').bases('Node').finalize();

  // UndefinedLiteral: The undefined value
  // Properties: type, loc, value (always undefined), original (deprecated)
  def('GlimmerUndefinedLiteral').bases('Node').finalize();

  // NullLiteral: The null value
  // Properties: type, loc, value (always null), original (deprecated)
  def('GlimmerNullLiteral').bases('Node').finalize();

  // Hash: A collection of key-value pairs (foo=bar baz=qux)
  // Properties: type, loc, pairs
  def('GlimmerHash').bases('Node').finalize();

  // HashPair: A single key-value pair in a hash
  // Properties: type, loc, key, value
  def('GlimmerHashPair').bases('Node').finalize();
}
