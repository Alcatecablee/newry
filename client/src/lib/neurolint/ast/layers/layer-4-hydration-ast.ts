
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { ASTTransformer } from '../ASTTransformer';
import { ASTUtils } from '../utils';

export async function transformAST(code: string): Promise<string> {
  const transformer = new ASTTransformer();
  
  try {
    return transformer.transform(code, (ast) => {
      addSSRGuardsAST(ast);
      addMountedStatesAST(ast);
      addUseClientDirectiveAST(ast, code);
    });
  } catch (error) {
    console.warn('AST transform failed, using fallback');
    throw error;
  }
}

function addSSRGuardsAST(ast: t.File): void {
  traverse(ast, {
    CallExpression(path) {
      const node = path.node;
      if (
        t.isMemberExpression(node.callee) &&
        t.isIdentifier(node.callee.object) &&
        node.callee.object.name === 'localStorage' &&
        t.isIdentifier(node.callee.property)
      ) {
        // Check if already wrapped in typeof check
        if (
          t.isLogicalExpression(path.parent) &&
          t.isBinaryExpression((path.parent as t.LogicalExpression).left) &&
          t.isUnaryExpression(((path.parent as t.LogicalExpression).left as t.BinaryExpression).left) &&
          ((((path.parent as t.LogicalExpression).left as t.BinaryExpression).left as t.UnaryExpression).argument as t.Identifier).name === 'window'
        ) {
          return; // Already wrapped
        }
        
        // Create typeof window !== "undefined" check
        const typeofCheck = t.binaryExpression(
          '!==',
          t.unaryExpression('typeof', t.identifier('window')),
          t.stringLiteral('undefined')
        );
        
        // Create conditional expression: typeof window !== "undefined" ? localStorage.method(...) : fallback
        let fallbackValue: t.Expression;
        
        if (node.callee.property.name === 'getItem') {
          fallbackValue = t.nullLiteral();
        } else if (node.callee.property.name === 'setItem') {
          fallbackValue = t.identifier('undefined');
        } else {
          fallbackValue = t.identifier('undefined');
        }
        
        const conditionalExpression = t.conditionalExpression(
          typeofCheck,
          node,
          fallbackValue
        );
        
        path.replaceWith(conditionalExpression);
      }
    }
  });
}

function addMountedStatesAST(ast: t.File): void {
  let hasLocalStorage = false;
  let hasUseState = false;
  let hasMountedState = false;
  
  // Check if component uses localStorage and useState
  traverse(ast, {
    CallExpression(path) {
      if (
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.object) &&
        path.node.callee.object.name === 'localStorage'
      ) {
        hasLocalStorage = true;
      }
      if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'useState') {
        hasUseState = true;
      }
    },
    VariableDeclarator(path) {
      if (
        t.isArrayPattern(path.node.id) &&
        path.node.id.elements.length >= 1 &&
        t.isIdentifier(path.node.id.elements[0]) &&
        path.node.id.elements[0].name === 'mounted'
      ) {
        hasMountedState = true;
      }
    }
  });
  
  if (hasLocalStorage && hasUseState && !hasMountedState) {
    // Add mounted state and useEffect
    traverse(ast, {
      FunctionDeclaration(path) {
        const body = path.node.body.body;
        
        // Add mounted state at the beginning
        const mountedState = t.variableDeclaration('const', [
          t.variableDeclarator(
            t.arrayPattern([
              t.identifier('mounted'),
              t.identifier('setMounted')
            ]),
            t.callExpression(t.identifier('useState'), [t.booleanLiteral(false)])
          )
        ]);
        
        // Add mount effect
        const mountEffect = t.expressionStatement(
          t.callExpression(t.identifier('useEffect'), [
            t.arrowFunctionExpression(
              [],
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(t.identifier('setMounted'), [t.booleanLiteral(true)])
                )
              ])
            ),
            t.arrayExpression([])
          ])
        );
        
        body.unshift(mountedState, mountEffect);
        path.stop();
      }
    });
  }
}

function addUseClientDirectiveAST(ast: t.File, code: string): void {
  if (ASTUtils.needsUseClient(ast, code) && !ASTUtils.hasUseClientDirective(code)) {
    ASTUtils.addUseClientDirective(ast);
  }
}
