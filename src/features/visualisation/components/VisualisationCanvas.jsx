import React, { forwardRef, useEffect, useRef } from "react";
import * as d3 from "d3";

/**
 * Canvas component for rendering the visualisation
 * Provides an SVG container for D3 to render into
 */
const VisualisationCanvas = forwardRef(
  ({ width, height, onNodeClick }, ref) => {
    // Keep track if we're in panning mode
    const isPanningRef = useRef(false);
    // Track if we're currently dragging a node
    const isDraggingNodeRef = useRef(false);
    // Reference to the last transform matrix
    const lastTransformRef = useRef(null);

    // Set up click listener
    useEffect(() => {
      const svg = ref.current;
      if (!svg) return;

      // Use a safer DOM event approach with stopPropagation to prevent
      // conflicts between drag and zoom
      const clickHandler = (event) => {
        // Skip if we were panning
        if (isPanningRef.current) {
          isPanningRef.current = false;
          return;
        }

        // Check if click was on a node
        const path = event.composedPath();
        const nodeElement = path.find(
          (el) => el.classList && el.classList.contains("node"),
        );

        if (nodeElement && nodeElement.dataset && nodeElement.dataset.nodeId) {
          // Stop the event from propagating to prevent zoom actions
          event.stopPropagation();
          onNodeClick(nodeElement.dataset.nodeId);
        }
      };

      svg.addEventListener("click", clickHandler, { passive: false });

      return () => {
        svg.removeEventListener("click", clickHandler);
      };
    }, [ref, onNodeClick]);

    // Set up mouse events for canvas panning
    useEffect(() => {
      const svg = ref.current;
      if (!svg) return;

      let startX, startY;

      // Mouse down handler to start panning
      const handleMouseDown = (event) => {
        // Only react to middle mouse button (button 1) or
        // left mouse button (button 0) if not on a node
        const isMiddleClick = event.button === 1;
        const path = event.composedPath();
        const onNode = path.some(
          (el) => el.classList && el.classList.contains("node"),
        );

        if (isMiddleClick || (!onNode && event.button === 0)) {
          event.preventDefault();
          event.stopPropagation();

          // Store starting position
          startX = event.clientX;
          startY = event.clientY;

          // Set cursor to indicate panning
          svg.style.cursor = "grabbing";

          // Flag that we're panning
          isPanningRef.current = true;

          // Get the current transform matrix from the container group
          const containerGroup = d3
            .select(svg)
            .select("g.visualisation-container-group");
          const transform = d3.zoomTransform(svg) || d3.zoomIdentity;
          lastTransformRef.current = transform;

          // Add temporary handlers
          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        }
      };

      // Mouse move handler for panning
      const handleMouseMove = (event) => {
        if (isPanningRef.current) {
          // Calculate the amount moved
          const dx = event.clientX - startX;
          const dy = event.clientY - startY;

          // Update starting position for next move
          startX = event.clientX;
          startY = event.clientY;

          // Get the last saved transform
          const transform = lastTransformRef.current || d3.zoomIdentity;

          // Calculate new transform with the delta
          const scale = transform.k;
          const newTransform = transform.translate(dx / scale, dy / scale);
          lastTransformRef.current = newTransform;

          // Apply the new transform directly to the container group
          d3.select(svg)
            .select("g.visualisation-container-group")
            .attr("transform", newTransform);

          // Update d3's internal zoom state, if needed in the future
          try {
            // This is the correct way to access zoom behavior in d3v6+
            const zoom = d3.select(svg).property("__zoom");
            if (zoom) {
              // Store new transform in d3's zoom state
              d3.select(svg).property("__zoom", newTransform);
            }
          } catch (error) {
            console.warn("Could not update d3 zoom state:", error);
          }
        }
      };

      // Mouse up handler to end panning
      const handleMouseUp = () => {
        if (isPanningRef.current) {
          svg.style.cursor = "grab";

          // Remove temporary handlers
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);

          // Keep panning flag true until next click to prevent click handling
          // isPanningRef.current will be reset on the next click
        }
      };

      // Track node dragging to avoid conflict with panning
      const handleNodeDragStart = () => {
        isDraggingNodeRef.current = true;
      };

      const handleNodeDragEnd = () => {
        isDraggingNodeRef.current = false;
      };

      // Add listeners
      svg.addEventListener("mousedown", handleMouseDown);

      // Add listeners for node dragging
      svg.addEventListener("dragstart", handleNodeDragStart);
      svg.addEventListener("dragend", handleNodeDragEnd);

      return () => {
        // Clean up all listeners
        svg.removeEventListener("mousedown", handleMouseDown);
        svg.removeEventListener("dragstart", handleNodeDragStart);
        svg.removeEventListener("dragend", handleNodeDragEnd);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }, [ref]);

    // Add some CSS styles for drag behavior and important zoom fixes
    const styleElementId = "visualisation-canvas-styles";

    // Only add styles if they don't already exist (prevents duplication)
    if (!document.getElementById(styleElementId)) {
      const styleElement = document.createElement("style");
      styleElement.id = styleElementId;
      styleElement.textContent = `
        .node {
          cursor: grab;
        }
        .node.dragging {
          cursor: grabbing;
        }
        .visualisation-svg {
          touch-action: none; /* Prevents default touch actions like scrolling */
          cursor: grab; /* Default cursor for panning */
        }
        /* Fix text selection during drag/zoom */
        .visualisation-svg text {
          user-select: none;
          pointer-events: none;
        }
        /* Link styling */
        .link {
          pointer-events: none; /* Allow click-through on links */
        }
        .link-label {
          pointer-events: none; /* Allow click-through on link labels */
          user-select: none;
        }
      `;
      document.head.appendChild(styleElement);
    }

    // Clean up style element on unmount
    useEffect(() => {
      return () => {
        const styleElement = document.getElementById(styleElementId);
        if (styleElement && styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
      };
    }, []);

    return (
      <svg
        ref={ref}
        className="visualisation-svg"
        width={width || "100%"}
        height={height || "100%"}
        style={{
          width: width ? `${width}px` : "100%",
          height: height ? `${height}px` : "100%",
          display: "block",
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
          minHeight: "400px",
          cursor: "grab", // Default cursor for panning
          touchAction: "none", // Prevents default touch actions
        }}
        aria-label="Dialogue visualisation"
      >
        {/* D3 will render visualisation elements here */}
        <defs>
          {/* Define markers for different types of links */}
          <marker
            id="arrowhead"
            viewBox="0 -5 10 10"
            refX="20"
            refY="0"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,-5L10,0L0,5" fill="#999" />
          </marker>

          <marker
            id="arrowhead-success"
            viewBox="0 -5 10 10"
            refX="20"
            refY="0"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,-5L10,0L0,5" fill="#10b981" />
          </marker>

          <marker
            id="arrowhead-failure"
            viewBox="0 -5 10 10"
            refX="20"
            refY="0"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,-5L10,0L0,5" fill="#ef4444" />
          </marker>
        </defs>

        {/* Main rendering group that will be transformed by zoom */}
        <g
          className="visualisation-container-group"
          transform="translate(0,0) scale(1)"
        >
          <g className="links"></g>
          <g className="nodes"></g>
        </g>
      </svg>
    );
  },
);

VisualisationCanvas.displayName = "VisualisationCanvas";

export default VisualisationCanvas;
