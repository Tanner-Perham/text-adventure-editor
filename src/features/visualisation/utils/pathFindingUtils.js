/**
 * Utilities for finding paths through dialogue trees
 */

/**
 * Find all possible paths from a starting node
 * @param {Object} dialogueTrees The dialogue trees data
 * @param {string} startNodeId The ID of the node to start from
 * @param {number} maxDepth Maximum path depth to prevent infinite recursion
 * @returns {Array} Array of paths (each path is an array of node objects)
 */
export const findAllPaths = (dialogueTrees, startNodeId, maxDepth = 15) => {
  const paths = [];

  const traverse = (nodeId, path = [], visited = new Set(), depth = 0) => {
    // Prevent infinite loops and excessive depth
    if (visited.has(nodeId) || depth > maxDepth) {
      paths.push([
        ...path,
        {
          id: nodeId,
          isCycle: visited.has(nodeId),
        },
      ]);
      return;
    }

    const node = dialogueTrees[nodeId];
    if (!node) {
      paths.push([...path, { id: nodeId, isMissing: true }]);
      return;
    }

    // Add current node to path and visited set
    const newPath = [
      ...path,
      {
        id: nodeId,
        text: node.text,
        speaker: node.speaker,
        emotional_state: node.emotional_state,
      },
    ];

    const newVisited = new Set(visited).add(nodeId);

    // If no options, this is an endpoint
    if (!node.options || node.options.length === 0) {
      paths.push(newPath);
      return;
    }

    // Process each option
    let optionProcessed = false;

    node.options.forEach((option) => {
      // Add option connector to indicate option text and type
      const optionConnector = {
        type: "option",
        text: option.text || "",
        hasSkillCheck: !!option.skill_check,
        hasConditions: !!option.conditions,
      };

      // Check regular next_node
      if (!option.skill_check && option.next_node) {
        optionProcessed = true;
        traverse(
          option.next_node,
          [...newPath, optionConnector],
          newVisited,
          depth + 1,
        );
      }

      // Check skill check paths
      if (option.skill_check) {
        if (option.success_node) {
          optionProcessed = true;
          traverse(
            option.success_node,
            [...newPath, { ...optionConnector, result: "success" }],
            newVisited,
            depth + 1,
          );
        }

        if (option.failure_node) {
          optionProcessed = true;
          traverse(
            option.failure_node,
            [...newPath, { ...optionConnector, result: "failure" }],
            newVisited,
            depth + 1,
          );
        }
      }
    });

    // If no options were processed (e.g., all options have no next node)
    if (!optionProcessed) {
      paths.push(newPath);
    }
  };

  // Start traversal
  traverse(startNodeId);

  return paths;
};

/**
 * Find all entry nodes (nodes with no incoming links)
 * @param {Object} dialogueTrees The dialogue trees data
 * @returns {Array} Array of node IDs that have no incoming links
 */
export const findEntryNodes = (dialogueTrees) => {
  // Set of all nodes referenced as targets
  const referencedNodes = new Set();

  // Check all nodes for outgoing links
  Object.values(dialogueTrees).forEach((node) => {
    if (node.options) {
      node.options.forEach((option) => {
        if (option.next_node) {
          referencedNodes.add(option.next_node);
        }

        // Also check skill check paths
        if (option.success_node) {
          referencedNodes.add(option.success_node);
        }
        if (option.failure_node) {
          referencedNodes.add(option.failure_node);
        }
      });
    }
  });

  // Find nodes that aren't in the referenced set
  return Object.keys(dialogueTrees).filter(
    (nodeId) => !referencedNodes.has(nodeId),
  );
};

/**
 * Find all end nodes (nodes with no outgoing links)
 * @param {Object} dialogueTrees The dialogue trees data
 * @returns {Array} Array of node IDs that have no outgoing links
 */
export const findEndNodes = (dialogueTrees) => {
  return Object.entries(dialogueTrees)
    .filter(([_, node]) => {
      // No options at all
      if (!node.options || node.options.length === 0) {
        return true;
      }

      // Has options but none lead anywhere
      return node.options.every(
        (option) =>
          !option.next_node && !option.success_node && !option.failure_node,
      );
    })
    .map(([id]) => id);
};

/**
 * Find all possible starting nodes for visualisation
 * Prioritizes entry nodes, then nodes with quest-starts if available
 * @param {Object} dialogueTrees The dialogue trees data
 * @param {Object} quests The quests data
 * @returns {Array} Array of good starting node IDs
 */
export const findStartingNodes = (dialogueTrees, quests = {}) => {
  // First, find entry nodes
  const entryNodes = findEntryNodes(dialogueTrees);

  // If we have entry nodes, return them
  if (entryNodes.length > 0) {
    return entryNodes;
  }

  // Otherwise, look for nodes that start quests
  if (Object.keys(quests).length > 0) {
    const questStartNodes = [];

    Object.entries(dialogueTrees).forEach(([nodeId, node]) => {
      if (node.options) {
        node.options.some((option) => {
          if (option.consequences) {
            const startsQuest = option.consequences.some(
              (effect) => effect.event_type === "StartQuest" && effect.data,
            );

            if (startsQuest) {
              questStartNodes.push(nodeId);
              return true;
            }
          }
          return false;
        });
      }
    });

    if (questStartNodes.length > 0) {
      return questStartNodes;
    }
  }

  // If all else fails, just return the first node
  return Object.keys(dialogueTrees).length > 0
    ? [Object.keys(dialogueTrees)[0]]
    : [];
};

/**
 * Find the shortest path between two nodes
 * @param {Object} dialogueTrees The dialogue trees data
 * @param {string} startNodeId Starting node ID
 * @param {string} endNodeId Ending node ID
 * @returns {Array|null} Array of node IDs forming the path, or null if no path
 */
export const findShortestPath = (dialogueTrees, startNodeId, endNodeId) => {
  if (!dialogueTrees[startNodeId] || !dialogueTrees[endNodeId]) {
    return null;
  }

  // Breadth-first search for shortest path
  const queue = [[startNodeId]];
  const visited = new Set([startNodeId]);

  while (queue.length > 0) {
    const path = queue.shift();
    const currentNodeId = path[path.length - 1];

    // Found target node
    if (currentNodeId === endNodeId) {
      return path;
    }

    const node = dialogueTrees[currentNodeId];
    if (!node || !node.options) continue;

    // Enqueue all possible next nodes
    node.options.forEach((option) => {
      const neighbors = [];

      if (option.next_node) {
        neighbors.push(option.next_node);
      }

      if (option.skill_check) {
        if (option.success_node) {
          neighbors.push(option.success_node);
        }
        if (option.failure_node) {
          neighbors.push(option.failure_node);
        }
      }

      neighbors.forEach((neighborId) => {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push([...path, neighborId]);
        }
      });
    });
  }

  // No path found
  return null;
};
