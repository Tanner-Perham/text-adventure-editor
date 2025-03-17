/**
 * Utilities for preparing graph data for visualisations
 */

/**
 * Prepare node and link data from dialogue trees for visualisation
 * @param {Object} dialogueTrees The dialogue trees data
 * @param {Object} quests Quest data to identify quest-related nodes
 * @param {boolean} includeQuests Whether to include quest relationships
 * @returns {Object} Object containing nodes and links arrays
 */
export const prepareGraphData = (
  dialogueTrees,
  quests = {},
  includeQuests = false,
) => {
  // Create nodes from dialogue tree
  const nodes = Object.entries(dialogueTrees).map(([id, node]) => ({
    id,
    speaker: node.speaker || "",
    text:
      node.text?.length > 30
        ? node.text.substring(0, 30) + "..."
        : node.text || "",
    emotional_state: node.emotional_state || "Neutral",
    questRelated: false, // Will be set later if needed
  }));

  // Create links between nodes based on options
  const links = [];
  Object.entries(dialogueTrees).forEach(([sourceId, node]) => {
    if (node.options) {
      node.options.forEach((option) => {
        // Handle regular next_node links (when no skill check)
        if (
          !option.skill_check &&
          option.next_node &&
          dialogueTrees[option.next_node]
        ) {
          links.push({
            source: sourceId,
            target: option.next_node,
            label:
              option.text?.length > 20
                ? option.text.substring(0, 20) + "..."
                : option.text || "",
            isSkillCheck: false,
            linkType: "normal",
          });
        }

        // Handle skill check success links
        if (
          option.skill_check &&
          option.success_node &&
          dialogueTrees[option.success_node]
        ) {
          links.push({
            source: sourceId,
            target: option.success_node,
            label: `${option.text?.length > 15 ? option.text.substring(0, 15) + "..." : option.text || ""} (Success)`,
            isSkillCheck: true,
            linkType: "success",
          });
        }

        // Handle skill check failure links
        if (
          option.skill_check &&
          option.failure_node &&
          dialogueTrees[option.failure_node]
        ) {
          links.push({
            source: sourceId,
            target: option.failure_node,
            label: `${option.text?.length > 15 ? option.text.substring(0, 15) + "..." : option.text || ""} (Failure)`,
            isSkillCheck: true,
            linkType: "failure",
          });
        }
      });
    }
  });

  // Mark quest-related nodes if requested
  if (includeQuests && Object.keys(quests).length > 0) {
    // Find nodes that have quest-related effects in their options
    Object.entries(dialogueTrees).forEach(([nodeId, node]) => {
      if (node.options) {
        node.options.forEach((option) => {
          if (option.consequences) {
            const hasQuestEffect = option.consequences.some((effect) => {
              // Check all effect types that might reference quests
              if (effect.event_type === "StartQuest" && quests[effect.data])
                return true;
              if (
                effect.event_type === "AdvanceQuest" &&
                effect.data &&
                quests[effect.data[0]]
              )
                return true;
              if (
                effect.event_type === "CompleteQuestObjective" &&
                effect.data &&
                quests[effect.data[0]]
              )
                return true;
              if (effect.event_type === "FailQuest" && quests[effect.data])
                return true;
              if (
                effect.event_type === "AddQuestItem" &&
                effect.data?.quest_id &&
                quests[effect.data.quest_id]
              )
                return true;
              return false;
            });

            if (hasQuestEffect) {
              // Mark the node as quest-related
              const nodeIndex = nodes.findIndex((n) => n.id === nodeId);
              if (nodeIndex !== -1) {
                nodes[nodeIndex].questRelated = true;
              }
            }
          }
        });
      }
    });
  }

  return { nodes, links };
};

/**
 * Create a hierarchical tree structure for visualisation
 * @param {Object} dialogueTrees The dialogue trees data
 * @param {string} rootNodeId The ID of the root node to start from
 * @returns {Object} Hierarchical graph structure
 */
export const createHierarchy = (
  dialogueTrees,
  rootNodeId,
  visited = new Set(),
  pathInfo = { pathType: "normal", optionText: "" },
) => {
  if (visited.has(rootNodeId)) {
    // Handle cycles by creating a reference node
    return {
      id: `${rootNodeId}(ref)`,
      name: rootNodeId,
      referenceNode: true,
      pathType: pathInfo.pathType,
      optionText: pathInfo.optionText,
    };
  }

  const node = dialogueTrees[rootNodeId];
  if (!node) return null;

  // Add current node to visited set to detect cycles
  const newVisited = new Set(visited).add(rootNodeId);

  // Create node in hierarchy - pass through pathType from parent
  const hierarchyNode = {
    id: rootNodeId,
    name: rootNodeId,
    speaker: node.speaker || "",
    text: node.text || "",
    emotional_state: node.emotional_state || "Neutral",
    pathType: pathInfo.pathType, // Preserve incoming path type
    optionText: pathInfo.optionText, // Store option text that led to this node
    children: [],
  };

  // Add children based on options
  if (node.options && node.options.length > 0) {
    node.options.forEach((option) => {
      // Regular next node (no skill check)
      if (!option.skill_check && option.next_node) {
        const childPathInfo = {
          pathType: "normal",
          optionText: option.text || "",
        };

        const child = createHierarchy(
          dialogueTrees,
          option.next_node,
          newVisited,
          childPathInfo,
        );

        if (child) {
          hierarchyNode.children.push(child);
        }
      }
      // Skill check paths
      else if (option.skill_check) {
        // Success path
        if (option.success_node) {
          const successPathInfo = {
            pathType: "success",
            optionText: option.text || "",
          };

          const successChild = createHierarchy(
            dialogueTrees,
            option.success_node,
            newVisited,
            successPathInfo,
          );

          if (successChild) {
            hierarchyNode.children.push(successChild);
          }
        }

        // Failure path
        if (option.failure_node) {
          const failurePathInfo = {
            pathType: "failure",
            optionText: option.text || "",
          };

          const failureChild = createHierarchy(
            dialogueTrees,
            option.failure_node,
            newVisited,
            failurePathInfo,
          );

          if (failureChild) {
            hierarchyNode.children.push(failureChild);
          }
        }
      }
    });
  }

  return hierarchyNode;
};
