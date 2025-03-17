import * as d3 from "d3";

/**
 * Get a color scale for emotional states
 * @param {Array} emotionalStates Array of possible emotional states
 * @returns {d3.ScaleOrdinal} Color scale function
 */
export const getColorScale = (emotionalStates = []) => {
  // Default emotional states if none provided
  const defaultStates = [
    "Neutral",
    "Friendly",
    "Suspicious",
    "Angry",
    "Scared",
    "Nervous",
    "Sad",
    "Happy",
    "Confused",
  ];

  // Use provided states or fallback to defaults
  const states =
    emotionalStates && emotionalStates.length > 0
      ? emotionalStates
      : defaultStates;

  // Create the color scale
  return d3.scaleOrdinal().domain(states).range([
    "#A9A9A9", // Neutral - Gray
    "#4CAF50", // Friendly - Green
    "#FFC107", // Suspicious - Amber
    "#F44336", // Angry - Red
    "#9C27B0", // Scared - Purple
    "#FF9800", // Nervous - Orange
    "#2196F3", // Sad - Blue
    "#8BC34A", // Happy - Light Green
    "#E91E63", // Confused - Pink
    // Additional fallback colors for other states
    "#00BCD4",
    "#CDDC39",
    "#795548",
    "#607D8B",
    "#3F51B5",
    "#009688",
    "#FF5722",
    "#9E9E9E",
  ]);
};

/**
 * Get stroke width based on node importance
 * @param {Object} node Node data
 * @param {string} currentNodeId ID of the currently selected node
 * @returns {number} Stroke width
 */
export const getNodeStrokeWidth = (node, currentNodeId) => {
  if (node.id === currentNodeId) return 3;
  if (node.isStartNode) return 2;
  if (node.questRelated) return 2;
  return 1;
};

/**
 * Get stroke color based on node state
 * @param {Object} node Node data
 * @param {string} currentNodeId ID of the currently selected node
 * @returns {string} Stroke color
 */
export const getNodeStrokeColor = (node, currentNodeId) => {
  if (node.id === currentNodeId) return "#ff0000";
  if (node.isStartNode) return "#0044ff";
  if (node.questRelated) return "#f59e0b";
  return "#fff";
};

/**
 * Get specific styling for different link types
 * @param {Object} link Link data
 * @returns {Object} Style object with stroke, width, etc.
 */
export const getLinkStyle = (link) => {
  const baseStyle = {
    stroke: "#999",
    strokeWidth: 1,
    strokeDasharray: null,
    markerEnd: "url(#arrowhead)",
    textColor: "#666",
  };

  if (!link || !link.linkType) return baseStyle;

  switch (link.linkType) {
    case "success":
      return {
        stroke: "#10b981", // Success green
        strokeWidth: 2,
        strokeDasharray: null,
        markerEnd: "url(#arrowhead-success)",
        textColor: "#10b981",
      };
    case "failure":
      return {
        stroke: "#ef4444", // Failure red
        strokeWidth: 2,
        strokeDasharray: "5,5",
        markerEnd: "url(#arrowhead-failure)",
        textColor: "#ef4444",
      };
    case "conditional":
      return {
        stroke: "#6366f1", // Conditional indigo
        strokeWidth: 1.5,
        strokeDasharray: "3,3",
        markerEnd: "url(#arrowhead)",
        textColor: "#6366f1",
      };
    default:
      return baseStyle;
  }
};

/**
 * Format node text for display (truncate if needed)
 * @param {string} text Full text
 * @param {number} maxLength Maximum character length
 * @returns {string} Formatted text
 */
export const formatNodeText = (text, maxLength = 30) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};
