import * as d3 from "d3";

/**
 * Prepare node and link data from dialogue trees for D3 visualization
 * @param {Object} dialogueTrees - The dialogue trees data 
 * @returns {Object} - Object containing nodes and links arrays
 */
export const prepareGraphData = (dialogueTrees) => {
  // Create nodes from dialogue tree
  const nodes = Object.entries(dialogueTrees).map(([id, node]) => ({
    id,
    speaker: node.speaker,
    text: node.text?.length > 30 ? node.text.substring(0, 30) + "..." : node.text,
    emotional_state: node.emotional_state,
  }));

  // Create links between nodes based on options
  const links = [];
  Object.entries(dialogueTrees).forEach(([sourceId, node]) => {
    if (node.options) {
      node.options.forEach((option) => {
        if (option.next_node && dialogueTrees[option.next_node]) {
          links.push({
            source: sourceId,
            target: option.next_node,
            label: option.text?.length > 20 ? option.text.substring(0, 20) + "..." : option.text,
            hasSkillCheck: !!option.skill_check,
            hasConditions: !!option.conditions
          });
        }
      });
    }
  });

  return { nodes, links };
};

/**
 * Create a flow chart visualization using D3
 * @param {SVGElement} svgElement - The SVG element to render to
 * @param {Array} nodes - Array of node objects
 * @param {Array} links - Array of link objects
 * @param {string} currentNodeId - ID of the currently selected node
 * @param {Array} emotionalStates - Array of possible emotional states
 * @param {Function} onNodeSelect - Callback when a node is selected
 * @param {boolean} showDetails - Whether to show node details
 */
