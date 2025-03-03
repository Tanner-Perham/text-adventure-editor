import React, { useState } from "react";
import InnerVoiceEditor from "./InnerVoiceEditor";
import OptionEditor from "./OptionEditor";

const NodeEditor = ({
  node,
  nodeId,
  emotionalStates,
  availableSkills,
  availableItems,
  allNodes,
  onUpdate,
  onRenameNodeId,
}) => {
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [newNodeId, setNewNodeId] = useState(nodeId);
  const [renameError, setRenameError] = useState("");

  // Handler for updating basic properties
  const handleBasicPropertyChange = (property, value) => {
    onUpdate({ [property]: value });
  };

  // Handler for renaming the node ID
  const handleRenameClick = () => {
    setNewNodeId(nodeId);
    setShowRenameInput(true);
    setRenameError("");
  };

  // Handler for submitting the new node ID
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

    if (allNodes[newNodeId] && newNodeId !== nodeId) {
      setRenameError("A node with this ID already exists");
      return;
    }

    // Perform the rename
    onRenameNodeId(nodeId, newNodeId);
    setShowRenameInput(false);
    setRenameError("");
  };

  // Handler for canceling the rename
  const handleRenameCancel = () => {
    setShowRenameInput(false);
    setRenameError("");
  };

  // Handler for adding an option
  const addOption = () => {
    const newOption = {
      id: `option_${Date.now()}`,
      text: "New dialogue option",
      next_node: "",
    };

    onUpdate({
      options: [...(node.options || []), newOption],
    });
  };

  // Handler for updating an option
  const updateOption = (index, updatedOption) => {
    const newOptions = [...(node.options || [])];
    newOptions[index] = {
      ...newOptions[index],
      ...updatedOption,
    };

    onUpdate({ options: newOptions });
  };

  // Handler for deleting an option
  const deleteOption = (index) => {
    const newOptions = [...(node.options || [])];
    newOptions.splice(index, 1);

    onUpdate({ options: newOptions });
  };

  // Handler for adding inner voice
  const addInnerVoice = () => {
    const newInnerVoice = {
      voice_type: "Internal",
      text: "New inner voice comment",
      skill_requirement: 5,
    };

    onUpdate({
      inner_voice_comments: [
        ...(node.inner_voice_comments || []),
        newInnerVoice,
      ],
    });
  };

  // Handler for updating inner voice
  const updateInnerVoice = (index, updatedVoice) => {
    const newComments = [...(node.inner_voice_comments || [])];
    newComments[index] = {
      ...newComments[index],
      ...updatedVoice,
    };

    onUpdate({ inner_voice_comments: newComments });
  };

  // Handler for deleting inner voice
  const deleteInnerVoice = (index) => {
    const newComments = [...(node.inner_voice_comments || [])];
    newComments.splice(index, 1);

    onUpdate({ inner_voice_comments: newComments });
  };

  return (
    <div>
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

      <div className="input-group">
        <label className="input-label">Dialogue Text</label>
        <textarea
          className="input-field textarea-field"
          value={node.text || ""}
          onChange={(e) => handleBasicPropertyChange("text", e.target.value)}
          placeholder="What the character says or the narration text"
        />
      </div>

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

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Inner Voice Comments</h3>
          <button
            onClick={addInnerVoice}
            className="button button-sm button-outline"
          >
            + Add Inner Voice
          </button>
        </div>
        <div className="card-body">
          <InnerVoiceEditor
            innerVoiceComments={node.inner_voice_comments || []}
            onUpdate={updateInnerVoice}
            onDelete={deleteInnerVoice}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Dialogue Options</h3>
          <button
            onClick={addOption}
            className="button button-sm button-primary"
          >
            + Add Option
          </button>
        </div>
        <div className="card-body">
          <OptionEditor
            options={node.options || []}
            allNodes={allNodes}
            availableSkills={availableSkills}
            availableItems={availableItems}
            emotionalStates={emotionalStates}
            onUpdate={updateOption}
            onDelete={deleteOption}
          />
        </div>
      </div>
    </div>
  );
};

export default NodeEditor;
