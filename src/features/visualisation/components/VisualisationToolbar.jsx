import React from "react";

/**
 * Toolbar component for visualisation controls
 * Contains controls for view mode, display options, and zoom
 */
const VisualisationToolbar = ({
  viewMode,
  showNodeDetails,
  showQuestsInVisualisation,
  onViewModeChange,
  onShowNodeDetailsChange,
  onShowQuestsInVisualisationChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  return (
    <div className="visualisation-toolbar">
      <h2 className="panel-title">Dialogue Visualisation</h2>

      <div className="visualisation-controls flex items-center gap-4">
        {/* View Mode Selector */}
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

        {/* Display Options */}
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            className="mr-2"
            checked={showNodeDetails}
            onChange={(e) => onShowNodeDetailsChange(e.target.checked)}
          />
          Show Node Details
        </label>

        {showQuestsInVisualisation !== undefined && (
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              className="mr-2"
              checked={showQuestsInVisualisation}
              onChange={(e) => {
                // Make sure we have the handler before calling it
                if (typeof onShowQuestsInVisualisationChange === "function") {
                  onShowQuestsInVisualisationChange(e.target.checked);
                }
              }}
            />
            Show Quest Relationships
          </label>
        )}

        {/* Zoom Controls */}
        <div className="zoom-controls flex gap-2">
          <button
            onClick={onZoomIn}
            className="button button-sm button-outline"
            title="Zoom In"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>

          <button
            onClick={onZoomOut}
            className="button button-sm button-outline"
            title="Zoom Out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>

          <button
            onClick={onResetZoom}
            className="button button-sm button-outline"
            title="Reset View"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisualisationToolbar;