export const createFlowChart = (
  svgElement, 
  nodes, 
  links, 
  currentNodeId, 
  emotionalStates,
  onNodeSelect,
  showDetails = true
) => {
  // Clear previous visualization
  d3.select(svgElement).selectAll("*").remove();

  // Set up SVG container
  const width = svgElement.clientWidth || 900;
  const height = svgElement.clientHeight || 600;
  const svg = d3.select(svgElement)
    .attr("width", width)
    .attr("height", height);

  // Create a group for the entire visualization
  const g = svg.append("g");

  // Create a zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

  svg.call(zoom);

  // Reset zoom to fit the content
  svg.call(
    zoom.transform,
    d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8)
  );

  // Set up force simulation
  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links)
      .id(d => d.id)
      .distance(150))
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(0, 0))
    .force("collide", d3.forceCollide(50));

  // Add links
  const link = g.append("g")
    .selectAll("line")
    .data(links)
    .enter()
    .append("g");

  // Add link lines with different styles based on link properties
  link.append("line")
    .attr("stroke", d => d.hasSkillCheck ? "#6366F1" : "#999")
    .attr("stroke-width", d => d.hasSkillCheck ? 3 : 2)
    .attr("stroke-dasharray", d => d.hasConditions ? "5,5" : null)
    .attr("marker-end", "url(#arrowhead)");

  // Define arrowhead marker
  svg.append("defs")
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

  // Add link labels (for dialogue options)
  link.append("text")
    .attr("dy", -5)
    .attr("text-anchor", "middle")
    .attr("font-size", "8px")
    .attr("fill", "#666")
    .text(d => d.target.data.optionText ? 
      (d.target.data.optionText.length > 20 ? d.target.data.optionText.substring(0, 20) + "..." : d.target.data.optionText) 
      : "");

  // Add nodes
  const nodes = g.selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y}, ${d.x})`)
    .on("click", (event, d) => {
      if (!d.data.referenceNode) {
        onNodeSelect(d.data.id);
      }
    });

  // Add node circles
  nodes.append("circle")
    .attr("r", 25)
    .attr("fill", d => d.data.referenceNode ? "#ccc" : colorScale(d.data.emotional_state))
    .attr("stroke", d => d.data.id === currentNodeId ? "#ff0000" : "#fff")
    .attr("stroke-width", d => d.data.id === currentNodeId ? 3 : 1);

  // Add node ID text
  nodes.append("text")
    .attr("dy", 0)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .text(d => d.data.name);

  // Add speaker text
  nodes.append("text")
    .attr("dy", -30)
    .attr("text-anchor", "middle")
    .attr("font-size", "8px")
    .text(d => d.data.speaker || "");

  // Add dialogue text
  nodes.append("text")
    .attr("dy", 40)
    .attr("text-anchor", "middle")
    .attr("font-size", "8px")
    .text(d => {
      if (d.data.text && d.data.text.length > 30) {
        return d.data.text.substring(0, 30) + "...";
      }
      return d.data.text || "";
    });
};

/**
 * Create a timeline visualization using D3
 * @param {SVGElement} svgElement - The SVG element to render to
 * @param {Object} dialogueTrees - The dialogue trees data
 * @param {string} startNodeId - ID of the starting node
 * @param {string} currentNodeId - ID of the currently selected node
 * @param {Array} emotionalStates - Array of possible emotional states
 * @param {Function} onNodeSelect - Callback when a node is selected
 */
export const createTimelineVisualisation = (
  svgElement,
  dialogueTrees,
  startNodeId,
  currentNodeId,
  emotionalStates,
  onNodeSelect
) => {
  // Clear previous visualization
  d3.select(svgElement).selectAll("*").remove();
  
  // Get all paths from the starting node
  const getAllPaths = (startId, maxDepth = 20) => {
    const paths = [];
    
    const traverse = (nodeId, currentPath = [], depth = 0) => {
      if (depth > maxDepth) return; // Prevent infinite loops
      
      const node = dialogueTrees[nodeId];
      if (!node) return;
      
      const newPath = [...currentPath, nodeId];
      
      if (!node.options || node.options.length === 0) {
        // End of path
        paths.push(newPath);
        return;
      }
      
      // Continue traversing
      node.options.forEach(option => {
        if (option.next_node) {
          // Check for cycles
          if (newPath.includes(option.next_node)) {
            paths.push([...newPath, `${option.next_node} (cycle)`]);
          } else {
            traverse(option.next_node, newPath, depth + 1);
          }
        } else {
          paths.push([...newPath, null]); // Dead end
        }
      });
    };
    
    traverse(startId);
    return paths;
  };
  
  const paths = getAllPaths(startNodeId);
  
  // Set up SVG container
  const width = svgElement.clientWidth || 900;
  const height = svgElement.clientHeight || 600;
  const svg = d3.select(svgElement)
    .attr("width", width)
    .attr("height", height);

  // Create a group for the entire visualization
  const g = svg.append("g")
    .attr("transform", `translate(20, 20)`);

  // Create a zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

  svg.call(zoom);
  
  // Define dimensions
  const rowHeight = 50;
  const colWidth = 120;
  const nodeRadius = 15;
  
  // Color scale for emotional states
  const colorScale = d3.scaleOrdinal()
    .domain(emotionalStates)
    .range(d3.schemeCategory10);
  
  // Draw timeline for each path
  paths.forEach((path, pathIndex) => {
    const pathGroup = g.append("g")
      .attr("transform", `translate(0, ${pathIndex * rowHeight * 2})`);
    
    // Draw path line
    pathGroup.append("line")
      .attr("x1", 10)
      .attr("y1", rowHeight / 2)
      .attr("x2", (path.length - 1) * colWidth + 10)
      .attr("y2", rowHeight / 2)
      .attr("stroke", "#ddd")
      .attr("stroke-width", 2);
    
    // Draw nodes along the path
    path.forEach((nodeId, nodeIndex) => {
      if (nodeId === null) return; // Skip null nodes (dead ends)
      
      const isCycle = nodeId.toString().includes("(cycle)");
      const actualNodeId = isCycle ? nodeId.split(" ")[0] : nodeId;
      const node = dialogueTrees[actualNodeId];
      if (!node) return;
      
      const nodeGroup = pathGroup.append("g")
        .attr("transform", `translate(${nodeIndex * colWidth + 10}, ${rowHeight / 2})`)
        .on("click", () => {
          if (!isCycle) onNodeSelect(actualNodeId);
        });
      
      // Draw node circle
      nodeGroup.append("circle")
        .attr("r", nodeRadius)
        .attr("fill", colorScale(node.emotional_state))
        .attr("stroke", actualNodeId === currentNodeId ? "#ff0000" : "#fff")
        .attr("stroke-width", actualNodeId === currentNodeId ? 3 : 1)
        .attr("opacity", isCycle ? 0.5 : 1);
      
      // Add node ID
      nodeGroup.append("text")
        .attr("dy", 0)
        .attr("text-anchor", "middle")
        .attr("font-size", "8px")
        .attr("font-weight", "bold")
        .text(isCycle ? "↩️" : actualNodeId);
      
      // Add node details below
      if (node.speaker) {
        nodeGroup.append("text")
          .attr("dy", nodeRadius + 15)
          .attr("text-anchor", "middle")
          .attr("font-size", "8px")
          .text(node.speaker);
      }
    });
  });
}; d.label);

  // Color scale for emotional states
  const colorScale = d3.scaleOrdinal()
    .domain(emotionalStates)
    .range(d3.schemeCategory10);

  // Add node groups
  const node = g.append("g")
    .selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
    .on("click", (event, d) => {
      onNodeSelect(d.id);
    });

  // Add node circles
  node.append("circle")
    .attr("r", 25)
    .attr("fill", d => colorScale(d.emotional_state))
    .attr("stroke", d => d.id === currentNodeId ? "#ff0000" : "#fff")
    .attr("stroke-width", d => d.id === currentNodeId ? 3 : 1);

  if (showDetails) {
    // Add node labels (speaker)
    node.append("text")
      .attr("dy", -30)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text(d => d.speaker);

    // Add node text
    node.append("text")
      .attr("dy", 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "8px")
      .text(d => d.text);
  }

  // Add node ID labels
  node.append("text")
    .attr("dy", 0)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .text(d => d.id);

  // Update positions on simulation tick
  simulation.on("tick", () => {
    link.selectAll("line")
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    link.selectAll("text")
      .attr("x", d => (d.source.x + d.target.x) / 2)
      .attr("y", d => (d.source.y + d.target.y) / 2);

    node.attr("transform", d => `translate(${d.x}, ${d.y})`);
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
};

/**
 * Create a tree visualization using D3
 * @param {SVGElement} svgElement - The SVG element to render to
 * @param {Object} dialogueTrees - The dialogue trees data
 * @param {string} rootNodeId - ID of the root node to start the tree
 * @param {string} currentNodeId - ID of the currently selected node
 * @param {Array} emotionalStates - Array of possible emotional states
 * @param {Function} onNodeSelect - Callback when a node is selected
 */
export const createTreeVisualisation = (
  svgElement,
  dialogueTrees,
  rootNodeId,
  currentNodeId,
  emotionalStates,
  onNodeSelect
) => {
  // Clear previous visualization
  d3.select(svgElement).selectAll("*").remove();

  // Convert dialogueTrees to a hierarchical structure
  const buildHierarchy = (nodeId, visited = new Set()) => {
    if (visited.has(nodeId)) {
      // Handle cycles by creating a reference node
      return {
        id: `${nodeId}(ref)`,
        name: nodeId,
        referenceNode: true
      };
    }

    visited.add(nodeId);
    const node = dialogueTrees[nodeId];
    if (!node) return null;

    const hierarchyNode = {
      id: nodeId,
      name: nodeId,
      speaker: node.speaker,
      text: node.text,
      emotional_state: node.emotional_state,
      children: []
    };

    if (node.options && node.options.length > 0) {
      hierarchyNode.children = node.options
        .map(option => {
          if (option.next_node) {
            const childNode = buildHierarchy(option.next_node, new Set(visited));
            if (childNode) {
              return {
                ...childNode,
                optionText: option.text,
                hasSkillCheck: !!option.skill_check
              };
            }
          }
          return null;
        })
        .filter(Boolean);
    }

    return hierarchyNode;
  };

  const rootNode = buildHierarchy(rootNodeId);
  if (!rootNode) return;

  // Set up SVG container
  const width = svgElement.clientWidth || 900;
  const height = svgElement.clientHeight || 600;
  const svg = d3.select(svgElement)
    .attr("width", width)
    .attr("height", height);

  // Create a group for the entire visualization
  const g = svg.append("g")
    .attr("transform", `translate(${50}, ${50})`);

  // Create a zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

  svg.call(zoom);

  // Create tree layout
  const treeLayout = d3.tree()
    .size([height - 100, width - 200]);

  // Create the tree hierarchy
  const root = d3.hierarchy(rootNode);
  treeLayout(root);

  // Color scale for emotional states
  const colorScale = d3.scaleOrdinal()
    .domain(emotionalStates)
    .range(d3.schemeCategory10);

  // Add links
  g.selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x))
    .attr("fill", "none")
    .attr("stroke", d => d.target.data.hasSkillCheck ? "#6366F1" : "#999")
    .attr("stroke-width", d => d.target.data.hasSkillCheck ? 3 : 2);

  // Add link labels
  g.selectAll(".link-label")
    .data(root.links())
    .enter()
    .append("text")
    .attr("class", "link-label")
    .attr("x", d => (d.source.y + d.target.y) / 2)
    .attr("y", d => (d.source.x + d.target.x) / 2 - 5)
    .attr("text-anchor", "middle")
    .attr("font-size", "8px")
    .text(d => d.label);


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
        handleNodeSelect(d.id);
      });

    // Add node circles
    node
      .append("circle")
      .attr("r", 25)
      .attr("fill", (d) => colorScale(d.emotional_state))
      .attr("stroke", (d) => (d.id === currentNode ? "#ff0000" : "#fff"))
      .attr("stroke-width", (d) => (d.id === currentNode ? 3 : 1));

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
