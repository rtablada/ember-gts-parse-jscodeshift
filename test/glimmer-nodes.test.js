import { describe, it, expect, beforeAll } from 'vitest';
import { EmberParser } from '../src/parser.js';

describe('Glimmer Template Nodes', () => {
  let parser;

  beforeAll(() => {
    parser = new EmberParser('ts');
  });

  function findNodeType(ast, nodeType) {
    const results = [];

    function traverse(node) {
      if (!node || typeof node !== 'object') return;

      if (node.type === nodeType) {
        results.push(node);
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
    return results;
  }

  describe('GlimmerElementNode', () => {
    it('should parse HTML elements as GlimmerElementNode', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            <div class="test">Content</div>
          </template>
        }
      `;

      const ast = parser.parse(source);
      const elements = findNodeType(ast, 'GlimmerElementNode');

      expect(elements.length).toBeGreaterThan(0);
      expect(elements[0].tag).toBe('div');
    });

    it('should parse self-closing elements', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            <img src="test.png" />
          </template>
        }
      `;

      const ast = parser.parse(source);
      const elements = findNodeType(ast, 'GlimmerElementNode');

      expect(elements.length).toBeGreaterThan(0);
    });

    it('should parse nested elements', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            <div>
              <span>
                <a href="#">Link</a>
              </span>
            </div>
          </template>
        }
      `;

      const ast = parser.parse(source);
      const elements = findNodeType(ast, 'GlimmerElementNode');

      expect(elements.length).toBeGreaterThan(2);
    });
  });

  describe('GlimmerMustacheStatement', () => {
    it('should parse mustache interpolation', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            <p>{{this.value}}</p>
          </template>
        }
      `;

      const ast = parser.parse(source);
      const mustaches = findNodeType(ast, 'GlimmerMustacheStatement');

      expect(mustaches.length).toBeGreaterThan(0);
    });

    it('should parse helper calls', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            <p>{{uppercase this.name}}</p>
          </template>
        }
      `;

      const ast = parser.parse(source);
      const mustaches = findNodeType(ast, 'GlimmerMustacheStatement');

      expect(mustaches.length).toBeGreaterThan(0);
    });
  });

  describe('GlimmerBlockStatement', () => {
    it('should parse if blocks', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            {{#if this.show}}
              <p>Visible</p>
            {{/if}}
          </template>
        }
      `;

      const ast = parser.parse(source);
      const blocks = findNodeType(ast, 'GlimmerBlockStatement');

      expect(blocks.length).toBeGreaterThan(0);
      expect(blocks[0].path.original).toBe('if');
    });

    it('should parse each blocks', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            {{#each this.items as |item|}}
              <p>{{item}}</p>
            {{/each}}
          </template>
        }
      `;

      const ast = parser.parse(source);
      const blocks = findNodeType(ast, 'GlimmerBlockStatement');

      expect(blocks.length).toBeGreaterThan(0);
      expect(blocks[0].path.original).toBe('each');
    });

    it('should parse blocks with else', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            {{#if this.show}}
              <p>True</p>
            {{else}}
              <p>False</p>
            {{/if}}
          </template>
        }
      `;

      const ast = parser.parse(source);
      const blocks = findNodeType(ast, 'GlimmerBlockStatement');

      expect(blocks.length).toBeGreaterThan(0);
      expect(blocks[0].inverse).toBeDefined();
    });
  });

  describe('GlimmerTextNode', () => {
    it('should parse text content', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            <p>Plain text content</p>
          </template>
        }
      `;

      const ast = parser.parse(source);
      const textNodes = findNodeType(ast, 'GlimmerTextNode');

      expect(textNodes.length).toBeGreaterThan(0);
    });
  });

  describe('GlimmerAttrNode', () => {
    it('should parse element attributes', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            <div class="container" id="main">Content</div>
          </template>
        }
      `;

      const ast = parser.parse(source);
      const attrs = findNodeType(ast, 'GlimmerAttrNode');

      expect(attrs.length).toBeGreaterThan(0);
    });

    it('should parse dynamic attributes', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            <div class={{this.className}}>Content</div>
          </template>
        }
      `;

      const ast = parser.parse(source);
      const attrs = findNodeType(ast, 'GlimmerAttrNode');

      expect(attrs.length).toBeGreaterThan(0);
    });
  });

  describe('GlimmerCommentStatement', () => {
    it('should parse Handlebars comments', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            {{! This is a comment }}
            <div>Content</div>
          </template>
        }
      `;

      const ast = parser.parse(source);
      const comments = findNodeType(ast, 'GlimmerCommentStatement');

      expect(comments.length).toBeGreaterThan(0);
    });

    it('should parse block comments', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            {{!-- This is a block comment --}}
            <div>Content</div>
          </template>
        }
      `;

      const ast = parser.parse(source);
      const comments = findNodeType(ast, 'GlimmerCommentStatement');

      expect(comments.length).toBeGreaterThan(0);
    });
  });

  describe('GlimmerPathExpression', () => {
    it('should parse property paths', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            <p>{{this.user.name}}</p>
          </template>
        }
      `;

      const ast = parser.parse(source);
      const paths = findNodeType(ast, 'GlimmerPathExpression');

      expect(paths.length).toBeGreaterThan(0);
    });
  });

  describe('GlimmerSubExpression', () => {
    it('should parse helper sub-expressions', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            <button {{on "click" (fn this.doSomething "arg")}}>
              Click
            </button>
          </template>
        }
      `;

      const ast = parser.parse(source);
      const subExpressions = findNodeType(ast, 'GlimmerSubExpression');

      expect(subExpressions.length).toBeGreaterThan(0);
    });
  });

  describe('GlimmerElementModifierStatement', () => {
    it('should parse element modifiers', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            <button {{on "click" this.handleClick}}>
              Click
            </button>
          </template>
        }
      `;

      const ast = parser.parse(source);
      const modifiers = findNodeType(ast, 'GlimmerElementModifierStatement');

      expect(modifiers.length).toBeGreaterThan(0);
    });

    it('should parse multiple modifiers on one element', () => {
      const source = `
        import Component from '@glimmer/component';
        export default class extends Component {
          <template>
            <div {{modifier1}} {{modifier2}}>
              Content
            </div>
          </template>
        }
      `;

      const ast = parser.parse(source);
      const modifiers = findNodeType(ast, 'GlimmerElementModifierStatement');

      expect(modifiers.length).toBeGreaterThan(1);
    });
  });

  describe('Template-only components', () => {
    it('should parse template-only component exports', () => {
      const source = `
        export default <template>
          <div>Template-only component</div>
        </template>;
      `;

      const ast = parser.parse(source);

      expect(ast).toBeDefined();
      expect(ast.program.body.length).toBeGreaterThan(0);
    });

    it('should parse const template exports', () => {
      const source = `
        const MyComponent = <template>
          <div>Component</div>
        </template>;
        
        export { MyComponent };
      `;

      const ast = parser.parse(source);

      expect(ast).toBeDefined();
      expect(ast.program.body.length).toBeGreaterThan(0);
    });
  });
});
