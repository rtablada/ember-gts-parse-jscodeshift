declare module 'jscodeshift/dist/getParser.js' {
  import type { Parser } from 'jscodeshift';

  export default function getParser(name: string): Parser;
}
