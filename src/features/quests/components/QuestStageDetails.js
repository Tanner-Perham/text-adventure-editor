import React, { useState } from "react";
import { useQuest } from "../context/QuestContext";

/**
 * Component for editing basic details of a quest stage
 */
const QuestStageDetails = ({ stage, onUpdate }) => {
  // State for renaming stage ID
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [newStageId, setNewStageId] = useState(stage.id);
  const [idError, setIdError] = useState("");

  // Get all stages to check for ID conflicts
  const { currentQuest } = useQuest();
  const allStages = currentQuest?.stages || [];

  // Handle updating a basic property
  const handlePropertyChange = (property, value) => {
    onUpdate({ [property]: value });
  };

  // Handle renaming the stage ID
  const handleRenameClick = () => {
    setNewStageId(stage.id);
    setShowRenameInput(true);
    setIdError("");
  };

  // Handle submitting the new stage ID
  const handleRenameSubmit = () => {
    // Validation checks
    if (newStageId === stage.id) {
      setShowRenameInput(false);
      return;
    }

    if (!newStageId || newStageId.trim() === "") {
      setIdError("Stage ID cannot be empty");
      return;
    }

    if (newStageId.includes(" ")) {
      setIdError("Stage ID cannot contain spaces");
      return;
    }

    if (/[^a-zA-Z0-9_]/.test(newStageId)) {
      setIdError("Stage ID can only contain letters, numbers, and underscores");
      return;
    }

    // Check if ID already exists in other stages
    if (allStages.some((s) => s.id === newStageId && s.id !== stage.id)) {
      setIdError("A stage with this ID already exists");
      return;
    }

    // Update the stage ID
    onUpdate({ id: newStageId });
    setShowRenameInput(false);
  };

  // Handle canceling the rename
  const handleRenameCancel = () => {
    setShowRenameInput(false);
    setIdError("");
  };

  return (
    <div className="stage-details">
      {/* Stage ID */}
      <div className="input-group">
        <div className="flex justify-between items-center mb-2">
          <label className="input-label">Stage ID</label>
          {!showRenameInput && (
            <button
              onClick={handleRenameClick}
              className="button button-sm button-outline"
              title="Rename this stage ID"
            >
              Rename
            </button>
          )}
        </div>

        {showRenameInput ? (
          <div className="space-y-2">
            <input
              type="text"
              className={`input-field ${idError ? "border-danger" : ""}`}
              value={newStageId}
              onChange={(e) => setNewStageId(e.target.value)}
              placeholder="Enter new stage ID"
              autoFocus
            />
            {idError && <div className="text-danger text-sm">{idError}</div>}
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
          <div className="p-2 bg-light rounded border">{stage.id}</div>
        )}
      </div>

      {/* Description */}
      <div className="input-group">
        <label className="input-label">Description</label>
        <textarea
          className="input-field textarea-field"
          value={stage.description || ""}
          onChange={(e) => handlePropertyChange("description", e.target.value)}
          placeholder="Stage description"
          rows={3}
        />
      </div>

      {/* Notification Text */}
      <div className="input-group">
        <label className="input-label">Notification Text</label>
        <textarea
          className="input-field textarea-field"
          value={stage.notification_text || ""}
          onChange={(e) =>
            handlePropertyChange("notification_text", e.target.value)
          }
          placeholder="Text displayed when this stage becomes active"
          rows={2}
        />
      </div>

      {/* Status */}
      <div className="input-group">
        <label className="input-label">Status</label>
        <select
          className="select-field"
          value={stage.status || "NotStarted"}
          onChange={(e) => handlePropertyChange("status", e.target.value)}
        >
          <option value="NotStarted">Not Started</option>
          <option value="InProgress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Failed">Failed</option>
        </select>
      </div>
    </div>
  );
};

export default QuestStageDetails;
