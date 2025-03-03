import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const Visualisation = ({
  dialogueTrees,
  currentNode,
  emotionalStates,
  viewMode, // "flow", "tree", or "timeline"
  showNodeDetails,
  onViewModeChange,
  onShowNodeDetailsChange,
  onNodeSelect,
}) => {
  const svgRef = useRef(null);

  // D3 Visualization Effect
  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    // Create graph data structure
    const nodes = Object.entries(dialogueTrees).map(([id, node]) => ({
      id,
      speaker: node.speaker,
      text:
        node.text.length > 30 ? node.text.substring(0, 30) + "..." : node.text,
      emotional_state: node.emotional_state,
    }));

    const links = [];
    Object.entries(dialogueTrees).forEach(([sourceId, node]) => {
      if (node.options) {
        node.options.forEach((option) => {
          if (option.next_node && dialogueTrees[option.next_node]) {
            links.push({
              source: sourceId,
              target: option.next_node,
              label:
                option.text.length > 20
                  ? option.text.substring(0, 20) + "..."
                  : option.text,
            });
          }
        });
      }
    });

    // Set up SVG container
    const width = 900;
    const height = 600;
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Create a group for the entire visualization
    const g = svg.append("g");

    // Create a zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Define arrowhead marker
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999");

    // Color scale for emotional states
    const colorScale = d3
      .scaleOrdinal()
      .domain(emotionalStates)
      .range(d3.schemeCategory10);

    // Choose visualization based on viewMode
    if (viewMode === "flow") {
      renderFlowChart(g, nodes, links, colorScale);

      // Reset zoom to fit the content for flow chart
      svg.call(
        zoom.transform,
        d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8),
      );
    } else if (viewMode === "tree") {
      renderTreeView(g, nodes, links, colorScale, width, height);

      // Reset zoom to fit the content for tree view
      svg.call(
        zoom.transform,
        d3.zoomIdentity.translate(width / 2, 50).scale(0.7),
      );
    } else if (viewMode === "timeline") {
      renderTimelineView(g, nodes, links, colorScale, width, height);

      // Reset zoom to fit the content for timeline view
      svg.call(
        zoom.transform,
        d3.zoomIdentity.translate(100, height / 2).scale(0.8),
      );
    }

    // Helper function to render the Flow Chart view
    function renderFlowChart(g, nodes, links, colorScale) {
      // Set up force simulation
      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d) => d.id)
            .distance(150),
        )
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(0, 0))
        .force("collide", d3.forceCollide(50));

      // Add links
      const link = g
        .append("g")
        .selectAll("line")
        .data(links)
        .enter()
        .append("g");

      link
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead)");

      // Add link labels (for dialogue options)
      link
        .append("text")
        .attr("dy", -5)
        .attr("text-anchor", "middle")
        .attr("font-size", "8px")
        .attr("fill", "#666")
        .text((d) => d.label);

      // Add node groups
      const node = g
        .append("g")
        .selectAll(".node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(
          d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended),
        )
        .on("click", (event, d) => {
          onNodeSelect(d.id);
        });

      // Add node circles
      node
        .append("circle")
        .attr("r", 25)
        .attr("fill", (d) => colorScale(d.emotional_state))
        .attr("stroke", (d) => (d.id === currentNode ? "#ff0000" : "#fff"))
        .attr("stroke-width", (d) => (d.id === currentNode ? 3 : 1));

      if (showNodeDetails) {
        // Add node labels (speaker)
        node
          .append("text")
          .attr("dy", -30)
          .attr("text-anchor", "middle")
          .attr("font-weight", "bold")
          .text((d) => d.speaker);

        // Add node text
        node
          .append("text")
          .attr("dy", 40)
          .attr("text-anchor", "middle")
          .attr("font-size", "8px")
          .text((d) => d.text);
      }

      // Add node ID labels
      node
        .append("text")
        .attr("dy", 0)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text((d) => d.id);

      // Update positions on simulation tick
      simulation.on("tick", () => {
        link
          .selectAll("line")
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        link
          .selectAll("text")
          .attr("x", (d) => (d.source.x + d.target.x) / 2)
          .attr("y", (d) => (d.source.y + d.target.y) / 2);

        node.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
      });

      // Drag functions
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    }

    // Helper function to render the Tree View
    function renderTreeView(g, nodes, links, colorScale, width, height) {
      // Create hierarchical structure from nodes and links
      const hierarchy = createHierarchy(nodes, links);

      // Create a tree layout
      const treeLayout = d3.tree().size([width - 100, height - 100]);

      const root = d3.hierarchy(hierarchy);
      treeLayout(root);

      // Draw links
      g.append("g")
        .attr("fill", "none")
        .attr("stroke", "#999")
        .attr("stroke-width", 2)
        .selectAll("path")
        .data(root.links())
        .join("path")
        .attr(
          "d",
          d3
            .linkHorizontal()
            .x((d) => d.y) // Flip x and y for horizontal layout
            .y((d) => d.x),
        )
        .attr("marker-end", "url(#arrowhead)");

      // Add link labels
      const linkLabels = g
        .append("g")
        .selectAll("text")
        .data(root.links())
        .join("text")
        .attr("font-size", "8px")
        .attr("fill", "#666")
        .attr("dy", -5);

      // Find the corresponding original link for each hierarchical link
      linkLabels.each(function (d) {
        const sourceId = d.source.data.id;
        const targetId = d.target.data.id;
        const originalLink = links.find(
          (link) => link.source === sourceId && link.target === targetId,
        );

        if (originalLink) {
          d3.select(this)
            .attr("x", (d.source.y + d.target.y) / 2)
            .attr("y", (d.source.x + d.target.x) / 2)
            .attr("text-anchor", "middle")
            .text(originalLink.label);
        }
      });

      // Draw nodes
      const node = g
        .append("g")
        .selectAll(".node")
        .data(root.descendants())
        .join("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.y}, ${d.x})`) // Flip x and y for horizontal layout
        .on("click", (event, d) => {
          onNodeSelect(d.data.id);
        });

      // Add node circles
      node
        .append("circle")
        .attr("r", 25)
        .attr("fill", (d) => colorScale(d.data.emotional_state))
        .attr("stroke", (d) => (d.data.id === currentNode ? "#ff0000" : "#fff"))
        .attr("stroke-width", (d) => (d.data.id === currentNode ? 3 : 1));

      if (showNodeDetails) {
        // Add node labels (speaker)
        node
          .append("text")
          .attr("dy", -30)
          .attr("text-anchor", "middle")
          .attr("font-weight", "bold")
          .text((d) => d.data.speaker);

        // Add node text
        node
          .append("text")
          .attr("dy", 40)
          .attr("text-anchor", "middle")
          .attr("font-size", "8px")
          .text((d) => d.data.text);
      }

      // Add node ID labels
      node
        .append("text")
        .attr("dy", 0)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text((d) => d.data.id);
    }

    // Helper function to render the Timeline View
    function renderTimelineView(g, nodes, links, colorScale, width, height) {
      // Find all possible paths through the dialogue
      const paths = findAllPaths(nodes, links);

      // Set up the vertical spacing between paths
      const pathHeight = 100;
      const nodeRadius = 20;
      const nodeSpacing = 150;

      // For each path, create a timeline
      paths.forEach((path, pathIndex) => {
        const pathGroup = g
          .append("g")
          .attr("transform", `translate(0, ${pathIndex * pathHeight})`);

        // Create horizontal line for the path
        pathGroup
          .append("line")
          .attr("x1", 50)
          .attr("y1", 0)
          .attr("x2", 50 + (path.length - 1) * nodeSpacing)
          .attr("y2", 0)
          .attr("stroke", "#ccc")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");

        // Add nodes along the path
        path.forEach((nodeId, nodeIndex) => {
          const nodeData = nodes.find((n) => n.id === nodeId);
          if (!nodeData) return;

          const nodeGroup = pathGroup
            .append("g")
            .attr("transform", `translate(${50 + nodeIndex * nodeSpacing}, 0)`)
            .on("click", () => onNodeSelect(nodeId));

          // Add node circle
          nodeGroup
            .append("circle")
            .attr("r", nodeRadius)
            .attr("fill", colorScale(nodeData.emotional_state))
            .attr("stroke", nodeId === currentNode ? "#ff0000" : "#fff")
            .attr("stroke-width", nodeId === currentNode ? 3 : 1);

          // Add node ID
          nodeGroup
            .append("text")
            .attr("dy", 0)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("font-weight", "bold")
            .text(nodeId);

          if (showNodeDetails) {
            // Add speaker name
            nodeGroup
              .append("text")
              .attr("dy", -30)
              .attr("text-anchor", "middle")
              .attr("font-weight", "bold")
              .text(nodeData.speaker);

            // Add dialogue text below
            nodeGroup
              .append("text")
              .attr("dy", 35)
              .attr("text-anchor", "middle")
              .attr("font-size", "8px")
              .text(nodeData.text);
          }

          // Connect to next node with arrow if not the last one
          if (nodeIndex < path.length - 1) {
            const nextNodeId = path[nodeIndex + 1];

            // Find the original link to get the label text
            const linkData = links.find(
              (l) => l.source === nodeId && l.target === nextNodeId,
            );

            // Draw connector line with arrow
            pathGroup
              .append("line")
              .attr("x1", 50 + nodeIndex * nodeSpacing + nodeRadius)
              .attr("y1", 0)
              .attr("x2", 50 + (nodeIndex + 1) * nodeSpacing - nodeRadius)
              .attr("y2", 0)
              .attr("stroke", "#999")
              .attr("stroke-width", 2)
              .attr("marker-end", "url(#arrowhead)");

            // Add option text as link label
            if (linkData) {
              pathGroup
                .append("text")
                .attr("x", 50 + nodeIndex * nodeSpacing + nodeSpacing / 2)
                .attr("y", -10)
                .attr("text-anchor", "middle")
                .attr("font-size", "8px")
                .attr("fill", "#666")
                .text(linkData.label);
            }
          }
        });
      });
    }

    // Helper function to create hierarchy for tree view
    function createHierarchy(nodes, links) {
      // Find the entry nodes (nodes that have no incoming links)
      const targetIds = links.map((link) => link.target);
      const rootNodes = nodes.filter((node) => !targetIds.includes(node.id));

      // If no entry nodes found, just pick the first node
      const rootNode = rootNodes.length > 0 ? rootNodes[0] : nodes[0];

      // Build the tree recursively
      function buildTree(nodeId, visited = new Set()) {
        if (visited.has(nodeId)) {
          // Avoid cycles
          return { id: nodeId, name: nodeId + " (cycle)", children: [] };
        }

        visited.add(nodeId);

        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return null;

        const outgoingLinks = links.filter((link) => link.source === nodeId);
        const children = outgoingLinks
          .map((link) => buildTree(link.target, new Set(visited)))
          .filter(Boolean);

        return {
          id: node.id,
          name: node.id,
          speaker: node.speaker,
          text: node.text,
          emotional_state: node.emotional_state,
          children: children,
        };
      }

      return buildTree(rootNode.id);
    }

    // Helper function to find all paths through the dialogue
    function findAllPaths(nodes, links) {
      // Find entry points (nodes with no incoming links)
      const targetIds = links.map((link) => link.target);
      const rootNodeIds = nodes
        .filter((node) => !targetIds.includes(node.id))
        .map((node) => node.id);

      // If no entry points found, use the first node
      const startNodeIds =
        rootNodeIds.length > 0
          ? rootNodeIds
          : nodes.length > 0
            ? [nodes[0].id]
            : [];

      const allPaths = [];

      // Find all paths from each entry point
      startNodeIds.forEach((startId) => {
        const paths = [];

        function traversePath(nodeId, currentPath = [], visited = new Set()) {
          // Avoid infinite loops by detecting cycles
          if (visited.has(nodeId)) {
            paths.push([...currentPath, nodeId + "*"]); // Mark as cyclic
            return;
          }

          const newPath = [...currentPath, nodeId];
          const newVisited = new Set(visited).add(nodeId);

          // Find outgoing links
          const outgoingLinks = links.filter((link) => link.source === nodeId);

          if (outgoingLinks.length === 0) {
            // End of path
            paths.push(newPath);
            return;
          }

          // Continue path for each option
          outgoingLinks.forEach((link) => {
            traversePath(link.target, newPath, newVisited);
          });
        }

        traversePath(startId);
        allPaths.push(...paths);
      });

      // Sort by length and limit to a reasonable number to avoid overcrowding
      return allPaths.sort((a, b) => b.length - a.length).slice(0, 10); // Limit to 10 paths for readability
    }
  }, [
    dialogueTrees,
    currentNode,
    emotionalStates,
    showNodeDetails,
    viewMode,
    onNodeSelect,
  ]);

  return (
    <div className="visualization-container">
      <div className="visualization-toolbar">
        <h2 className="panel-title">Dialogue Visualisation</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              className="mr-2"
              checked={showNodeDetails}
              onChange={(e) => onShowNodeDetailsChange(e.target.checked)}
            />
            Show Node Details
          </label>

          <div className="flex items-center gap-2">
            <span className="text-sm">View Mode:</span>
            <select
              className="select-field"
              value={viewMode}
              onChange={(e) => onViewModeChange(e.target.value)}
            >
              <option value="flow">Flow Chart</option>
              <option value="tree">Tree</option>
              <option value="timeline">Timeline</option>
            </select>
          </div>
        </div>
      </div>

      <div className="visualization-content">
        <svg
          ref={svgRef}
          className="visualization-svg"
          width="100%"
          height="100%"
        ></svg>
      </div>
    </div>
  );
};

export default Visualisation;
