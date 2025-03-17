import * as d3 from "d3";
import { getColorScale } from "../utils/styleUtils";
import { findAllPaths } from "../utils/pathFindingUtils";

/**
 * Render a timeline visualisation of dialogue paths
 * @param {Object} options Rendering options
 * @param {d3.Selection} options.container D3 selection of the container element
 * @param {Object} options.dialogueTrees Dialogue trees data
 * @param {string} options.startNodeId Starting node ID
 * @param {Object} options.dimensions Width and height of the visualisation
 * @param {string} options.currentNodeId ID of the currently selected node
 * @param {Array} options.emotionalStates Array of possible emotional states
 * @param {boolean} options.showDetails Whether to show node details
 * @returns {Function} Cleanup function
 */
export const renderTimelineView = ({
  container,
  dialogueTrees,
  startNodeId,
  dimensions,
  currentNodeId,
  emotionalStates,
  showDetails = true,
}) => {
  if (!container || !dialogueTrees) return () => {};

  // Clear existing elements
  container.selectAll("*").remove();

  // If no startNodeId provided, use the first node
  if (!startNodeId && Object.keys(dialogueTrees).length > 0) {
    startNodeId = Object.keys(dialogueTrees)[0];
  }

  // Get dimensions and create color scale
  const { width, height } = dimensions;
  const colorScale = getColorScale(emotionalStates);

  // Find all possible paths through the dialogue
  const paths = findAllPaths(dialogueTrees, startNodeId);

  // Limit to a reasonable number of paths to avoid overcrowding
  const displayPaths = paths.slice(0, 10);

  // Set up the vertical spacing between paths
  const pathHeight = 120; // Increase spacing between paths
  const nodeRadius = 20;
  const nodeSpacing = 150;

  // Create simulation to manage node positioning
  const allSimNodes = [];
  const nodeGroups = [];

  // Create a map to track nodes by id across different paths
  const nodeIdMap = new Map();

  // Create container for all paths
  const pathsContainer = container
    .append("g")
    .attr("class", "paths-container")
    .attr("transform", "translate(20, 20)");

  // For each path, create a timeline
  displayPaths.forEach((path, pathIndex) => {
    const pathGroup = pathsContainer
      .append("g")
      .attr("class", "path-group")
      .attr("transform", `translate(0, ${pathIndex * pathHeight})`);

    // Create horizontal line for the path
    pathGroup
      .append("line")
      .attr("class", "path-line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", nodeSpacing * (path.length > 1 ? path.length - 1 : 1))
      .attr("y2", 0)
      .attr("stroke", "#ccc")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Add nodes along the path
    path.forEach((item, nodeIndex) => {
      // Skip connector items
      if (item.type === "option") {
        // Draw connector with appropriate styling
        const x1 = nodeIndex * nodeSpacing;
        const x2 = (nodeIndex + 1) * nodeSpacing;

        pathGroup
          .append("line")
          .attr("x1", x1 + nodeRadius)
          .attr("y1", 0)
          .attr("x2", x2 - nodeRadius)
          .attr("y2", 0)
          .attr(
            "stroke",
            item.result === "success"
              ? "#10b981"
              : item.result === "failure"
                ? "#ef4444"
                : "#999",
          )
          .attr("stroke-width", item.hasSkillCheck ? 2 : 1)
          .attr("stroke-dasharray", item.result === "failure" ? "5,5" : null)
          .attr(
            "marker-end",
            item.result === "success"
              ? "url(#arrowhead-success)"
              : item.result === "failure"
                ? "url(#arrowhead-failure)"
                : "url(#arrowhead)",
          );

        // Add option text
        if (item.text) {
          pathGroup
            .append("text")
            .attr("class", "option-text")
            .attr("x", (x1 + x2) / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .attr("font-size", "8px")
            .attr("pointer-events", "none")
            .attr(
              "fill",
              item.result === "success"
                ? "#10b981"
                : item.result === "failure"
                  ? "#ef4444"
                  : "#666",
            )
            .text(() => {
              const text = item.text;
              return text.length > 15 ? text.substring(0, 15) + "..." : text;
            });
        }

        return;
      }

      // Skip missing nodes
      if (item.isMissing) {
        return;
      }

      const node = dialogueTrees[item.id];
      if (!node) return;

      // Position calculation for this node
      const baseX = nodeIndex * nodeSpacing;

      // Create simulation node if it doesn't exist
      let simNode = allSimNodes.find((n) => n.id === item.id);

      if (!simNode) {
        simNode = {
          id: item.id,
          x: baseX,
          y: 0,
          fy: 0, // Fix y position to timeline
          baseX: baseX, // Store original x position
          fx: baseX, // Initially fix x position
          nodeIndexes: [nodeIndex],
          pathIndexes: [pathIndex],
        };
        allSimNodes.push(simNode);
      } else {
        // Update existing node with this occurrence
        simNode.nodeIndexes.push(nodeIndex);
        simNode.pathIndexes.push(pathIndex);

        // Calculate average position if node appears in multiple places
        const avgNodeIndex =
          simNode.nodeIndexes.reduce((sum, idx) => sum + idx, 0) /
          simNode.nodeIndexes.length;
        simNode.baseX = avgNodeIndex * nodeSpacing;
      }

      const nodeGroup = pathGroup
        .append("g")
        .attr("class", "node")
        .attr("data-node-id", item.id)
        .attr("transform", `translate(${baseX}, 0)`);

      // Store reference to this visual node group
      nodeGroups.push({
        node: nodeGroup,
        simNode: simNode,
        pathIndex: pathIndex,
      });

      // Add node circle
      nodeGroup
        .append("circle")
        .attr("r", nodeRadius)
        .attr("fill", colorScale(node.emotional_state))
        .attr("stroke", item.id === currentNodeId ? "#ff0000" : "#fff")
        .attr("stroke-width", item.id === currentNodeId ? 3 : 1)
        .attr("opacity", item.isCycle ? 0.7 : 1);

      // Add cycle indicator
      if (item.isCycle) {
        nodeGroup
          .append("text")
          .attr("x", 0)
          .attr("y", 0)
          .attr("dy", "0.3em")
          .attr("text-anchor", "middle")
          .attr("font-size", "14px")
          .attr("fill", "#333")
          .attr("pointer-events", "none")
          .text("↩");
      } else {
        // Add node ID
        nodeGroup
          .append("text")
          .attr("x", 0)
          .attr("y", 0)
          .attr("dy", "0.3em")
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .attr("pointer-events", "none")
          .text(item.id);
      }

      // Add node details if enabled
      if (showDetails && !item.isCycle) {
        // Add speaker name
        nodeGroup
          .append("text")
          .attr("x", 0)
          .attr("y", -nodeRadius - 10)
          .attr("text-anchor", "middle")
          .attr("font-weight", "bold")
          .attr("font-size", "8px")
          .attr("pointer-events", "none")
          .text(node.speaker || "");

        // Add dialogue text below
        nodeGroup
          .append("text")
          .attr("x", 0)
          .attr("y", nodeRadius + 15)
          .attr("text-anchor", "middle")
          .attr("font-size", "8px")
          .attr("pointer-events", "none")
          .text(() => {
            const text = node.text;
            return text && text.length > 20
              ? text.substring(0, 20) + "..."
              : text || "";
          });
      }

      // Set up drag behavior for this node
      nodeGroup
        .call(
          d3
            .drag()
            .on("start", function (event) {
              dragStarted(event, simNode);
            })
            .on("drag", function (event) {
              dragged(event, simNode);
            })
            .on("end", function (event) {
              dragEnded(event, simNode);
            }),
        )
        .style("cursor", "grab");
    });

    // Add path number label
    pathGroup
      .append("text")
      .attr("x", -10)
      .attr("y", 0)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text(`Path ${pathIndex + 1}`);
  });

  // Create simulation
  const simulation = d3
    .forceSimulation(allSimNodes)
    .force("x", d3.forceX((d) => d.baseX).strength(0.5)) // Pull toward original position
    .force("collide", d3.forceCollide(nodeRadius * 1.2).strength(0.7)) // Prevent overlap
    .alphaDecay(0.02);

  // Drag event handlers
  function dragStarted(event, d) {
    simulation.alphaTarget(0.3).restart();

    // Allow horizontal movement during drag
    d.fx = null;

    d3.selectAll(".node")
      .filter(function () {
        return d3.select(this).attr("data-node-id") === d.id;
      })
      .classed("dragging", true)
      .style("cursor", "grabbing");
  }

  function dragged(event, d) {
    // Update position (only horizontal movement allowed)
    d.x = event.x;

    // Update all node instances with this ID
    updateAllNodePositions();
  }

  function dragEnded(event, d) {
    simulation.alphaTarget(0);

    // Fix the node at its final position
    d.fx = d.x;

    d3.selectAll(".node")
      .filter(function () {
        return d3.select(this).attr("data-node-id") === d.id;
      })
      .classed("dragging", false)
      .style("cursor", "grab");
  }

  // Update positions of all nodes based on simulation
  function updateAllNodePositions() {
    nodeGroups.forEach((group) => {
      const { node, simNode } = group;

      // Update node position
      node.attr("transform", `translate(${simNode.x}, ${simNode.y})`);
    });
  }

  // Set up tick handler
  simulation.on("tick", updateAllNodePositions);

  // Run simulation for a bit and then stop
  simulation.restart().alpha(0.3).alphaDecay(0.02);

  // Return cleanup function
  return () => {
    if (simulation) {
      simulation.stop();
    }
  };
};
