/**
 * Visualisation module for dialogue editor
 */

// Export main components
export { default as VisualisationContainer } from "./components/VisualisationContainer";
export { default as VisualisationToolbar } from "./components/VisualisationToolbar";
export { default as VisualisationCanvas } from "./components/VisualisationCanvas";
export { default as VisualisationLegend } from "./components/VisualisationLegend";

// Export hooks
export { default as useVisualisation } from "./hooks/useVisualisation";
export { default as useD3Zoom } from "./hooks/useD3Zoom";
export { default as useGraphData } from "./hooks/useGraphData";

// Export utility functions
export { prepareGraphData, createHierarchy } from "./utils/graphDataUtils";

export {
  findAllPaths,
  findEntryNodes,
  findEndNodes,
  findStartingNodes,
  findShortestPath,
} from "./utils/pathFindingUtils";

export {
  getColorScale,
  getNodeStrokeWidth,
  getNodeStrokeColor,
  getLinkStyle,
  formatNodeText,
} from "./utils/styleUtils";

export {
  createGridLayout,
  createRadialLayout,
  avoidNodeOverlap,
  calculateLinkCurves,
} from "./utils/layoutUtils";

// Main visualisations for external use
export const renderFlowVisualisation = (container, options) => {
  const { renderFlowChart } = require("./renderers/FlowChartRenderer");
  return renderFlowChart({ container, ...options });
};

export const renderTreeVisualisation = (container, options) => {
  const { renderTreeView } = require("./renderers/TreeRenderer");
  return renderTreeView({ container, ...options });
};

export const renderTimelineVisualisation = (container, options) => {
  const { renderTimelineView } = require("./renderers/TimelineRenderer");
  return renderTimelineView({ container, ...options });
};
