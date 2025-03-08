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

    // Create links with additional properties for success/failure paths
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
                option.text.length > 20
                  ? option.text.substring(0, 20) + "..."
                  : option.text,
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
              label: `${option.text.length > 15 ? option.text.substring(0, 15) + "..." : option.text} (Success)`,
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
              label: `${option.text.length > 15 ? option.text.substring(0, 15) + "..." : option.text} (Failure)`,
              isSkillCheck: true,
              linkType: "failure",
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

    // Define arrowhead marker for success links
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead-success")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#10b981");

    // Define arrowhead marker for failure links
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead-failure")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#ef4444");

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

      // Add link lines with different styles based on link properties
      link
        .append("line")
        .attr("stroke", (d) => {
          if (d.linkType === "success") return "#10b981"; // Success links in green
          if (d.linkType === "failure") return "#ef4444"; // Failure links in red
          return "#999"; // Normal links in gray
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

      // Add link labels (for dialogue options)
      link
        .append("text")
        .attr("dy", -5)
        .attr("text-anchor", "middle")
        .attr("font-size", "8px")
        .attr("fill", (d) => {
          if (d.linkType === "success") return "#10b981";
          if (d.linkType === "failure") return "#ef4444";
          return "#666";
        })
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
        .attr("stroke", (d) => {
          // Color links based on path type
          if (d.target.data.pathType === "success") return "#10b981";
          if (d.target.data.pathType === "failure") return "#ef4444";
          return "#999";
        })
        .attr("stroke-width", (d) =>
          d.target.data.pathType === "normal" ? 1 : 2,
        )
        .attr("stroke-dasharray", (d) =>
          d.target.data.pathType === "failure" ? "5,5" : null,
        )
        .attr("marker-end", (d) => {
          if (d.target.data.pathType === "success")
            return "url(#arrowhead-success)";
          if (d.target.data.pathType === "failure")
            return "url(#arrowhead-failure)";
          return "url(#arrowhead)";
        });

      // Add link labels
      const linkLabels = g
        .append("g")
        .selectAll("text")
        .data(root.links())
        .join("text")
        .attr("font-size", "8px")
        .attr("fill", (d) => {
          if (d.target.data.pathType === "success") return "#10b981";
          if (d.target.data.pathType === "failure") return "#ef4444";
          return "#666";
        })
        .attr("x", (d) => (d.source.y + d.target.y) / 2)
        .attr("y", (d) => (d.source.x + d.target.x) / 2 - 5)
        .attr("text-anchor", "middle")
        .text((d) => {
          if (d.target.data.pathType === "success") return "Success";
          if (d.target.data.pathType === "failure") return "Failure";
          if (d.target.data.optionText) return d.target.data.optionText;
          return "";
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
        path.forEach((nodeData, nodeIndex) => {
          const nodeId = nodeData.id;
          const linkType = nodeData.linkType;
          const nodeInfo = nodes.find((n) => n.id === nodeId);
          if (!nodeInfo) return;

          const nodeGroup = pathGroup
            .append("g")
            .attr("transform", `translate(${50 + nodeIndex * nodeSpacing}, 0)`)
            .on("click", () => onNodeSelect(nodeId));

          // Add node circle
          nodeGroup
            .append("circle")
            .attr("r", nodeRadius)
            .attr("fill", colorScale(nodeInfo.emotional_state))
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
              .text(nodeInfo.speaker);

            // Add dialogue text below
            nodeGroup
              .append("text")
              .attr("dy", 35)
              .attr("text-anchor", "middle")
              .attr("font-size", "8px")
              .text(nodeInfo.text);
          }

          // Connect to next node with arrow if not the last one
          if (nodeIndex < path.length - 1) {
            const nextNodeData = path[nodeIndex + 1];
            const nextNodeId = nextNodeData.id;
            const nextLinkType = nextNodeData.linkType || "normal";

            // Draw connector line with arrow
            pathGroup
              .append("line")
              .attr("x1", 50 + nodeIndex * nodeSpacing + nodeRadius)
              .attr("y1", 0)
              .attr("x2", 50 + (nodeIndex + 1) * nodeSpacing - nodeRadius)
              .attr("y2", 0)
              .attr("stroke", () => {
                if (nextLinkType === "success") return "#10b981";
                if (nextLinkType === "failure") return "#ef4444";
                return "#999";
              })
              .attr("stroke-width", nextLinkType === "normal" ? 1 : 2)
              .attr(
                "stroke-dasharray",
                nextLinkType === "failure" ? "5,5" : null,
              )
              .attr("marker-end", () => {
                if (nextLinkType === "success")
                  return "url(#arrowhead-success)";
                if (nextLinkType === "failure")
                  return "url(#arrowhead-failure)";
                return "url(#arrowhead)";
              });

            // Add path type label
            pathGroup
              .append("text")
              .attr("x", 50 + nodeIndex * nodeSpacing + nodeSpacing / 2)
              .attr("y", -10)
              .attr("text-anchor", "middle")
              .attr("font-size", "8px")
              .attr("fill", () => {
                if (nextLinkType === "success") return "#10b981";
                if (nextLinkType === "failure") return "#ef4444";
                return "#666";
              })
              .text(() => {
                if (nextLinkType === "success") return "Success";
                if (nextLinkType === "failure") return "Failure";
                return nextNodeData.optionText || "";
              });
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
      function buildTree(
        nodeId,
        visited = new Set(),
        pathType = "normal",
        optionText = null,
      ) {
        if (visited.has(nodeId)) {
          // Avoid cycles
          return {
            id: nodeId,
            name: nodeId + " (cycle)",
            children: [],
            pathType,
            optionText,
          };
        }

        const newVisited = new Set(visited);
        newVisited.add(nodeId);

        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return null;

        const outgoingLinks = links.filter((link) => link.source === nodeId);
        const children = outgoingLinks
          .map((link) =>
            buildTree(link.target, newVisited, link.linkType, link.label),
          )
          .filter(Boolean);

        return {
          id: node.id,
          name: node.id,
          speaker: node.speaker,
          text: node.text,
          emotional_state: node.emotional_state,
          children: children,
          pathType,
          optionText,
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

        function traversePath(
          nodeId,
          currentPath = [],
          visited = new Set(),
          linkType = null,
          optionText = null,
        ) {
          // Avoid infinite loops by detecting cycles
          if (visited.has(nodeId)) {
            paths.push([
              ...currentPath,
              { id: nodeId + "*", linkType, optionText },
            ]); // Mark as cyclic
            return;
          }

          const newPath = [
            ...currentPath,
            { id: nodeId, linkType, optionText },
          ];
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
            traversePath(
              link.target,
              newPath,
              newVisited,
              link.linkType,
              link.label,
            );
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

      {/* Legend for link types */}
      <div className="p-2 border-t border-gray-200 flex items-center gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-1 bg-gray-500 mr-1"></div>
          <span>Normal Path</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-1 bg-green-500 mr-1"></div>
          <span>Success Path</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-1 bg-red-500 mr-1 border-dashed border-2"></div>
          <span>Failure Path</span>
        </div>
      </div>
    </div>
  );
};

export default Visualisation;
