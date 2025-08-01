module.exports = {
  presets: ['@babel/preset-env'],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
      ],
      plugins: [
        // Transform import.meta.glob calls to return empty objects in test environment
        function() {
          return {
            visitor: {
              MemberExpression(path) {
                if (
                  path.node.object &&
                  path.node.object.type === 'MetaProperty' &&
                  path.node.object.meta.name === 'import' &&
                  path.node.object.property.name === 'meta' &&
                  path.node.property.name === 'glob'
                ) {
                  // Replace import.meta.glob(...) with (() => ({}))
                  if (path.parent.type === 'CallExpression') {
                    path.parentPath.replaceWithSourceString('(() => ({}))');
                  }
                }
              }
            }
          };
        }
      ],
    },
  },
}
