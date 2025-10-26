# Tests

This directory contains the test suite for `glimmer-jscodeshift` using Vitest.

## Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

## Test Structure

### `parser.test.js`
Tests for the `EmberParser` class that handles parsing GJS/GTS files:
- Basic parsing of GJS and GTS files
- Handling of import and class declarations
- Conversion of template nodes to Glimmer-prefixed types
- Template feature parsing (mustaches, blocks, elements)
- Parser options and configuration

### `index.test.js`
Tests for the main package exports:
- `setupAstTypes()` - Setting up AST types with Glimmer plugin
- `glimmerCodeshift()` - Creating jscodeshift instances with Glimmer support
- Export validation for all public APIs

### `integration.test.js`
Integration tests with jscodeshift:
- Transforming GJS/GTS files
- Finding and modifying JavaScript code
- Preserving templates during transformations
- Complex transformations (adding imports, modifying classes, etc.)
- Standard jscodeshift operations on regular JS files

### `glimmer-nodes.test.js`
Tests for Glimmer template node types:
- `GlimmerElementNode` - HTML elements
- `GlimmerMustacheStatement` - Text interpolation and helpers
- `GlimmerBlockStatement` - Block helpers (if, each, etc.)
- `GlimmerTextNode` - Plain text content
- `GlimmerAttrNode` - Element attributes
- `GlimmerCommentStatement` - Handlebars comments
- `GlimmerPathExpression` - Property paths
- `GlimmerSubExpression` - Helper sub-expressions
- `GlimmerElementModifierStatement` - Element modifiers
- Template-only components

## Fixtures

The `fixtures/` directory contains example files used for testing:

- `component.gjs` - Basic GJS component with decorators and template
- `component.gts` - TypeScript GTS component with type annotations
- `complete.gjs` - Comprehensive example covering all HBS and JS features
- `raw-js.js` - Regular JavaScript file without templates
- `raw-ts.ts` - Regular TypeScript file without templates

## Adding New Tests

When adding new tests:

1. Create or update a test file in the `test/` directory
2. Import necessary utilities from Vitest: `describe`, `it`, `expect`, `beforeAll`, etc.
3. Use the fixtures or create inline test cases
4. Follow the existing patterns for traversing and asserting on AST nodes
5. Run tests to ensure they pass

## Coverage

To view test coverage, run:

```bash
pnpm test:coverage
```

Coverage reports will be generated in the `coverage/` directory.
