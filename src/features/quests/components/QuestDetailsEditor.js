import React, { useState } from "react";
import { useQuest } from "../context/QuestContext";

/**
 * Component for editing basic quest properties
 */
const QuestDetailsEditor = ({ quest, onUpdate }) => {
  const { availableLocations } = useQuest();

  // State for rename functionality
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [newQuestId, setNewQuestId] = useState(quest.id);
  const [idError, setIdError] = useState("");

  // Handle updating basic properties
  const handleBasicPropertyChange = (property, value) => {
    onUpdate({ [property]: value });
  };

  // Handle boolean properties
  const handleBooleanPropertyChange = (property, checked) => {
    onUpdate({ [property]: checked });
  };

  // Handle renaming quest ID
  const handleRenameClick = () => {
    setNewQuestId(quest.id);
    setShowRenameInput(true);
    setIdError("");
  };

  // Handle submitting new quest ID
  const handleRenameSubmit = () => {
    // Validation checks
    if (newQuestId === quest.id) {
      setShowRenameInput(false);
      return;
    }

    if (!newQuestId || newQuestId.trim() === "") {
      setIdError("Quest ID cannot be empty");
      return;
    }

    if (newQuestId.includes(" ")) {
      setIdError("Quest ID cannot contain spaces");
      return;
    }

    if (/[^a-zA-Z0-9_]/.test(newQuestId)) {
      setIdError("Quest ID can only contain letters, numbers, and underscores");
      return;
    }

    // At this point we would rename the quest ID in the parent component
    // For now, just updating the ID field of the quest
    onUpdate({ id: newQuestId });
    setShowRenameInput(false);
  };

  // Handle canceling rename
  const handleRenameCancel = () => {
    setShowRenameInput(false);
    setIdError("");
  };

  // Handle updating related NPCs
  const handleRelatedNPCs = (e) => {
    const selectedNPCs = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    onUpdate({ related_npcs: selectedNPCs });
  };

  // Handle updating related locations
  const handleRelatedLocations = (e) => {
    const selectedLocations = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    onUpdate({ related_locations: selectedLocations });
  };

  // Get all NPC IDs
  const { getAllNPCs } = useQuest();
  const allNPCs = getAllNPCs();

  return (
    <div className="quest-details-editor">
      {/* Quest ID Section */}
      <div className="input-group">
        <div className="flex justify-between items-center mb-2">
          <label className="input-label">Quest ID</label>
          {!showRenameInput && (
            <button
              onClick={handleRenameClick}
              className="button button-sm button-outline"
              title="Rename this quest ID"
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
              value={newQuestId}
              onChange={(e) => setNewQuestId(e.target.value)}
              placeholder="Enter new quest ID"
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
          <div className="p-2 bg-light rounded border">{quest.id}</div>
        )}
      </div>

      {/* Title */}
      <div className="input-group">
        <label className="input-label">Title</label>
        <input
          type="text"
          className="input-field"
          value={quest.title || ""}
          onChange={(e) => handleBasicPropertyChange("title", e.target.value)}
          placeholder="Quest title"
        />
      </div>

      {/* Description */}
      <div className="input-group">
        <label className="input-label">Description</label>
        <textarea
          className="input-field textarea-field"
          value={quest.description || ""}
          onChange={(e) =>
            handleBasicPropertyChange("description", e.target.value)
          }
          placeholder="Full quest description"
          rows={4}
        />
      </div>

      {/* Short Description */}
      <div className="input-group">
        <label className="input-label">Short Description</label>
        <textarea
          className="input-field textarea-field"
          value={quest.short_description || ""}
          onChange={(e) =>
            handleBasicPropertyChange("short_description", e.target.value)
          }
          placeholder="Brief quest description for journal"
          rows={2}
        />
      </div>

      {/* Quest Type & Options */}
      <div className="grid grid-cols-2 gap-4">
        <div className="input-group">
          <label className="input-label">Quest Type</label>
          <select
            className="select-field"
            value={quest.importance || "Side"}
            onChange={(e) =>
              handleBasicPropertyChange("importance", e.target.value)
            }
          >
            <option value="Main">Main</option>
            <option value="Side">Side</option>
            <option value="Misc">Misc</option>
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Options</label>
          <div className="flex flex-col gap-2 mt-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={quest.is_main_quest || false}
                onChange={(e) =>
                  handleBooleanPropertyChange("is_main_quest", e.target.checked)
                }
                className="mr-2"
              />
              <span>Main Quest</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={quest.is_hidden || false}
                onChange={(e) =>
                  handleBooleanPropertyChange("is_hidden", e.target.checked)
                }
                className="mr-2"
              />
              <span>Hidden Quest</span>
            </label>
          </div>
        </div>
      </div>

      {/* Related NPCs */}
      <div className="input-group">
        <label className="input-label">Related NPCs</label>
        <select
          multiple
          className="input-field h-32"
          value={quest.related_npcs || []}
          onChange={handleRelatedNPCs}
        >
          {allNPCs.map((npc) => (
            <option key={npc} value={npc}>
              {npc}
            </option>
          ))}
        </select>
        <p className="text-xs text-light mt-1">
          Hold Ctrl/Cmd to select multiple NPCs
        </p>
      </div>

      {/* Related Locations */}
      <div className="input-group">
        <label className="input-label">Related Locations</label>
        <select
          multiple
          className="input-field h-32"
          value={quest.related_locations || []}
          onChange={handleRelatedLocations}
        >
          {availableLocations &&
            availableLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
        </select>
        <p className="text-xs text-light mt-1">
          Hold Ctrl/Cmd to select multiple locations
        </p>
      </div>
    </div>
  );
};

export default QuestDetailsEditor;
