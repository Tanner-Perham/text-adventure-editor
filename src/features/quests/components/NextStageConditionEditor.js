import React from "react";
import { useQuest } from "../context/QuestContext";

/**
 * Component for editing conditions for next stage transitions
 */
const NextStageConditionEditor = ({ condition, onUpdate }) => {
  const { availableItems, availableSkills, availableLocations, getAllNPCs } =
    useQuest();

  // Get all NPCs
  const npcs = getAllNPCs();

  if (!condition) return null;

  // Handle changing the condition type
  const handleTypeChange = (newType) => {
    onUpdate({
      condition_type: newType,
      target_id: "",
      value: null,
    });
  };

  return (
    <div className="condition-editor">
      <div className="input-group">
        <label className="input-label">Condition Type</label>
        <select
          className="select-field"
          value={condition.condition_type}
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          <option value="HasItem">Has Item</option>
          <option value="HasClue">Has Clue</option>
          <option value="LocationVisited">Location Visited</option>
          <option value="NPCRelationship">NPC Relationship</option>
          <option value="SkillValue">Skill Value</option>
          <option value="DialogueChoice">Dialogue Choice</option>
        </select>
      </div>

      {/* Conditional inputs based on condition type */}
      {condition.condition_type === "HasItem" && (
        <div className="input-group">
          <label className="input-label">Item</label>
          <select
            className="select-field"
            value={condition.target_id || ""}
            onChange={(e) =>
              onUpdate({
                ...condition,
                target_id: e.target.value,
              })
            }
          >
            <option value="">-- Select Item --</option>
            {availableItems &&
              availableItems.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
          </select>
        </div>
      )}

      {condition.condition_type === "HasClue" && (
        <div className="input-group">
          <label className="input-label">Clue ID</label>
          <input
            type="text"
            className="input-field"
            value={condition.target_id || ""}
            onChange={(e) =>
              onUpdate({
                ...condition,
                target_id: e.target.value,
              })
            }
            placeholder="Enter clue ID"
          />
        </div>
      )}

      {condition.condition_type === "LocationVisited" && (
        <div className="input-group">
          <label className="input-label">Location</label>
          <select
            className="select-field"
            value={condition.target_id || ""}
            onChange={(e) =>
              onUpdate({
                ...condition,
                target_id: e.target.value,
              })
            }
          >
            <option value="">-- Select Location --</option>
            {availableLocations &&
              availableLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
          </select>
        </div>
      )}

      {condition.condition_type === "NPCRelationship" && (
        <>
          <div className="input-group">
            <label className="input-label">NPC</label>
            <select
              className="select-field"
              value={condition.target_id || ""}
              onChange={(e) =>
                onUpdate({
                  ...condition,
                  target_id: e.target.value,
                })
              }
            >
              <option value="">-- Select NPC --</option>
              {npcs &&
                npcs.map((npc) => (
                  <option key={npc} value={npc}>
                    {npc}
                  </option>
                ))}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Minimum Relationship Value</label>
            <input
              type="number"
              className="input-field"
              value={condition.value || 0}
              onChange={(e) =>
                onUpdate({
                  ...condition,
                  value: parseInt(e.target.value) || 0,
                })
              }
              placeholder="Minimum relationship value required"
            />
          </div>
        </>
      )}

      {condition.condition_type === "SkillValue" && (
        <>
          <div className="input-group">
            <label className="input-label">Skill</label>
            <select
              className="select-field"
              value={condition.target_id || ""}
              onChange={(e) =>
                onUpdate({
                  ...condition,
                  target_id: e.target.value,
                })
              }
            >
              <option value="">-- Select Skill --</option>
              {availableSkills &&
                availableSkills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Minimum Skill Value</label>
            <input
              type="number"
              className="input-field"
              value={condition.value || 0}
              onChange={(e) =>
                onUpdate({
                  ...condition,
                  value: parseInt(e.target.value) || 0,
                })
              }
              placeholder="Minimum skill value required"
            />
          </div>
        </>
      )}

      {condition.condition_type === "DialogueChoice" && (
        <div className="input-group">
          <label className="input-label">Dialogue Option ID</label>
          <input
            type="text"
            className="input-field"
            value={condition.target_id || ""}
            onChange={(e) =>
              onUpdate({
                ...condition,
                target_id: e.target.value,
              })
            }
            placeholder="Enter dialogue option ID"
          />
        </div>
      )}
    </div>
  );
};

export default NextStageConditionEditor;
