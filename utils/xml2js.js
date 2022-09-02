/**
 * Recursively set a field on each node of the tree pointing to the node's parent.
 *
 * @param {object} node The child node.
 * @param {object} parent The parent node.
 */
const setNodeParent = function (node, parent) {
  // Assume that we've already run this function if so.
  if ('$parent' in node) {
    return
  }
  node.$parent = parent
  const childNodes = node.node || []
  for (const child of childNodes) {
    setNodeParent(child, node)
  }
}

/**
 * Handle top level of parent-setting recursion before passing to setNodeParent.
 *
 * @param {object} node The child node.
 * @param {object} parent The parent node.
 */
export const setParent = function (node, parent) {
  if (node.schema) {
    node.$parent = null
    setNodeParent(node.schema[0], null)
  } else {
    setNodeParent(node, parent)
  }
}
