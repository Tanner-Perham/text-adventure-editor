import * as d3 from "d3";
import { getColorScale } from "../utils/styleUtils";

/**
 * Render a flow chart visualisation of dialogue nodes
 * @param {Object} options Rendering options
 * @param {d3.Selection} options.container D3 selection of the container element
 * @param {Array} options.nodes Array of node objects
 * @param {Array} options.links Array of link objects
 * @param {Object} options.dimensions Width and height of the visualisation
 * @param {string} options.currentNodeId ID of the currently selected node
 * @param {Array} options.emotionalStates Array of possible emotional states
 * @param {boolean} options.showDetails Whether to show node details
 */
export const renderFlowChart = ({
  container,
  nodes,
  links,
  dimensions,
  currentNodeId,
  emotionalStates,
  showDetails = true,
}) => {
  // Debug output
  console.log("renderFlowChart - container:", container ? "exists" : "missing");
  console.log("renderFlowChart - nodes:", nodes ? nodes.length : 0);
  console.log("renderFlowChart - links:", links ? links.length : 0);
  console.log("renderFlowChart - dimensions:", dimensions);

  if (!container) {
    console.error("renderFlowChart - container is not defined");
    return;
  }

  if (!nodes || !nodes.length) {
    console.warn("renderFlowChart - no nodes to render");
    // Add a message to the container
    container
      .append("text")
      .attr("x", dimensions.width / 2)
      .attr("y", dimensions.height / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("No dialogue nodes to visualize");
    return;
  }

  // Clear existing elements
  container.selectAll("*").remove();

  // Make a deep copy of the nodes and links to avoid mutating the original data
  const graphNodes = JSON.parse(JSON.stringify(nodes));
  const graphLinks = JSON.parse(JSON.stringify(links));

  // Create color scale for emotional states
  const colorScale = getColorScale(emotionalStates);

  // Store simulation reference for later stopping
  let simulationRef = null;

  try {
    // Create link group first (so nodes render on top)
    const link = container
      .append("g")
      .attr("class", "links")
      .selectAll(".link-group")
      .data(graphLinks)
      .enter()
      .append("g")
      .attr("class", "link-group");

    // Add link lines with different styles
    link
      .append("line")
      .attr("class", "link")
      .attr("stroke", (d) => {
        if (d.linkType === "success") return "#10b981";
        if (d.linkType === "failure") return "#ef4444";
        return "#999";
      })
      .attr("stroke-width", (d) => (d.isSkillCheck ? 2 : 1))
      .attr("stroke-dasharray", (d) =>
        d.linkType === "failure" ? "5,5" : null,
      )
      .attr("marker-end", (d) => {
        if (d.linkType === "success") return "url(#arrowhead-success)";
        if (d.linkType === "failure") return "url(#arrowhead-failure)";
        return "url(#arrowhead)";
      });

    // Add link labels
    link
      .append("text")
      .attr("class", "link-label")
      .attr("dy", -5)
      .attr("text-anchor", "middle")
      .attr("font-size", "8px")
      .attr("fill", (d) => {
        if (d.linkType === "success") return "#10b981";
        if (d.linkType === "failure") return "#ef4444";
        return "#666";
      })
      .text((d) => d.label || "");

    // Create node groups
    const node = container
      .append("g")
      .attr("class", "nodes")
      .selectAll(".node")
      .data(graphNodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("data-node-id", (d) => d.id);

    // Add node circles
    node
      .append("circle")
      .attr("r", 25)
      .attr("fill", (d) => colorScale(d.emotional_state))
      .attr("stroke", (d) => (d.id === currentNodeId ? "#ff0000" : "#fff"))
      .attr("stroke-width", (d) => (d.id === currentNodeId ? 3 : 1));

    // Add quest indicator if applicable
    node
      .filter((d) => d.questRelated)
      .append("path")
      .attr("d", "M-25,0 L-15,0")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 3);

    // Add node details if enabled
    if (showDetails) {
      // Add speaker labels
      node
        .append("text")
        .attr("class", "speaker-label")
        .attr("dy", -30)
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .attr("font-size", "10px")
        .text((d) => d.speaker || "");

      // Add node text preview
      node
        .append("text")
        .attr("class", "node-text")
        .attr("dy", 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "8px")
        .text((d) => d.text || "");
    }

    // Add node ID labels (always shown)
    node
      .append("text")
      .attr("class", "node-id")
      .attr("dy", 0)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text((d) => d.id);

    // Create a force simulation
    const simulation = d3
      .forceSimulation(graphNodes)
      .force(
        "link",
        d3
          .forceLink(graphLinks)
          .id((d) => d.id)
          .distance(150),
      )
      .force("charge", d3.forceManyBody().strength(-500))
      // Center the simulation in the middle of the viewport
      .force(
        "center",
        d3.forceCenter(dimensions.width / 2, dimensions.height / 2),
      )
      .force("collide", d3.forceCollide(50))
      // Add x and y forces to keep nodes within viewport, but with a weaker strength
      .force("x", d3.forceX(dimensions.width / 2).strength(0.03))
      .force("y", d3.forceY(dimensions.height / 2).strength(0.03))
      .alphaDecay(0.028); // Slower decay for better layout

    // Store for later use
    simulationRef = simulation;

    // Set up drag behavior
    const drag = d3
      .drag()
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded);

    // Apply drag behavior to nodes
    node.call(drag).style("cursor", "grab");

    // Update positions on each simulation tick
    simulation.on("tick", () => {
      // Update link positions
      link
        .selectAll("line")
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      // Update link label positions
      link
        .selectAll("text")
        .attr("x", (d) => (d.source.x + d.target.x) / 2)
        .attr("y", (d) => (d.source.y + d.target.y) / 2);

      // Update node positions
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Stop simulation after initial layout (important!)
    simulation.on("end", () => {
      // Copy final positions to node objects
      graphNodes.forEach((node) => {
        node.fx = node.x;
        node.fy = node.y;
      });
    });

    // Drag handlers
    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;

      // Add active class for styling
      d3.select(this).classed("dragging", true).style("cursor", "grabbing");
    }

    function dragged(event, d) {
      // Set fixed position during drag
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event, d) {
      if (!event.active) simulation.alphaTarget(0);

      // IMPORTANT: Don't reset the fixed position
      // This keeps the node where it was dragged
      // d.fx = null;
      // d.fy = null;

      // Remove active class
      d3.select(this).classed("dragging", false).style("cursor", "grab");
    }

    console.log("renderFlowChart - visualisation rendered successfully");
  } catch (error) {
    console.error("Error in renderFlowChart:", error);

    // Add an error message to the container
    container
      .append("text")
      .attr("x", dimensions.width / 2)
      .attr("y", dimensions.height / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "red")
      .text("Error rendering visualisation");
  }

  // Return cleanup function to stop simulation when needed
  return () => {
    if (simulationRef) {
      simulationRef.stop();
    }
  };
};
