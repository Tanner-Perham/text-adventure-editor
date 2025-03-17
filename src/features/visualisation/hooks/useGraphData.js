import { useMemo } from "react";
import { prepareGraphData, createHierarchy } from "../utils/graphDataUtils";

/**
 * Custom hook for preparing graph data for visualisation
 * Transforms dialogue trees into various data structures needed for different visualisations
 */
const useGraphData = (dialogueTrees, quests = {}, includeQuests = false) => {
  // Prepare basic nodes and links data for flow chart
  const { nodes, links } = useMemo(() => {
    return prepareGraphData(dialogueTrees, quests, includeQuests);
  }, [dialogueTrees, quests, includeQuests]);

  // Create hierarchical structure for tree visualisation
  const graphStructure = useMemo(() => {
    if (!dialogueTrees || Object.keys(dialogueTrees).length === 0) {
      return null;
    }

    // Find a good starting node (prefer entry points)
    const startNodeId = findStartNode(dialogueTrees);

    // Build the hierarchical structure
    return createHierarchy(dialogueTrees, startNodeId);
  }, [dialogueTrees]);

  // Additional data preparation for timeline visualisation
  const timelinePaths = useMemo(() => {
    if (!dialogueTrees || Object.keys(dialogueTrees).length === 0) {
      return [];
    }

    // Find entry nodes or use the first node
    const startNodes = findEntryNodes(dialogueTrees);
    return startNodes.map((nodeId) => {
      return {
        startNodeId: nodeId,
        paths: findAllPaths(dialogueTrees, nodeId),
      };
    });
  }, [dialogueTrees]);

  return {
    nodes,
    links,
    graphStructure,
    timelinePaths,
  };
};

// Make sure to export the hook as default
export default useGraphData;

/**
 * Find all entry nodes (nodes with no incoming links)
 */
function findEntryNodes(dialogueTrees) {
  // Find all nodes that are referenced as next_node
  const referencedNodes = new Set();

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

  // Find nodes that aren't referenced (entry points)
  const entryNodes = Object.keys(dialogueTrees).filter(
    (nodeId) => !referencedNodes.has(nodeId),
  );

  // If no entry nodes found, use the first node
  if (entryNodes.length === 0 && Object.keys(dialogueTrees).length > 0) {
    return [Object.keys(dialogueTrees)[0]];
  }

  return entryNodes;
}

/**
 * Find a good starting node for visualisation
 */
function findStartNode(dialogueTrees) {
  const entryNodes = findEntryNodes(dialogueTrees);

  // Use the first entry node, or the first node if no entry nodes
  return entryNodes.length > 0 ? entryNodes[0] : Object.keys(dialogueTrees)[0];
}

/**
 * Find all possible paths from a starting node
 */
function findAllPaths(dialogueTrees, startNodeId, maxDepth = 15) {
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
      // Check regular next_node
      if (option.next_node) {
        optionProcessed = true;
        traverse(
          option.next_node,
          [
            ...newPath,
            {
              type: "option",
              text: option.text,
              hasSkillCheck: !!option.skill_check,
              hasConditions: !!option.conditions,
            },
          ],
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
            [
              ...newPath,
              {
                type: "option",
                text: option.text,
                result: "success",
                hasSkillCheck: true,
              },
            ],
            newVisited,
            depth + 1,
          );
        }

        if (option.failure_node) {
          optionProcessed = true;
          traverse(
            option.failure_node,
            [
              ...newPath,
              {
                type: "option",
                text: option.text,
                result: "failure",
                hasSkillCheck: true,
              },
            ],
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
}
