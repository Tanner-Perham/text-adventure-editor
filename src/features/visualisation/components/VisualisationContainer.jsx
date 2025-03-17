import React, { useRef, useEffect, useState } from "react";
import VisualisationToolbar from "./VisualisationToolbar";
import VisualisationCanvas from "./VisualisationCanvas";
import VisualisationLegend from "./VisualisationLegend";
import useVisualisation from "../hooks/useVisualisation";

/**
 * Main container component for the dialogue visualisation
 * Manages visualisation state and orchestrates rendering
 */
const VisualisationContainer = ({
  dialogueTrees,
  currentNode,
  emotionalStates,
  viewMode = "flow", // "flow", "tree", or "timeline"
  showNodeDetails = true,
  showQuestsInVisualisation = false,
  quests = {},
  onViewModeChange,
  onShowNodeDetailsChange,
  onShowQuestsInVisualisationChange,
  onNodeSelect,
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const resizeObserverRef = useRef(null);

  // Use custom hook to manage visualisation state and rendering
  const {
    canvasRef,
    isReady,
    viewportDimensions,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleNodeClick,
    renderVisualisation,
  } = useVisualisation({
    dialogueTrees,
    currentNode,
    emotionalStates,
    viewMode,
    showNodeDetails,
    showQuestsInVisualisation,
    quests,
    onNodeSelect,
  });

  // Measure container and update dimensions when needed
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        console.log("Container dimensions:", rect.width, rect.height);

        // Only update if dimensions have significantly changed (prevents render loops)
        if (
          Math.abs(dimensions.width - rect.width) > 5 ||
          Math.abs(dimensions.height - rect.height) > 5
        ) {
          setDimensions({
            width: rect.width,
            height: rect.height,
          });

          // Render after a short delay to ensure dimensions have been applied
          setTimeout(() => {
            renderVisualisation(rect.width, rect.height);
          }, 100);
        }
      }
    };

    // Use ResizeObserver for more efficient dimension tracking
    if (window.ResizeObserver && !resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver(updateDimensions);
      resizeObserverRef.current.observe(containerRef.current);
    } else {
      // Fallback to window resize event for older browsers
      window.addEventListener("resize", updateDimensions);
    }

    // Initial render with a slightly longer delay to ensure container is properly sized
    const initialRenderTimer = setTimeout(updateDimensions, 200);

    return () => {
      clearTimeout(initialRenderTimer);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      } else {
        window.removeEventListener("resize", updateDimensions);
      }
    };
  }, [containerRef, dimensions, renderVisualisation]);

  // Debug output
  console.log("VisualisationContainer rendering with dimensions:", dimensions);
  console.log("isReady:", isReady, "viewportDimensions:", viewportDimensions);

  return (
    <div
      className="visualisation-container"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <VisualisationToolbar
        viewMode={viewMode}
        showNodeDetails={showNodeDetails}
        showQuestsInVisualisation={showQuestsInVisualisation}
        onViewModeChange={onViewModeChange}
        onShowNodeDetailsChange={onShowNodeDetailsChange}
        onShowQuestsInVisualisationChange={onShowQuestsInVisualisationChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
      />

      <div
        ref={containerRef}
        className="visualisation-content"
        style={{
          flex: 1,
          position: "relative",
          minHeight: "400px",
          overflow: "hidden",
          background: "#f8fafc",
        }}
      >
        <VisualisationCanvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onNodeClick={handleNodeClick}
        />

        {/* Loading indicator */}
        {!isReady && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.7)",
              zIndex: 10, // Make sure it's above the visualization
            }}
          >
            <div>Preparing visualisation...</div>
          </div>
        )}
      </div>

      <VisualisationLegend viewMode={viewMode} />
    </div>
  );
};

export default VisualisationContainer;
