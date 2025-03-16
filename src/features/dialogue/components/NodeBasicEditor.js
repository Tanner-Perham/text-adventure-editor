import React from "react";
import useNodeEditor from "../hooks/useNodeEditor";

/**
 * Component for editing basic node properties (ID, speaker, text, emotional state)
 * @param {Object} props - Component props
 * @param {string} props.nodeId - ID of the node being edited
 * @param {Array} props.emotionalStates - Available emotional states
 * @param {Function} props.onRenameNodeId - Function to call when node ID is renamed
 */
const NodeBasicEditor = ({ nodeId, emotionalStates, onRenameNodeId }) => {
  const {
    node,
    showRenameInput,
    newNodeId,
    renameError,
    setNewNodeId,
    setRenameError,
    handleBasicPropertyChange,
    handleRenameClick,
    handleRenameCancel,
  } = useNodeEditor(nodeId);

  if (!node) return null;

  // Handle submitting the new node ID
  const handleRenameSubmit = () => {
    // Validate the new node ID
    if (newNodeId === nodeId) {
      setShowRenameInput(false);
      return;
    }

    if (!newNodeId || newNodeId.trim() === "") {
      setRenameError("Node ID cannot be empty");
      return;
    }

    if (newNodeId.includes(" ")) {
      setRenameError("Node ID cannot contain spaces");
      return;
    }

    if (/[^a-zA-Z0-9_]/.test(newNodeId)) {
      setRenameError(
        "Node ID can only contain letters, numbers, and underscores",
      );
      return;
    }

    // Perform the rename
    onRenameNodeId(nodeId, newNodeId);
    setShowRenameInput(false);
    setRenameError("");
  };

  return (
    <div className="node-basic-editor">
      {/* Node ID Section */}
      <div className="input-group">
        <div className="flex justify-between items-center mb-2">
          <label className="input-label">Node ID</label>
          {!showRenameInput && (
            <button
              onClick={handleRenameClick}
              className="button button-sm button-outline"
              title="Rename this node ID"
            >
              Rename
            </button>
          )}
        </div>

        {showRenameInput ? (
          <div className="space-y-2">
            <input
              type="text"
              className={`input-field ${renameError ? "border-danger" : ""}`}
              value={newNodeId}
              onChange={(e) => setNewNodeId(e.target.value)}
              placeholder="Enter new node ID"
              autoFocus
            />
            {renameError && (
              <div className="text-danger text-sm">{renameError}</div>
            )}
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleRenameSubmit}
                className="button button-sm button-primary"
              >
                Save
              </button>
              <button
                onClick={handleRenameCancel}
                className="button button-sm button-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="p-2 bg-light rounded border">{nodeId}</div>
        )}
      </div>

      {/* Speaker */}
      <div className="input-group">
        <label className="input-label">Speaker</label>
        <input
          type="text"
          className="input-field"
          value={node.speaker || ""}
          onChange={(e) => handleBasicPropertyChange("speaker", e.target.value)}
          placeholder="Character or narrator name"
        />
      </div>

      {/* Dialogue Text */}
      <div className="input-group">
        <label className="input-label">Dialogue Text</label>
        <textarea
          className="input-field textarea-field"
          value={node.text || ""}
          onChange={(e) => handleBasicPropertyChange("text", e.target.value)}
          placeholder="What the character says or the narration text"
        />
      </div>

      {/* Emotional State */}
      <div className="input-group">
        <label className="input-label">Emotional State</label>
        <select
          className="select-field"
          value={node.emotional_state || "Neutral"}
          onChange={(e) =>
            handleBasicPropertyChange("emotional_state", e.target.value)
          }
        >
          {emotionalStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default NodeBasicEditor;
