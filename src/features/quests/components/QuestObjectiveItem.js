import React, { useState } from "react";
import { useQuest } from "../context/QuestContext";
import ObjectiveCompletionEvents from "./ObjectiveCompletionEvents";

/**
 * Component for a single objective item in a quest stage
 */
const QuestObjectiveItem = ({ objective, index, onUpdate, onDelete }) => {
  const { availableItems, availableLocations, getAllNPCs } = useQuest();

  // State for showing/hiding the completion events
  const [showEvents, setShowEvents] = useState(false);

  // Handle basic property changes
  const handlePropertyChange = (property, value) => {
    onUpdate({ [property]: value });
  };

  // Handle boolean properties
  const handleBooleanPropertyChange = (property, checked) => {
    onUpdate({ [property]: checked });
  };

  // Handle required items changes
  const handleRequiredItemsChange = (e) => {
    const selectedItems = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );

    onUpdate({ required_items: selectedItems });
  };

  // Get all NPCs for dropdown
  const npcs = getAllNPCs();

  return (
    <div className="objective-card">
      <div className="objective-card-header">
        <h4 className="objective-index">Objective #{index + 1}</h4>
        <button
          onClick={onDelete}
          className="button button-sm button-danger"
          title="Delete this objective"
        >
          Delete
        </button>
      </div>

      <div className="objective-content">
        <div className="input-group">
          <label className="input-label">ID</label>
          <input
            type="text"
            className="input-field"
            value={objective.id || ""}
            onChange={(e) => handlePropertyChange("id", e.target.value)}
            placeholder="Unique objective ID"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Description</label>
          <textarea
            className="input-field textarea-field"
            value={objective.description || ""}
            onChange={(e) =>
              handlePropertyChange("description", e.target.value)
            }
            placeholder="What the player needs to do"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="checkbox-group">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={objective.is_completed || false}
                onChange={(e) =>
                  handleBooleanPropertyChange("is_completed", e.target.checked)
                }
                className="mr-2"
              />
              <span>Completed</span>
            </label>
          </div>

          <div className="checkbox-group">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={objective.is_optional || false}
                onChange={(e) =>
                  handleBooleanPropertyChange("is_optional", e.target.checked)
                }
                className="mr-2"
              />
              <span>Optional</span>
            </label>
          </div>
        </div>

        <div className="requirements-section">
          <h5 className="section-subtitle">Requirements</h5>

          {/* Required Location */}
          <div className="input-group">
            <label className="input-label">Required Location</label>
            <select
              className="select-field"
              value={objective.required_location || ""}
              onChange={(e) => {
                const value = e.target.value === "" ? null : e.target.value;
                handlePropertyChange("required_location", value);
              }}
            >
              <option value="">-- None --</option>
              {availableLocations &&
                availableLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
            </select>
          </div>

          {/* Required NPC Interaction */}
          <div className="input-group">
            <label className="input-label">Required NPC Interaction</label>
            <select
              className="select-field"
              value={objective.required_npc_interaction || ""}
              onChange={(e) => {
                const value = e.target.value === "" ? null : e.target.value;
                handlePropertyChange("required_npc_interaction", value);
              }}
            >
              <option value="">-- None --</option>
              {npcs &&
                npcs.map((npc) => (
                  <option key={npc} value={npc}>
                    {npc}
                  </option>
                ))}
            </select>
          </div>

          {/* Required Items */}
          <div className="input-group">
            <label className="input-label">Required Items</label>
            <select
              multiple
              className="input-field h-24"
              value={objective.required_items || []}
              onChange={handleRequiredItemsChange}
            >
              {availableItems &&
                availableItems.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
            </select>
            <p className="text-xs text-light mt-1">
              Hold Ctrl/Cmd to select multiple items
            </p>
          </div>

          {/* Required Clues */}
          <div className="input-group">
            <label className="input-label">
              Required Clues (IDs, comma-separated)
            </label>
            <input
              type="text"
              className="input-field"
              value={(objective.required_clues || []).join(", ")}
              onChange={(e) => {
                const clues = e.target.value
                  .split(",")
                  .map((clue) => clue.trim())
                  .filter((clue) => clue.length > 0);
                handlePropertyChange("required_clues", clues);
              }}
              placeholder="clue1, clue2, etc."
            />
          </div>
        </div>

        {/* Completion Events */}
        <div className="completion-events-section">
          <div className="section-header">
            <button
              className="button button-sm button-outline"
              onClick={() => setShowEvents(!showEvents)}
            >
              {showEvents ? "Hide Events" : "Show Events"} (
              {(objective.completion_events || []).length})
            </button>
          </div>

          {showEvents && (
            <ObjectiveCompletionEvents
              events={objective.completion_events || []}
              onUpdate={(newEvents) =>
                handlePropertyChange("completion_events", newEvents)
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestObjectiveItem;
