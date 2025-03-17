import { useState, useRef, useCallback, useEffect } from "react";
import * as d3 from "d3";
import useGraphData from "./useGraphData";
import useD3Zoom from "./useD3Zoom";
import { renderFlowChart } from "../renderers/FlowChartRenderer";
import { renderTreeView } from "../renderers/TreeRenderer";
import { renderTimelineView } from "../renderers/TimelineRenderer";

/**
 * Custom hook for managing visualisation logic
 * Handles data preparation, rendering, and interaction
 */
const useVisualisation = ({
  dialogueTrees,
  currentNode,
  emotionalStates,
  viewMode,
  showNodeDetails,
  showQuestsInVisualisation,
  quests,
  onNodeSelect,
}) => {
  const canvasRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [viewportDimensions, setViewportDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Track current renderer cleanup function
  const cleanupRef = useRef(null);

  // Debug output
  console.log(
    "useVisualisation - dialogueTrees:",
    Object.keys(dialogueTrees).length,
  );
  console.log("useVisualisation - currentNode:", currentNode);
  console.log("useVisualisation - viewMode:", viewMode);

  // Use graph data hook to prepare visualisation data
  const { nodes, links, graphStructure } = useGraphData(
    dialogueTrees,
    quests,
    showQuestsInVisualisation,
  );

  // Debug nodes and links
  console.log("useVisualisation - nodes count:", nodes ? nodes.length : 0);
  console.log("useVisualisation - links count:", links ? links.length : 0);

  // Use zoom hook for pan/zoom functionality
  const { zoom, applyZoom, handleZoomIn, handleZoomOut, handleResetZoom } =
    useD3Zoom();

  // Clean up previous visualisation
  const clearVisualisation = useCallback(() => {
    if (!canvasRef.current) {
      console.log("clearVisualisation - canvas ref is null");
      return;
    }

    console.log("clearVisualisation - clearing visualisation");
    const svg = d3.select(canvasRef.current);
    svg.selectAll("g.visualisation-container-group > *").remove();

    // Call cleanup function if exists
    if (typeof cleanupRef.current === "function") {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, []);

  // Handle node click events
  const handleNodeClick = useCallback(
    (nodeId) => {
      console.log("handleNodeClick - nodeId:", nodeId);
      if (onNodeSelect && nodeId) {
        onNodeSelect(nodeId);
      }
    },
    [onNodeSelect],
  );

  // Render the visualisation based on current view mode
  const renderVisualisation = useCallback(
    (width, height) => {
      console.log("renderVisualisation - width:", width, "height:", height);

      if (!canvasRef.current) {
        console.log("renderVisualisation - canvas ref is null");
        return;
      }

      if (!nodes || nodes.length === 0) {
        console.log("renderVisualisation - no nodes to render");
        setIsReady(true);
        return;
      }

      // Only update dimensions if they've changed significantly
      if (
        Math.abs(viewportDimensions.width - width) > 5 ||
        Math.abs(viewportDimensions.height - height) > 5
      ) {
        setViewportDimensions({ width, height });
      }

      clearVisualisation();

      // Select the container group for zooming
      const svg = d3.select(canvasRef.current);
      const container = svg.select("g.visualisation-container-group");

      console.log(
        "renderVisualisation - container selected:",
        container.size(),
      );

      // Apply zoom behavior
      try {
        applyZoom(canvasRef.current);
      } catch (error) {
        console.error("Error applying zoom behavior:", error);
      }

      try {
        let cleanupFunction = null;

        // Select the renderer based on view mode
        if (viewMode === "flow") {
          console.log("renderVisualisation - rendering flow chart");
          cleanupFunction = renderFlowChart({
            container,
            nodes,
            links,
            dimensions: { width, height },
            currentNodeId: currentNode,
            emotionalStates,
            showDetails: showNodeDetails,
          });
        } else if (viewMode === "tree") {
          console.log("renderVisualisation - rendering tree view");
          renderTreeView({
            container,
            graphStructure,
            dimensions: { width, height },
            currentNodeId: currentNode,
            emotionalStates,
            showDetails: showNodeDetails,
          });
        } else if (viewMode === "timeline") {
          console.log("renderVisualisation - rendering timeline view");
          renderTimelineView({
            container,
            dialogueTrees,
            startNodeId: Object.keys(dialogueTrees)[0],
            dimensions: { width, height },
            currentNodeId: currentNode,
            emotionalStates,
            showDetails: showNodeDetails,
          });
        }

        // Store cleanup function if provided
        if (typeof cleanupFunction === "function") {
          cleanupRef.current = cleanupFunction;
        }

        // Reset zoom to fit content after a short delay to allow for graph layout
        setTimeout(() => {
          handleResetZoom();
          setIsReady(true);
        }, 200);
      } catch (error) {
        console.error("Error rendering visualisation:", error);
        setIsReady(true); // Still mark as ready to avoid loading state
      }
    },
    [
      nodes,
      links,
      graphStructure,
      dialogueTrees,
      currentNode,
      emotionalStates,
      viewMode,
      showNodeDetails,
      viewportDimensions,
      applyZoom,
      clearVisualisation,
      handleResetZoom,
    ],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof cleanupRef.current === "function") {
        cleanupRef.current();
      }
    };
  }, []);

  // Reset visualisation when key dependencies change
  useEffect(() => {
    console.log("useVisualisation - dependencies changed, refreshing");
    setIsReady(false); // Set loading state while rendering

    if (canvasRef.current && viewportDimensions.width > 0) {
      // Use timeout to ensure DOM has updated
      const timeoutId = setTimeout(() => {
        renderVisualisation(
          viewportDimensions.width,
          viewportDimensions.height,
        );
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [
    dialogueTrees,
    currentNode,
    viewMode,
    showNodeDetails,
    showQuestsInVisualisation,
    renderVisualisation,
  ]);

  return {
    canvasRef,
    isReady,
    viewportDimensions,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleNodeClick,
    renderVisualisation,
  };
};

export default useVisualisation;
