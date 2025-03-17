import * as d3 from "d3";
import { getColorScale } from "../utils/styleUtils";

/**
 * Render a hierarchical tree visualisation of dialogue nodes
 * @param {Object} options Rendering options
 * @param {d3.Selection} options.container D3 selection of the container element
 * @param {Object} options.graphStructure Hierarchical graph structure
 * @param {Object} options.dimensions Width and height of the visualisation
 * @param {string} options.currentNodeId ID of the currently selected node
 * @param {Array} options.emotionalStates Array of possible emotional states
 * @param {boolean} options.showDetails Whether to show node details
 * @returns {Function} Cleanup function
 */
export const renderTreeView = ({
  container,
  graphStructure,
  dimensions,
  currentNodeId,
  emotionalStates,
  showDetails = true,
}) => {
  if (!container || !graphStructure) return () => {};

  // Debug the graph structure
  console.log("Tree view - graph structure:", graphStructure);

  // Clear existing elements
  container.selectAll("*").remove();

  // Get dimensions and create color scale
  const { width, height } = dimensions;
  const colorScale = getColorScale(emotionalStates);

  // Create tree layout with proper sizing
  const treeLayout = d3
    .tree()
    .size([height - 100, width - 200])
    .nodeSize([80, 150]); // Give nodes more space to prevent overlap

  // Create hierarchy from the graph structure
  const root = d3.hierarchy(graphStructure);

  // Apply the tree layout to the hierarchy
  treeLayout(root);

  // Debug the hierarchy tree
  console.log("Tree view - hierarchy:", root);
  console.log(
    "Tree view - path types in hierarchy:",
    root.links().map((link) => ({
      sourceId: link.source.data.id,
      targetId: link.target.data.id,
      pathType: link.target.data.pathType,
      optionText: link.target.data.optionText,
    })),
  );

  // Convert hierarchy nodes to simulation nodes
  const simulationNodes = root.descendants().map((d) => ({
    id: d.data.id,
    x: d.y, // Note: d3.tree swaps x/y for horizontal layout
    y: d.x,
    depth: d.depth,
    pathType: d.data.pathType,
    fx: d.y, // Fix x position to maintain hierarchical levels
  }));

  // Create a simulation for better node placement
  const simulation = d3
    .forceSimulation(simulationNodes)
    .force("collide", d3.forceCollide(40).strength(0.7))
    .force("y", d3.forceY((d) => d.depth * 80).strength(0.1)) // Use depth for y-positioning
    .alpha(0.3)
    .alphaDecay(0.02);

  // Run simulation for initial positioning
  for (let i = 0; i < 100; i++) {
    simulation.tick();
  }

  // Create container for links
  const linksGroup = container.append("g").attr("class", "links");

  // Create links
  const links = linksGroup
    .selectAll(".link")
    .data(root.links())
    .join("path")
    .attr("class", (d) => `link ${d.target.data.pathType || "normal"}-link`)
    .attr("d", (d) => {
      // Find corresponding simulation nodes
      const source = simulationNodes.find((n) => n.id === d.source.data.id);
      const target = simulationNodes.find((n) => n.id === d.target.data.id);

      if (!source || !target) {
        console.warn("Link missing simulation node:", d);
        return d3
          .linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)(d);
      }

      // Use simulation positions
      return d3.linkHorizontal()({
        source: [source.x, source.y],
        target: [target.x, target.y],
      });
    })
    .attr("fill", "none")
    .attr("stroke", (d) => {
      // Get path type from the link target data
      const pathType = d.target.data.pathType;
      if (pathType === "success") return "#10b981"; // Success green
      if (pathType === "failure") return "#ef4444"; // Failure red
      return "#999"; // Default grey
    })
    .attr("stroke-width", (d) => (d.target.data.pathType !== "normal" ? 2 : 1))
    .attr("stroke-dasharray", (d) =>
      d.target.data.pathType === "failure" ? "5,5" : null,
    )
    .attr("marker-end", (d) => {
      const pathType = d.target.data.pathType;
      if (pathType === "success") return "url(#arrowhead-success)";
      if (pathType === "failure") return "url(#arrowhead-failure)";
      return "url(#arrowhead)";
    });

  // Create link labels
  const linkLabels = container
    .append("g")
    .attr("class", "link-labels")
    .selectAll(".link-label")
    .data(root.links())
    .join("g")
    .attr("class", "link-label")
    .attr("transform", (d) => {
      const source = simulationNodes.find((n) => n.id === d.source.data.id);
      const target = simulationNodes.find((n) => n.id === d.target.data.id);

      if (!source || !target) {
        return `translate(${(d.source.y + d.target.y) / 2}, ${(d.source.x + d.target.x) / 2 - 10})`;
      }

      return `translate(${(source.x + target.x) / 2}, ${(source.y + target.y) / 2 - 10})`;
    });

  // Add label backgrounds
  linkLabels
    .append("rect")
    .attr("x", -25)
    .attr("y", -10)
    .attr("width", (d) => {
      let text = "";
      if (d.target.data.pathType === "success") text = "Success";
      else if (d.target.data.pathType === "failure") text = "Failure";
      else if (d.target.data.optionText) {
        text = d.target.data.optionText;
        text = text.length > 20 ? text.substring(0, 20) + "..." : text;
      }
      return Math.max(text.length * 4 + 10, 30);
    })
    .attr("height", 16)
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("fill", "white")
    .attr("fill-opacity", 0.9)
    .attr("stroke", (d) => {
      const pathType = d.target.data.pathType;
      if (pathType === "success") return "#10b981";
      if (pathType === "failure") return "#ef4444";
      return "#ccc";
    })
    .attr("stroke-width", 1);

  // Add label text
  linkLabels
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr("font-size", "10px")
    .attr("font-weight", (d) =>
      d.target.data.pathType !== "normal" ? "bold" : "normal",
    )
    .attr("fill", (d) => {
      const pathType = d.target.data.pathType;
      if (pathType === "success") return "#10b981";
      if (pathType === "failure") return "#ef4444";
      return "#666";
    })
    .text((d) => {
      const pathType = d.target.data.pathType;
      if (pathType === "success") return "Success";
      if (pathType === "failure") return "Failure";
      if (d.target.data.optionText) {
        const text = d.target.data.optionText;
        return text.length > 20 ? text.substring(0, 20) + "..." : text;
      }
      return "";
    });

  // Create node groups
  const nodeGroups = container
    .append("g")
    .attr("class", "nodes")
    .selectAll(".node")
    .data(root.descendants())
    .join("g")
    .attr("class", (d) => `node ${d.data.pathType || "normal"}-node`)
    .attr("data-node-id", (d) => d.data.id)
    .attr("transform", (d) => {
      const simNode = simulationNodes.find((n) => n.id === d.data.id);
      return simNode
        ? `translate(${simNode.x}, ${simNode.y})`
        : `translate(${d.y}, ${d.x})`;
    });

  // Add node circles
  nodeGroups
    .append("circle")
    .attr("r", 25)
    .attr("fill", (d) => {
      if (d.data.referenceNode) return "#f0f0f0"; // Reference nodes are lighter
      return colorScale(d.data.emotional_state);
    })
    .attr("stroke", (d) => {
      if (d.data.id === currentNodeId) return "#ff0000";

      // Path-type specific styling
      const pathType = d.data.pathType;
      if (pathType === "success") return "#10b981";
      if (pathType === "failure") return "#ef4444";

      if (d.data.referenceNode) return "#999";
      return "#fff";
    })
    .attr("stroke-width", (d) => {
      if (d.data.id === currentNodeId) return 3;
      if (d.data.pathType !== "normal") return 2;
      return 1;
    })
    .attr("opacity", (d) => (d.data.referenceNode ? 0.7 : 1));

  // Add quest indicator if applicable
  nodeGroups
    .filter((d) => d.data.questRelated)
    .append("path")
    .attr("d", "M-25,0 L-15,0")
    .attr("stroke", "#f59e0b")
    .attr("stroke-width", 3);

  // Add node ID labels (always shown)
  nodeGroups
    .append("text")
    .attr("class", "node-id")
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .attr("pointer-events", "none")
    .text((d) => {
      if (d.data.referenceNode) return `${d.data.name} (ref)`;
      return d.data.name || d.data.id;
    });

  // Add node details if enabled
  if (showDetails) {
    // Add speaker labels
    nodeGroups
      .append("text")
      .attr("class", "speaker-label")
      .attr("dy", -30)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("font-size", "10px")
      .attr("pointer-events", "none")
      .text((d) => d.data.speaker || "");

    // Add node text preview
    nodeGroups
      .append("text")
      .attr("class", "node-text")
      .attr("dy", 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "8px")
      .attr("pointer-events", "none")
      .text((d) => d.data.text || "");
  }

  // Add path type indicator badges for success/failure nodes
  nodeGroups
    .filter(
      (d) => d.data.pathType === "success" || d.data.pathType === "failure",
    )
    .append("circle")
    .attr("class", "node-badge")
    .attr("r", 8)
    .attr("cx", 20)
    .attr("cy", -20)
    .attr("fill", (d) =>
      d.data.pathType === "success" ? "#10b981" : "#ef4444",
    )
    .attr("stroke", "#fff")
    .attr("stroke-width", 1);

  nodeGroups
    .filter((d) => d.data.pathType === "success")
    .append("text")
    .attr("x", 20)
    .attr("y", -20)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .attr("fill", "#fff")
    .attr("pointer-events", "none")
    .text("✓");

  nodeGroups
    .filter((d) => d.data.pathType === "failure")
    .append("text")
    .attr("x", 20)
    .attr("y", -20)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .attr("fill", "#fff")
    .attr("pointer-events", "none")
    .text("×");

  // Setup drag behavior
  nodeGroups
    .call(
      d3
        .drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded),
    )
    .style("cursor", "grab");

  // Drag event handlers
  function dragStarted(event, d) {
    simulation.alphaTarget(0.3).restart();

    // Find and update the simulation node
    const simNode = simulationNodes.find((n) => n.id === d.data.id);
    if (simNode) {
      simNode.fy = simNode.y;
      // Don't set fx to allow only vertical movement
    }

    d3.select(this).classed("dragging", true).style("cursor", "grabbing");
  }

  function dragged(event, d) {
    // Find and update the simulation node - only allow vertical movement
    const simNode = simulationNodes.find((n) => n.id === d.data.id);
    if (simNode) {
      simNode.fy = event.y;
      // Don't update fx to preserve tree structure
    }

    // Update positions
    updatePositions();
  }

  function dragEnded(event, d) {
    simulation.alphaTarget(0);

    // Keep the node fixed where it was dragged
    const simNode = simulationNodes.find((n) => n.id === d.data.id);
    if (simNode) {
      // Keep fy fixed to maintain position
    }

    d3.select(this).classed("dragging", false).style("cursor", "grab");
  }

  // Update positions of nodes and links based on simulation
  function updatePositions() {
    // Update node positions
    nodeGroups.attr("transform", (d) => {
      const simNode = simulationNodes.find((n) => n.id === d.data.id);
      return simNode
        ? `translate(${simNode.x}, ${simNode.y})`
        : `translate(${d.y}, ${d.x})`;
    });

    // Update link paths
    links.attr("d", (d) => {
      const source = simulationNodes.find((n) => n.id === d.source.data.id);
      const target = simulationNodes.find((n) => n.id === d.target.data.id);

      if (!source || !target) {
        return d3
          .linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)(d);
      }

      return d3.linkHorizontal()({
        source: [source.x, source.y],
        target: [target.x, target.y],
      });
    });

    // Update link label positions
    linkLabels.attr("transform", (d) => {
      const source = simulationNodes.find((n) => n.id === d.source.data.id);
      const target = simulationNodes.find((n) => n.id === d.target.data.id);

      if (!source || !target) {
        return `translate(${(d.source.y + d.target.y) / 2}, ${(d.source.x + d.target.x) / 2 - 10})`;
      }

      return `translate(${(source.x + target.x) / 2}, ${(source.y + target.y) / 2 - 10})`;
    });
  }

  // Setup simulation to respond to ticks
  simulation.on("tick", updatePositions);

  // Return cleanup function
  return () => {
    if (simulation) {
      simulation.stop();
    }
  };
};
