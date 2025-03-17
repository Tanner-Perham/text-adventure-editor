import React from "react";
import { useQuest } from "../context/QuestContext";

/**
 * Component for editing quest rewards
 */
const QuestRewardsEditor = ({ rewards, onUpdate }) => {
  const { availableSkills, availableItems, getAllNPCs } = useQuest();

  // For simplicity, initialize empty rewards if not provided
  const rewardsData = rewards || {
    items: [],
    skill_rewards: {},
    relationship_changes: {},
    experience: 0,
    unlocked_locations: [],
    unlocked_dialogues: [],
  };

  // Handle updating an experience value
  const handleExperienceChange = (value) => {
    onUpdate({
      ...rewardsData,
      experience: parseInt(value) || 0,
    });
  };

  // Handle adding an item reward
  const handleAddItemReward = (itemId) => {
    if (!itemId || rewardsData.items.some((item) => item.id === itemId)) return;

    const newItem = {
      id: itemId,
      name: itemId, // For simplicity, using ID as name
      description: `A reward from the quest`,
      effects: {},
    };

    onUpdate({
      ...rewardsData,
      items: [...(rewardsData.items || []), newItem],
    });
  };

  // Handle removing an item reward
  const handleRemoveItemReward = (itemIndex) => {
    const newItems = [...rewardsData.items];
    newItems.splice(itemIndex, 1);

    onUpdate({
      ...rewardsData,
      items: newItems,
    });
  };

  // Handle updating skill rewards
  const handleSkillRewardChange = (skill, value) => {
    const updatedSkillRewards = {
      ...(rewardsData.skill_rewards || {}),
      [skill]: parseInt(value) || 0,
    };

    onUpdate({
      ...rewardsData,
      skill_rewards: updatedSkillRewards,
    });
  };

  // Handle adding a relationship change
  const handleAddRelationship = (npcId) => {
    if (!npcId || rewardsData.relationship_changes?.[npcId] !== undefined)
      return;

    onUpdate({
      ...rewardsData,
      relationship_changes: {
        ...(rewardsData.relationship_changes || {}),
        [npcId]: 0,
      },
    });
  };

  // Handle updating relationship value
  const handleRelationshipChange = (npcId, value) => {
    onUpdate({
      ...rewardsData,
      relationship_changes: {
        ...(rewardsData.relationship_changes || {}),
        [npcId]: parseInt(value) || 0,
      },
    });
  };

  // Handle removing relationship change
  const handleRemoveRelationship = (npcId) => {
    const newRelationships = { ...(rewardsData.relationship_changes || {}) };
    delete newRelationships[npcId];

    onUpdate({
      ...rewardsData,
      relationship_changes: newRelationships,
    });
  };

  // Get all available NPCs
  const allNPCs = getAllNPCs();

  return (
    <div>
      {/* Experience Points */}
      <div className="input-group">
        <label className="input-label">Experience Points</label>
        <input
          type="number"
          className="input-field"
          value={rewardsData.experience || 0}
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
        {rewardsData.items && rewardsData.items.length > 0 ? (
          <div className="space-y-2 mt-2">
            {rewardsData.items.map((item, index) => (
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
                  value={rewardsData.skill_rewards?.[skill] || 0}
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
            {allNPCs.map((npc) => (
              <option key={npc} value={npc}>
                {npc}
              </option>
            ))}
          </select>
        </div>

        {/* List of current relationship changes */}
        {rewardsData.relationship_changes &&
        Object.keys(rewardsData.relationship_changes).length > 0 ? (
          <div className="space-y-2 mt-2">
            {Object.entries(rewardsData.relationship_changes).map(
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

export default QuestRewardsEditor;
