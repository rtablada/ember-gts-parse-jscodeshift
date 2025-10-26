import { describe, it, expect } from 'vitest';
import {
  setupAstTypes,
  glimmerCodeshift,
  EmberParser,
  GlimmerPlugin,
  print,
} from '../src/index.js';
import jscodeshift from 'jscodeshift';

describe('Package exports', () => {
  describe('setupAstTypes', () => {
    it('should export setupAstTypes function', () => {
      expect(setupAstTypes).toBeDefined();
      expect(typeof setupAstTypes).toBe('function');
    });

    it('should return ast-types with Glimmer plugin', async () => {
      const astTypes = await setupAstTypes();
      expect(astTypes).toBeDefined();
      expect(astTypes.namedTypes).toBeDefined();
    });
  });

  describe('glimmerCodeshift', () => {
    it('should export glimmerCodeshift function', () => {
      expect(glimmerCodeshift).toBeDefined();
      expect(typeof glimmerCodeshift).toBe('function');
    });

    it('should create a codeshift instance with EmberParser', () => {
      const parser = new EmberParser('ts');
      const j = glimmerCodeshift(jscodeshift, parser);

      expect(j).toBeDefined();
      expect(j.withParser).toBeDefined();
    });

    it('should add Glimmer named types to codeshift instance', () => {
      const parser = new EmberParser('ts');
      const j = glimmerCodeshift(jscodeshift, parser);

      // Check if Glimmer types are available
      expect(j.glimmerElementNode).toBeDefined();
      expect(j.glimmerMustacheStatement).toBeDefined();
      expect(j.glimmerBlockStatement).toBeDefined();
      expect(j.glimmerTemplate).toBeDefined();
    });
  });

  describe('EmberParser', () => {
    it('should export EmberParser class', () => {
      expect(EmberParser).toBeDefined();
      expect(typeof EmberParser).toBe('function');
    });

    it('should be instantiable', () => {
      const parser = new EmberParser('ts');
      expect(parser).toBeDefined();
      expect(parser.parse).toBeDefined();
    });
  });

  describe('GlimmerPlugin', () => {
    it('should export GlimmerPlugin', () => {
      expect(GlimmerPlugin).toBeDefined();
    });
  });

  describe('print', () => {
    it('should export print function', () => {
      expect(print).toBeDefined();
      expect(typeof print).toBe('function');
    });
  });
});
