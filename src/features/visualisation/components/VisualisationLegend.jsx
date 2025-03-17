import React from "react";

/**
 * Legend component that explains visualisation elements
 * Adapts based on the current view mode
 */
const VisualisationLegend = ({ viewMode }) => {
  return (
    <div className="p-2 border-t border-gray-200 flex items-center gap-4 text-sm">
      {/* Common path types for all visualisations */}
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

      {/* View mode specific legend items */}
      {viewMode === "flow" && (
        <>
          <div className="flex items-center ml-4">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            <span>Current Node</span>
          </div>

          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-gray-100 mr-1"></div>
            <span>Referenced Node</span>
          </div>
        </>
      )}

      {viewMode === "tree" && (
        <div className="flex items-center ml-4">
          <div className="w-3 h-3 rounded-full border-2 border-red-500 mr-1"></div>
          <span>Cyclic Reference</span>
        </div>
      )}

      {viewMode === "timeline" && (
        <div className="flex items-center ml-4">
          <div className="w-4 h-1 border-t-2 border-dashed border-gray-400 mr-1"></div>
          <span>Branching Paths</span>
        </div>
      )}

      {/* Quest-related legend items when relevant */}
      {viewMode === "flow" && (
        <div className="flex items-center ml-4">
          <div className="w-3 h-3 rounded-full border-l-2 border-yellow-500 mr-1"></div>
          <span>Quest-Related</span>
        </div>
      )}
    </div>
  );
};

export default VisualisationLegend;
