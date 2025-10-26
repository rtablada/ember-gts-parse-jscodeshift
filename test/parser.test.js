import { describe, it, expect, beforeAll } from 'vitest';
import { EmberParser } from '../src/parser.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function readFixture(filename) {
  return readFileSync(join(__dirname, 'fixtures', filename), 'utf-8');
}

describe('EmberParser', () => {
  let parser;

  beforeAll(() => {
    parser = new EmberParser('ts');
  });

  describe('GJS files', () => {
    it('should parse a basic GJS component', () => {
      const source = readFixture('component.gjs');
      const ast = parser.parse(source);

      expect(ast).toBeDefined();
      expect(ast.type).toBe('File');
      expect(ast.program).toBeDefined();
      expect(ast.program.type).toBe('Program');
    });

    it('should parse the complete GJS example', () => {
      const source = readFixture('complete.gjs');
      const ast = parser.parse(source);

      expect(ast).toBeDefined();
      expect(ast.type).toBe('File');
      expect(ast.program.body).toBeDefined();
      expect(ast.program.body.length).toBeGreaterThan(0);
    });

    it('should identify import declarations', () => {
      const source = readFixture('component.gjs');
      const ast = parser.parse(source);

      const imports = ast.program.body.filter(
        (node) => node.type === 'ImportDeclaration',
      );

      expect(imports.length).toBeGreaterThan(0);
      expect(imports[0].source.value).toMatch(/@ember|@glimmer/);
    });

    it('should identify class declarations', () => {
      const source = readFixture('component.gjs');
      const ast = parser.parse(source);

      const classes = ast.program.body.filter(
        (node) =>
          node.type === 'ExportNamedDeclaration' &&
          node.declaration?.type === 'ClassDeclaration',
      );

      expect(classes.length).toBeGreaterThan(0);
    });

    it('should convert template nodes to Glimmer-prefixed types', () => {
      const source = readFixture('component.gjs');
      const ast = parser.parse(source);

      // Find any Glimmer nodes in the AST
      let hasGlimmerNodes = false;

      function traverse(node) {
        if (!node || typeof node !== 'object') return;
        
        if (node.type?.startsWith('Glimmer')) {
          hasGlimmerNodes = true;
          return;
        }

        for (const key in node) {
          if (Array.isArray(node[key])) {
            node[key].forEach(traverse);
          } else if (typeof node[key] === 'object') {
            traverse(node[key]);
          }
        }
      }

      traverse(ast);
      expect(hasGlimmerNodes).toBe(true);
    });
  });

  describe('GTS files', () => {
    it('should parse a GTS component with TypeScript', () => {
      const source = readFixture('component.gts');
      const ast = parser.parse(source);

      expect(ast).toBeDefined();
      expect(ast.type).toBe('File');
      expect(ast.program).toBeDefined();
    });

    it('should handle TypeScript type annotations', () => {
      const source = readFixture('component.gts');
      const ast = parser.parse(source);

      const classes = ast.program.body.filter(
        (node) =>
          node.type === 'ExportNamedDeclaration' &&
          node.declaration?.type === 'ClassDeclaration',
      );

      expect(classes.length).toBeGreaterThan(0);
    });
  });

  describe('Regular JS files', () => {
    it('should parse regular JavaScript files without templates', () => {
      const source = readFixture('raw-js.js');
      const ast = parser.parse(source);

      expect(ast).toBeDefined();
      expect(ast.type).toBe('File');
      expect(ast.program.body).toBeDefined();
    });

    it('should not create Glimmer nodes for files without templates', () => {
      const source = readFixture('raw-js.js');
      const ast = parser.parse(source);

      let hasGlimmerNodes = false;

      function traverse(node) {
        if (!node || typeof node !== 'object') return;
        
        if (node.type?.startsWith('Glimmer')) {
          hasGlimmerNodes = true;
          return;
        }

        for (const key in node) {
          if (Array.isArray(node[key])) {
            node[key].forEach(traverse);
          } else if (typeof node[key] === 'object') {
            traverse(node[key]);
          }
        }
      }

      traverse(ast);
      expect(hasGlimmerNodes).toBe(false);
    });
  });

  describe('Template features', () => {
    it('should parse templates with text interpolation', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            <p>{{this.value}}</p>
          </template>
        }
      `;
      const ast = parser.parse(source);

      expect(ast).toBeDefined();
      
      let foundMustache = false;
      function traverse(node) {
        if (!node || typeof node !== 'object') return;
        
        if (node.type === 'GlimmerMustacheStatement') {
          foundMustache = true;
          return;
        }

        for (const key in node) {
          if (Array.isArray(node[key])) {
            node[key].forEach(traverse);
          } else if (typeof node[key] === 'object') {
            traverse(node[key]);
          }
        }
      }

      traverse(ast);
      expect(foundMustache).toBe(true);
    });

    it('should parse templates with block statements', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            {{#if this.show}}
              <p>Content</p>
            {{/if}}
          </template>
        }
      `;
      const ast = parser.parse(source);

      expect(ast).toBeDefined();
      
      let foundBlockStatement = false;
      function traverse(node) {
        if (!node || typeof node !== 'object') return;
        
        if (node.type === 'GlimmerBlockStatement') {
          foundBlockStatement = true;
          return;
        }

        for (const key in node) {
          if (Array.isArray(node[key])) {
            node[key].forEach(traverse);
          } else if (typeof node[key] === 'object') {
            traverse(node[key]);
          }
        }
      }

      traverse(ast);
      expect(foundBlockStatement).toBe(true);
    });

    it('should parse templates with element nodes', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            <div class="test">Hello</div>
          </template>
        }
      `;
      const ast = parser.parse(source);

      expect(ast).toBeDefined();
      
      let foundElement = false;
      function traverse(node) {
        if (!node || typeof node !== 'object') return;
        
        if (node.type === 'GlimmerElementNode') {
          foundElement = true;
          return;
        }

        for (const key in node) {
          if (Array.isArray(node[key])) {
            node[key].forEach(traverse);
          } else if (typeof node[key] === 'object') {
            traverse(node[key]);
          }
        }
      }

      traverse(ast);
      expect(foundElement).toBe(true);
    });
  });

  describe('Parser options', () => {
    it('should accept a custom parser', () => {
      const customParser = {
        parse: () => ({
          type: 'File',
          program: {
            type: 'Program',
            body: [],
          },
        }),
      };

      const parserWithCustom = new EmberParser(customParser);
      expect(parserWithCustom).toBeDefined();
    });

    it('should use TypeScript parser by default when passed "ts"', () => {
      const tsParser = new EmberParser('ts');
      const source = `
        const x: number = 5;
      `;
      
      const ast = tsParser.parse(source);
      expect(ast).toBeDefined();
    });
  });
});
