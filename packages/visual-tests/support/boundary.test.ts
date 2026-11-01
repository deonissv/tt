import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { expect, it } from 'vitest';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const contracts = new Set(['@tt/actions', '@tt/states', '@tt/dto']);

function boundaryViolations(text: string, file: string): string[] {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const forbidden: string[] = [];
  const check = (module: string) => {
    const internalPath = module.startsWith('.') || path.isAbsolute(module);
    const preparing = path.relative(packageRoot, file).startsWith(`prepare${path.sep}`);
    if (
      !preparing &&
      (module === 'pngjs' ||
        (internalPath &&
          path.relative(packageRoot, path.resolve(path.dirname(file), module)).startsWith(`prepare${path.sep}`)))
    ) {
      forbidden.push('coordinate discovery belongs to fixture preparation');
      return;
    }
    const outsidePackage =
      internalPath && path.relative(packageRoot, path.resolve(path.dirname(file), module)).startsWith('..');
    if (
      outsidePackage ||
      (module.startsWith('@tt/') && !contracts.has(module)) ||
      /^@(babylonjs|nestjs|prisma)\//.test(module) ||
      module === 'bcryptjs'
    )
      forbidden.push(module);
  };
  const visit = (node: ts.Node) => {
    if (ts.isIdentifier(node) && ['localStorage', 'sessionStorage'].includes(node.text)) {
      forbidden.push('direct access to browser authentication storage');
    }
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isPropertyAccessExpression(node.left) &&
      ['requestAnimationFrame', 'cancelAnimationFrame'].includes(node.left.name.text)
    )
      forbidden.push('replacement of native animation scheduling');
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      check(node.moduleSpecifier.text);
      if (node.moduleSpecifier.text === '@tt/dto' && ts.isImportDeclaration(node) && !node.importClause?.isTypeOnly)
        forbidden.push('DTO classes must be imported as types');
    }
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    ) {
      const argument = node.arguments[0];
      if (argument && ts.isStringLiteral(argument)) check(argument.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return forbidden;
}

it('uses public contracts and browser/HTTP clients without importing application implementation', () => {
  const violations: string[] = [];
  const files = fs.readdirSync(packageRoot, { recursive: true }) as string[];
  for (const file of files) {
    if (!/\.[cm]?[jt]s$/.test(file) || /(^|[/\\])(node_modules|baselines)([/\\]|$)/.test(file)) continue;
    const absolute = path.join(packageRoot, file);
    for (const module of boundaryViolations(fs.readFileSync(absolute, 'utf8'), absolute)) {
      violations.push(`${file}: ${module}`);
    }
  }
  expect(violations).toEqual([]);
});

it.each([
  "import { TTSParser } from '@tt/tts-parser'",
  "import { CreateUserDto } from '@tt/dto'",
  "import('@babylonjs/core/Maths/math.vector.js')",
  "const { PrismaClient } = require('@prisma/client')",
  "export { Simulation } from '../../server/src/simulation/simulation'",
  "const state = { localStorage: [{ name: 'token', value: 'secret' }] }",
  'window.requestAnimationFrame = callback => setTimeout(callback, 500)',
  "import { PNG } from 'pngjs'",
  "import { findVisualTarget } from '../prepare/find-target'",
])('rejects implementation dependency %s', source => {
  expect(boundaryViolations(source, path.join(packageRoot, 'support/example.ts'))).toHaveLength(1);
});
