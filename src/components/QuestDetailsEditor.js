import React, { useState } from "react";

const QuestDetailsEditor = ({
  quest,
  onUpdate,
  availableSkills,
  availableItems,
  availableLocations,
  dialogueTrees,
}) => {
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
    // This would require a more complex update function that would handle ID changes

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

  // Get all NPC IDs from dialogue trees
  const getAllNPCs = () => {
    const npcSet = new Set();

    Object.values(dialogueTrees).forEach((node) => {
      if (node.speaker && node.speaker.trim() !== "") {
        npcSet.add(node.speaker);
      }
    });

    return Array.from(npcSet).sort();
  };

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
          {getAllNPCs().map((npc) => (
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

      {/* Rewards Section */}
      <div className="card mt-6">
        <div className="card-header">
          <h3 className="card-title">Quest Rewards</h3>
        </div>
        <div className="card-body">
          <QuestRewardsEditor
            rewards={quest.rewards || {}}
            onUpdate={(updatedRewards) => onUpdate({ rewards: updatedRewards })}
            availableSkills={availableSkills}
            availableItems={availableItems}
            dialogueTrees={dialogueTrees}
          />
        </div>
      </div>
    </div>
  );
};

// Quest Rewards Editor Component
const QuestRewardsEditor = ({
  rewards,
  onUpdate,
  availableSkills,
  availableItems,
  dialogueTrees,
}) => {
  // Handle updating an experience value
  const handleExperienceChange = (value) => {
    onUpdate({
      ...rewards,
      experience: parseInt(value) || 0,
    });
  };

  // Handle adding an item reward
  const handleAddItemReward = (itemId) => {
    if (!itemId || rewards.items.some((item) => item.id === itemId)) return;

    const newItem = {
      id: itemId,
      name: itemId, // For simplicity, using ID as name
      description: `A reward from the quest`,
      effects: {},
    };

    onUpdate({
      ...rewards,
      items: [...(rewards.items || []), newItem],
    });
  };

  // Handle removing an item reward
  const handleRemoveItemReward = (itemIndex) => {
    const newItems = [...rewards.items];
    newItems.splice(itemIndex, 1);

    onUpdate({
      ...rewards,
      items: newItems,
    });
  };

  // Handle updating skill rewards
  const handleSkillRewardChange = (skill, value) => {
    const updatedSkillRewards = {
      ...(rewards.skill_rewards || {}),
      [skill]: parseInt(value) || 0,
    };

    onUpdate({
      ...rewards,
      skill_rewards: updatedSkillRewards,
    });
  };

  // Handle adding a relationship change
  const handleAddRelationship = (npcId) => {
    if (!npcId || rewards.relationship_changes?.[npcId] !== undefined) return;

    onUpdate({
      ...rewards,
      relationship_changes: {
        ...(rewards.relationship_changes || {}),
        [npcId]: 0,
      },
    });
  };

  // Handle updating relationship value
  const handleRelationshipChange = (npcId, value) => {
    onUpdate({
      ...rewards,
      relationship_changes: {
        ...(rewards.relationship_changes || {}),
        [npcId]: parseInt(value) || 0,
      },
    });
  };

  // Handle removing relationship change
  const handleRemoveRelationship = (npcId) => {
    const newRelationships = { ...(rewards.relationship_changes || {}) };
    delete newRelationships[npcId];

    onUpdate({
      ...rewards,
      relationship_changes: newRelationships,
    });
  };

  // Get all NPC IDs from dialogue trees
  const getAllNPCs = () => {
    const npcSet = new Set();

    Object.values(dialogueTrees).forEach((node) => {
      if (node.speaker && node.speaker.trim() !== "") {
        npcSet.add(node.speaker);
      }
    });

    return Array.from(npcSet).sort();
  };

  return (
    <div>
      {/* Experience Points */}
      <div className="input-group">
        <label className="input-label">Experience Points</label>
        <input
          type="number"
          className="input-field"
          value={rewards.experience || 0}
          onChange={(e) => handleExperienceChange(e.target.value)}
          min="0"
        />
      </div>

      {/* Item Rewards */}
      <div className="input-group">
        <label className="input-label">Item Rewards</label>
        <div className="flex gap-2 mb-2">
          <select
            className="input-field flex-grow"
            onChange={(e) => {
              if (e.target.value) {
                handleAddItemReward(e.target.value);
                e.target.value = ""; // Reset select after adding
              }
            }}
            value=""
          >
            <option value="">-- Select item to add --</option>
            {availableItems &&
              availableItems.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
          </select>
        </div>

        {/* List of current item rewards */}
        {rewards.items && rewards.items.length > 0 ? (
          <div className="space-y-2 mt-2">
            {rewards.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-light p-2 rounded"
              >
                <span>{item.name || item.id}</span>
                <button
                  onClick={() => handleRemoveItemReward(index)}
                  className="text-danger"
                  title="Remove item"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-light">No item rewards added</p>
        )}
      </div>

      {/* Skill Rewards */}
      <div className="input-group">
        <label className="input-label">Skill Rewards</label>
        <div className="grid grid-cols-2 gap-2">
          {availableSkills &&
            availableSkills.map((skill) => (
              <div key={skill} className="flex items-center">
                <label className="w-1/2 text-sm">{skill}:</label>
                <input
                  type="number"
                  className="input-field p-1"
                  value={rewards.skill_rewards?.[skill] || 0}
                  onChange={(e) =>
                    handleSkillRewardChange(skill, e.target.value)
                  }
                  min="-10"
                  max="10"
                />
              </div>
            ))}
        </div>
      </div>

      {/* Relationship Changes */}
      <div className="input-group">
        <label className="input-label">Relationship Changes</label>
        <div className="flex gap-2 mb-2">
          <select
            className="input-field flex-grow"
            onChange={(e) => {
              if (e.target.value) {
                handleAddRelationship(e.target.value);
                e.target.value = ""; // Reset select after adding
              }
            }}
            value=""
          >
            <option value="">-- Select NPC to add --</option>
            {getAllNPCs().map((npc) => (
              <option key={npc} value={npc}>
                {npc}
              </option>
            ))}
          </select>
        </div>

        {/* List of current relationship changes */}
        {rewards.relationship_changes &&
        Object.keys(rewards.relationship_changes).length > 0 ? (
          <div className="space-y-2 mt-2">
            {Object.entries(rewards.relationship_changes).map(
              ([npcId, value]) => (
                <div
                  key={npcId}
                  className="flex items-center justify-between bg-light p-2 rounded"
                >
                  <span>{npcId}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="input-field p-1 w-16"
                      value={value}
                      onChange={(e) =>
                        handleRelationshipChange(npcId, e.target.value)
                      }
                      min="-100"
                      max="100"
                    />
                    <button
                      onClick={() => handleRemoveRelationship(npcId)}
                      className="text-danger"
                      title="Remove relationship change"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <p className="text-xs text-light">No relationship changes added</p>
        )}
      </div>
    </div>
  );
};

export default QuestDetailsEditor;
