/**
 * Find all nodes that reference a given node
 * @param {Object} dialogueTrees - The dialogue trees data
 * @param {string} targetNodeId - ID of the node to find references to
 * @returns {Array} - Array of node IDs that reference the target node
 */
export const findReferencingNodes = (dialogueTrees, targetNodeId) => {
  return Object.entries(dialogueTrees)
    .filter(
      ([_, node]) =>
        node.options &&
        node.options.some((option) => option.next_node === targetNodeId),
    )
    .map(([id]) => id);
};

/**
 * Add a new node connected to the current node
 * @param {Object} dialogueTrees - The dialogue trees data
 * @param {string} currentNodeId - ID of the current node
 * @returns {Object} - Updated dialogue trees and the ID of the new node
 */
export const addConnectedNode = (dialogueTrees, currentNodeId) => {
  const newNodeId = `node_${Date.now()}`;
  const currentNode = dialogueTrees[currentNodeId];

  // Create new trees with the added node
  const newTrees = {
    ...dialogueTrees,
    [newNodeId]: {
      id: newNodeId,
      text: "New connected node",
      speaker: currentNode.speaker,
      emotional_state: "Neutral",
      options: [],
    },
  };

  // Add option to current node pointing to new node
  const newOption = {
    id: `option_to_${newNodeId}`,
    text: "Continues to new node",
    next_node: newNodeId,
  };

  newTrees[currentNodeId] = {
    ...currentNode,
    options: [...(currentNode.options || []), newOption],
  };

  return {
    dialogueTrees: newTrees,
    newNodeId,
  };
};

/**
 * Validate a dialogue tree for common issues
 * @param {Object} dialogueTrees - The dialogue trees data
 * @returns {Array} - Array of validation issues
 */
export const validateDialogueTree = (dialogueTrees) => {
  const issues = [];

  // Check for nodes with no incoming references (orphaned nodes)
  const referencedNodes = new Set();

  // Build set of all referenced nodes
  Object.values(dialogueTrees).forEach((node) => {
    if (node.options) {
      node.options.forEach((option) => {
        if (option.next_node) {
          referencedNodes.add(option.next_node);
        }
      });
    }
  });

  // Find orphaned nodes (except for potential starting nodes)
  Object.keys(dialogueTrees).forEach((nodeId) => {
    if (!referencedNodes.has(nodeId)) {
      issues.push({
        type: "warning",
        nodeId,
        message:
          "This node has no incoming references (might be a starting node or orphaned)",
      });
    }
  });

  // Check for references to non-existent nodes
  Object.entries(dialogueTrees).forEach(([nodeId, node]) => {
    if (node.options) {
      node.options.forEach((option, idx) => {
        if (option.next_node && !dialogueTrees[option.next_node]) {
          issues.push({
            type: "error",
            nodeId,
            optionIdx: idx,
            message: `Option references non-existent node "${option.next_node}"`,
          });
        }
      });
    }
  });

  // Check for nodes with no options (dead ends)
  Object.entries(dialogueTrees).forEach(([nodeId, node]) => {
    if (!node.options || node.options.length === 0) {
      issues.push({
        type: "info",
        nodeId,
        message: "This node has no dialogue options (conversation dead end)",
      });
    }
  });

  return issues;
};

/**
 * Get a list of all node paths from a starting node to all possible endpoints
 * @param {Object} dialogueTrees - The dialogue trees data
 * @param {string} startNodeId - ID of the starting node
 * @returns {Array} - Array of node paths
 */
export const getAllPaths = (dialogueTrees, startNodeId) => {
  const paths = [];

  const traversePath = (currentNodeId, currentPath = []) => {
    // Add current node to path
    const newPath = [...currentPath, currentNodeId];

    const node = dialogueTrees[currentNodeId];

    // If node doesn't exist or has no options, this is an endpoint
    if (!node || !node.options || node.options.length === 0) {
      paths.push(newPath);
      return;
    }

    // Continue traversing through each option
    node.options.forEach((option) => {
      if (option.next_node) {
        // Check for cycles
        if (newPath.includes(option.next_node)) {
          paths.push([...newPath, `${option.next_node} (cycle)`]);
        } else {
          traversePath(option.next_node, newPath);
        }
      } else {
        // Option with no next node is an endpoint
        paths.push([...newPath, null]);
      }
    });
  };

  traversePath(startNodeId);
  return paths;
};
