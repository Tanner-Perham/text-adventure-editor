import React from "react";

const NodeList = ({
  nodes,
  currentNode,
  onSelectNode,
  onAddNode,
  onDeleteNode,
  searchTerm,
  onSearchChange,
  onExportJSON,
  onImportJSON,
  onImportYAML, // Add new prop for YAML import
}) => {
  // Filter nodes based on search term
  const filteredNodes = Object.entries(nodes)
    .filter(([id, node]) => {
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();
      return (
        id.toLowerCase().includes(searchLower) ||
        node.text.toLowerCase().includes(searchLower) ||
        node.speaker.toLowerCase().includes(searchLower)
      );
    })
    .sort(([idA], [idB]) => idA.localeCompare(idB));

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <button
            onClick={onExportJSON}
            className="button button-outline button-sm"
            title="Export to JSON"
          >
            Export
          </button>
        </div>
      </div>

      {/* Let's add separate import buttons with better UX */}
      <div className="flex gap-2 mb-4">
        <label className="button button-outline button-sm cursor-pointer flex-1 text-center">
          Import JSON
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={onImportJSON}
          />
        </label>
        <label className="button button-outline button-sm cursor-pointer flex-1 text-center">
          Import YAML
          <input
            type="file"
            accept=".yaml,.yml"
            className="hidden"
            onChange={onImportYAML}
          />
        </label>
      </div>

      <div className="search-box">
        <span className="search-icon">
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
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <button onClick={onAddNode} className="button button-primary w-full mb-4">
        + Add New Node
      </button>

      <div className="node-list">
        {filteredNodes.length === 0 ? (
          <p className="text-center text-light">No nodes found</p>
        ) : (
          filteredNodes.map(([id, node]) => (
            <div
              key={id}
              className={`node-card ${id === currentNode ? "active" : ""}`}
              onClick={() => onSelectNode(id)}
            >
              <div className="node-card-header">
                <div className="node-id">{id}</div>
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNode(id);
                  }}
                  title="Delete node"
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
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              {node.speaker && (
                <div className="node-speaker">{node.speaker}</div>
              )}
              <div className="node-text">{node.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NodeList;
