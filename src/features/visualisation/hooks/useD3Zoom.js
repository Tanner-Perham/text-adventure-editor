import { useCallback, useMemo, useRef } from "react";
import * as d3 from "d3";

/**
 * Custom hook for handling D3 zoom behavior
 * Provides zoom controls and zoom state management
 */
const useD3Zoom = (minZoom = 0.1, maxZoom = 4, initialZoom = 0.8) => {
  // Keep a reference to the current transform state
  const transformRef = useRef(d3.zoomIdentity.scale(initialZoom));

  // Create zoom behavior with specified scale limits
  const zoom = useMemo(() => {
    const zoomBehavior = d3
      .zoom()
      .scaleExtent([minZoom, maxZoom])
      .on("zoom", (event) => {
        try {
          const transform = event.transform;
          transformRef.current = transform; // Save the current transform

          d3.select(event.sourceEvent.currentTarget)
            .select("g.visualisation-container-group")
            .attr("transform", transform);
        } catch (error) {
          console.error("Error in zoom handler:", error);
        }
      });

    return zoomBehavior;
  }, [minZoom, maxZoom]);

  // Apply zoom behavior to an SVG element
  const applyZoom = useCallback(
    (svgElement) => {
      if (!svgElement) return;

      try {
        // Initialize with the stored transform
        const selection = d3.select(svgElement);
        selection.call(zoom);

        // Apply any existing transform
        selection.call(zoom.transform, transformRef.current);
      } catch (error) {
        console.error("Error applying zoom:", error);
      }
    },
    [zoom],
  );

  // Handle zoom in action
  const handleZoomIn = useCallback(() => {
    try {
      const svg = document.querySelector("svg.visualisation-svg");
      if (!svg) {
        console.warn("No visualisation SVG found for zoom in");
        return;
      }

      const selection = d3.select(svg);
      // Use the stored transform instead of getting from the DOM
      const currentTransform = transformRef.current;
      const newZoom = Math.min(currentTransform.k * 1.3, maxZoom);

      // Update transform and apply
      selection.transition().duration(300).call(zoom.scaleTo, newZoom);
    } catch (error) {
      console.error("Error in zoom in:", error);
    }
  }, [zoom, maxZoom]);

  // Handle zoom out action
  const handleZoomOut = useCallback(() => {
    try {
      const svg = document.querySelector("svg.visualisation-svg");
      if (!svg) {
        console.warn("No visualisation SVG found for zoom out");
        return;
      }

      const selection = d3.select(svg);
      // Use the stored transform instead of getting from the DOM
      const currentTransform = transformRef.current;
      const newZoom = Math.max(currentTransform.k * 0.7, minZoom);

      // Update transform and apply
      selection.transition().duration(300).call(zoom.scaleTo, newZoom);
    } catch (error) {
      console.error("Error in zoom out:", error);
    }
  }, [zoom, minZoom]);

  // Handle reset zoom (fit to view)
  const handleResetZoom = useCallback(() => {
    try {
      const svg = document.querySelector("svg.visualisation-svg");
      if (!svg) {
        console.warn("No visualisation SVG found for reset zoom");
        return;
      }

      const selection = d3.select(svg);
      const width =
        svg.clientWidth || parseInt(selection.attr("width"), 10) || 800;
      const height =
        svg.clientHeight || parseInt(selection.attr("height"), 10) || 600;

      // Get bounding box of content
      const group = selection.select("g.visualisation-container-group");
      if (group.empty()) {
        console.warn("No container group found for reset zoom");

        // If no group, just reset to center with initial zoom
        const transform = d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(initialZoom);

        transformRef.current = transform; // Update the stored transform
        selection.transition().duration(500).call(zoom.transform, transform);
        return;
      }

      let bbox;
      try {
        bbox = group.node().getBBox();

        // Check if bbox is valid and has content
        if (bbox.width < 10 || bbox.height < 10) {
          throw new Error("BBox too small");
        }
      } catch (e) {
        console.warn("Error getting bbox, using default:", e);
        // If getBBox fails or too small, use default viewport
        bbox = {
          x: -width / 4,
          y: -height / 4,
          width: width / 2,
          height: height / 2,
        };
      }

      // Calculate transform to center content with some padding
      const scale =
        0.8 *
        Math.min(
          width / Math.max(1, bbox.width),
          height / Math.max(1, bbox.height),
        );

      const translateX = width / 2 - (bbox.x + bbox.width / 2) * scale;
      const translateY = height / 2 - (bbox.y + bbox.height / 2) * scale;

      // Create and store the transform
      const transform = d3.zoomIdentity
        .translate(translateX, translateY)
        .scale(Math.min(scale, maxZoom));

      transformRef.current = transform; // Update the stored transform

      // Apply the transform
      selection.transition().duration(500).call(zoom.transform, transform);
    } catch (error) {
      console.error("Error in reset zoom:", error);
    }
  }, [zoom, maxZoom, initialZoom]);

  // Handle panning to a specific position
  const handlePanTo = useCallback(
    (x, y) => {
      try {
        const svg = document.querySelector("svg.visualisation-svg");
        if (!svg) {
          console.warn("No visualisation SVG found for pan");
          return;
        }

        const selection = d3.select(svg);
        const currentTransform = transformRef.current;

        // Create a new transform with the requested translation
        const transform = d3.zoomIdentity
          .translate(x, y)
          .scale(currentTransform.k);

        transformRef.current = transform;

        // Apply the transform
        selection.transition().duration(300).call(zoom.transform, transform);
      } catch (error) {
        console.error("Error in pan:", error);
      }
    },
    [zoom],
  );

  return {
    zoom,
    applyZoom,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handlePanTo,
    currentTransform: transformRef,
  };
};

export default useD3Zoom;
