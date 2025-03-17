import * as d3 from "d3";

/**
 * Utilities for calculating layout positions for graph elements
 */

/**
 * Layout a large graph evenly using a grid pattern
 * Creates a more organized view of many nodes than force-directed layout
 * @param {Array} nodes Array of node objects to position
 * @param {number} width Width of the container
 * @param {number} height Height of the container
 * @param {number} nodeSize Size of each node for spacing
 * @returns {Array} Nodes with x and y positions set
 */
export const createGridLayout = (nodes, width, height, nodeSize = 60) => {
  // Calculate grid dimensions
  const nodesCount = nodes.length;
  const columns = Math.ceil(Math.sqrt(nodesCount));
  const rows = Math.ceil(nodesCount / columns);

  // Calculate spacing
  const colSpacing = Math.floor(width / (columns + 1));
  const rowSpacing = Math.floor(height / (rows + 1));

  // Position nodes on the grid
  return nodes.map((node, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);

    return {
      ...node,
      x: (col + 1) * colSpacing,
      y: (row + 1) * rowSpacing,
    };
  });
};

/**
 * Position nodes in a radial layout
 * Useful for visualizing a central node with connections
 * @param {Array} nodes Array of node objects
 * @param {string} centralNodeId ID of the node to place in the center
 * @param {number} width Width of the container
 * @param {number} height Height of the container
 * @returns {Array} Nodes with x and y positions set
 */
export const createRadialLayout = (nodes, centralNodeId, width, height) => {
  // Find the index of the central node
  const centerIdx = nodes.findIndex((node) => node.id === centralNodeId);

  // If central node not found, use a grid layout instead
  if (centerIdx === -1) {
    return createGridLayout(nodes, width, height);
  }

  // Set other nodes in a circle around the central node
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.3;

  // Position the central node
  nodes[centerIdx].x = centerX;
  nodes[centerIdx].y = centerY;

  // Position the other nodes in a circle
  const otherNodes = nodes.filter((_, i) => i !== centerIdx);
  const angleStep = (2 * Math.PI) / otherNodes.length;

  otherNodes.forEach((node, i) => {
    const angle = i * angleStep;
    node.x = centerX + radius * Math.cos(angle);
    node.y = centerY + radius * Math.sin(angle);
  });

  return nodes;
};

/**
 * Adjust layout to avoid node overlap
 * @param {Array} nodes Array of node objects with x,y positions
 * @param {number} nodeRadius Radius of each node
 * @param {number} iterations Number of iterations for the algorithm
 * @returns {Array} Nodes with updated positions to reduce overlap
 */
export const avoidNodeOverlap = (nodes, nodeRadius = 25, iterations = 10) => {
  // Clone the nodes to avoid modifying the original
  const adjustedNodes = [...nodes];

  // Run collision detection and adjustment for specified iterations
  for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < adjustedNodes.length; j++) {
      for (let k = j + 1; k < adjustedNodes.length; k++) {
        const node1 = adjustedNodes[j];
        const node2 = adjustedNodes[k];

        // Calculate distance between nodes
        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check for overlap
        const minDistance = nodeRadius * 2.2; // Add a bit of extra spacing

        if (distance < minDistance) {
          // Calculate repulsion force
          const force = ((minDistance - distance) / distance) * 0.1;

          // Apply force to move nodes apart
          const moveX = dx * force;
          const moveY = dy * force;

          // Update positions
          node1.x -= moveX;
          node1.y -= moveY;
          node2.x += moveX;
          node2.y += moveY;
        }
      }
    }
  }

  return adjustedNodes;
};

/**
 * Calculate link curves to avoid overlap when nodes have multiple connections
 * @param {Array} links Array of link objects
 * @param {Object} nodePositions Map of node IDs to x,y positions
 * @returns {Array} Links with path and control point data for curves
 */
export const calculateLinkCurves = (links, nodePositions) => {
  // Group links by source-target pairs
  const linkGroups = {};

  links.forEach((link) => {
    const sourceId =
      typeof link.source === "string" ? link.source : link.source.id;
    const targetId =
      typeof link.target === "string" ? link.target : link.target.id;
    const key = `${sourceId}-${targetId}`;

    if (!linkGroups[key]) {
      linkGroups[key] = [];
    }

    linkGroups[key].push(link);
  });

  // Calculate curves for each link
  return links.map((link) => {
    const sourceId =
      typeof link.source === "string" ? link.source : link.source.id;
    const targetId =
      typeof link.target === "string" ? link.target : link.target.id;
    const key = `${sourceId}-${targetId}`;

    // Get source and target positions
    const sourcePos = nodePositions[sourceId] || { x: 0, y: 0 };
    const targetPos = nodePositions[targetId] || { x: 0, y: 0 };

    // If only one link between these nodes, use a straight line
    if (linkGroups[key].length === 1) {
      return {
        ...link,
        path: d3.linkHorizontal()({
          source: [sourcePos.x, sourcePos.y],
          target: [targetPos.x, targetPos.y],
        }),
      };
    }

    // Otherwise, calculate a curve
    // Find the index of this link in the group
    const groupIndex = linkGroups[key].indexOf(link);
    const totalInGroup = linkGroups[key].length;

    // Calculate a curve based on the index
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Perpendicular offset for the control point
    const offset = 20 + 10 * groupIndex;
    const normalX = -dy / length;
    const normalY = dx / length;

    // Middle point for the control point
    const midX = (sourcePos.x + targetPos.x) / 2;
    const midY = (sourcePos.y + targetPos.y) / 2;

    // Control point
    const controlX = midX + normalX * offset;
    const controlY = midY + normalY * offset;

    // Create curved path
    return {
      ...link,
      path: `M${sourcePos.x},${sourcePos.y} Q${controlX},${controlY} ${targetPos.x},${targetPos.y}`,
      controlPoint: { x: controlX, y: controlY },
    };
  });
};
