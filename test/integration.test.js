import { describe, it, expect, beforeAll } from 'vitest';
import { glimmerCodeshift, EmberParser } from '../src/index.js';
import jscodeshift from 'jscodeshift';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function readFixture(filename) {
  return readFileSync(join(__dirname, 'fixtures', filename), 'utf-8');
}

describe('jscodeshift integration', () => {
  let j;

  beforeAll(() => {
    const parser = new EmberParser('ts');
    j = glimmerCodeshift(jscodeshift, parser);
  });

  describe('Transform GJS files', () => {
    it('should parse and transform a GJS component', () => {
      const source = readFixture('component.gjs');
      const root = j(source);

      expect(root).toBeDefined();
      expect(root.find).toBeDefined();
    });

    it('should find import declarations', () => {
      const source = readFixture('component.gjs');
      const root = j(source);

      const imports = root.find(j.ImportDeclaration);

      expect(imports.length).toBeGreaterThan(0);
    });

    it('should find class declarations', () => {
      const source = readFixture('component.gjs');
      const root = j(source);

      const classes = root.find(j.ClassDeclaration);

      expect(classes.length).toBeGreaterThan(0);
    });

    it('should find decorators', () => {
      const source = readFixture('component.gjs');
      const root = j(source);

      const decorators = root.find(j.Decorator);

      expect(decorators.length).toBeGreaterThan(0);
    });

    it('should allow transformation of JavaScript code', () => {
      const source = `
        import Component from '@glimmer/component';
        export class TestComponent extends Component {
          property = true;
          <template><div>Test</div></template>
        }
      `;

      const root = j(source);

      // Find and rename the class
      root.find(j.ClassDeclaration).forEach((path) => {
        path.node.id.name = 'RenamedComponent';
      });

      const output = root.toSource();
      expect(output).toContain('RenamedComponent');
      expect(output).not.toContain('TestComponent');
    });

    it('should preserve templates during transformation', () => {
      const source = `
        import Component from '@glimmer/component';
        export class TestComponent extends Component {
          property = true;
          <template><div>Test Content</div></template>
        }
      `;

      const root = j(source);

      // Transform JavaScript but preserve template
      root
        .find(j.ClassProperty)
        .filter((path) => path.node.key.name === 'property')
        .forEach((path) => {
          path.node.key.name = 'renamedProperty';
        });

      const output = root.toSource();
      expect(output).toContain('renamedProperty');
      expect(output).toContain('<template>');
      expect(output).toContain('Test Content');
    });
  });

  describe('Transform GTS files', () => {
    it('should parse and transform a GTS component', () => {
      const source = readFixture('component.gts');
      const root = j(source);

      expect(root).toBeDefined();
      expect(root.find).toBeDefined();
    });

    it('should handle TypeScript types', () => {
      const source = readFixture('component.gts');
      const root = j(source);

      const classes = root.find(j.ClassDeclaration);

      expect(classes.length).toBeGreaterThan(0);
    });
  });

  describe('Transform regular JS files', () => {
    it('should transform regular JavaScript without templates', () => {
      const source = readFixture('raw-js.js');
      const root = j(source);

      const classes = root.find(j.ClassDeclaration);

      expect(classes.length).toBeGreaterThan(0);
    });

    it('should allow standard jscodeshift operations', () => {
      const source = `
        export class Example {
          method() {
            return 'hello';
          }
        }
      `;

      const root = j(source);

      // Rename method
      root.find(j.ClassMethod).forEach((path) => {
        path.node.key.name = 'renamedMethod';
      });

      const output = root.toSource();
      expect(output).toContain('renamedMethod');
      expect(output).not.toContain('method()');
    });
  });

  describe('Complex transformations', () => {
    it('should handle adding imports', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template><div>Test</div></template>
        }
      `;

      const root = j(source);

      // Add a new import
      const newImport = j.importDeclaration(
        [j.importSpecifier(j.identifier('tracked'))],
        j.literal('@glimmer/tracking'),
      );

      root.find(j.Program).get('body', 0).insertBefore(newImport);

      const output = root.toSource();
      expect(output).toContain("import { tracked } from '@glimmer/tracking'");
    });

    it('should handle adding class properties', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template><div>Test</div></template>
        }
      `;

      const root = j(source);

      // Add a new property
      root.find(j.ClassBody).forEach((path) => {
        const newProperty = j.classProperty(
          j.identifier('newProperty'),
          j.literal(42),
        );
        path.node.body.unshift(newProperty);
      });

      const output = root.toSource();
      expect(output).toContain('newProperty');
    });

    it('should handle finding and modifying method calls', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          doSomething() {
            console.log('test');
          }
          <template><div>Test</div></template>
        }
      `;

      const root = j(source);

      // Find console.log calls
      const consoleLogs = root.find(j.CallExpression, {
        callee: {
          object: { name: 'console' },
          property: { name: 'log' },
        },
      });

      expect(consoleLogs.length).toBeGreaterThan(0);
    });
  });
});
