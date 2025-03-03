import React from "react";
import SkillCheckEditor from "./SkillCheckEditor";

const OptionEditor = ({
  options,
  allNodes,
  availableSkills,
  availableItems,
  emotionalStates,
  onUpdate,
  onDelete,
}) => {
  // Handler for adding a skill check to an option
  const addSkillCheck = (optionIndex) => {
    onUpdate(optionIndex, {
      skill_check: {
        base_difficulty: 10,
        primary_skill: availableSkills[0],
        supporting_skills: [],
        emotional_modifiers: {},
        white_check: true,
        hidden: false,
      },
    });
  };

  // Handler for updating a skill check
  const updateSkillCheck = (optionIndex, updatedSkillCheck) => {
    onUpdate(optionIndex, {
      skill_check: {
        ...options[optionIndex].skill_check,
        ...updatedSkillCheck,
      },
    });
  };

  // Handler for removing a skill check
  const removeSkillCheck = (optionIndex) => {
    onUpdate(optionIndex, { skill_check: null });
  };

  // Handler for adding emotional impact
  const addEmotionalImpact = (optionIndex) => {
    onUpdate(optionIndex, {
      emotional_impact: {},
    });
  };

  // Handler for updating emotional impact
  const updateEmotionalImpact = (optionIndex, emotion, value) => {
    const newEmotionalImpact = {
      ...options[optionIndex].emotional_impact,
      [emotion]: parseInt(value),
    };

    onUpdate(optionIndex, { emotional_impact: newEmotionalImpact });
  };

  // Handler for removing emotional impact
  const removeEmotionalImpact = (optionIndex) => {
    onUpdate(optionIndex, { emotional_impact: null });
  };

  // Handler for adding conditions
  const addConditions = (optionIndex) => {
    onUpdate(optionIndex, {
      conditions: {
        required_items: [],
        required_skills: {},
      },
    });
  };

  // Handler for removing conditions
  const removeConditions = (optionIndex) => {
    onUpdate(optionIndex, { conditions: null });
  };

  if (options.length === 0) {
    return (
      <div className="text-gray-400 italic text-sm p-3 border rounded">
        No dialogue options. Add some to give the player choices.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {options.map((option, idx) => (
        <div key={idx} className="border p-3 rounded bg-gray-50">
          <div className="flex justify-between mb-2">
            <h4 className="font-medium">Option #{idx + 1}</h4>
            <button
              onClick={() => onDelete(idx)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              Option Text
            </label>
            <textarea
              className="w-full p-2 border rounded"
              value={option.text}
              onChange={(e) => onUpdate(idx, { text: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-sm font-medium mb-1">ID</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={option.id}
                onChange={(e) => onUpdate(idx, { id: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Next Node
              </label>
              <select
                className="w-full p-2 border rounded"
                value={option.next_node || ""}
                onChange={(e) => onUpdate(idx, { next_node: e.target.value })}
              >
                <option value="">-- None --</option>
                {Object.keys(allNodes).map((nodeId) => (
                  <option key={nodeId} value={nodeId}>
                    {nodeId}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Skill Check */}
          <div className="mb-2">
            {option.skill_check ? (
              <SkillCheckEditor
                skillCheck={option.skill_check}
                availableSkills={availableSkills}
                emotionalStates={emotionalStates}
                onUpdate={(updates) => updateSkillCheck(idx, updates)}
                onRemove={() => removeSkillCheck(idx)}
              />
            ) : (
              <button
                onClick={() => addSkillCheck(idx)}
                className="text-blue-500 text-sm hover:text-blue-700"
              >
                + Add Skill Check
              </button>
            )}
          </div>

          {/* Emotional Impact */}
          <div className="mb-2">
            {option.emotional_impact ? (
              <div className="border p-2 rounded bg-green-50">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-sm">Emotional Impact</h5>
                  <button
                    onClick={() => removeEmotionalImpact(idx)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {emotionalStates.map((state) => (
                    <div key={state} className="flex items-center">
                      <label className="text-xs w-1/2">{state}:</label>
                      <input
                        type="number"
                        className="w-1/2 p-1 border rounded text-sm"
                        value={option.emotional_impact[state] || 0}
                        onChange={(e) =>
                          updateEmotionalImpact(idx, state, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() => addEmotionalImpact(idx)}
                className="text-green-500 text-sm hover:text-green-700"
              >
                + Add Emotional Impact
              </button>
            )}
          </div>

          {/* Conditions */}
          <div className="mb-2">
            {option.conditions ? (
              <div className="border p-2 rounded bg-purple-50">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-sm">Conditions</h5>
                  <button
                    onClick={() => removeConditions(idx)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                {/* Required Items */}
                <div className="mb-2">
                  <label className="block text-xs font-medium">
                    Required Items
                  </label>
                  <select
                    multiple
                    className="w-full p-1 border rounded text-sm h-20"
                    value={option.conditions.required_items || []}
                    onChange={(e) => {
                      const selectedItems = Array.from(
                        e.target.selectedOptions,
                        (option) => option.value,
                      );
                      onUpdate(idx, {
                        conditions: {
                          ...option.conditions,
                          required_items: selectedItems,
                        },
                      });
                    }}
                  >
                    {availableItems.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Required Skills */}
                <div>
                  <label className="block text-xs font-medium">
                    Required Skills
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSkills.map((skill) => (
                      <div key={skill} className="flex items-center">
                        <label className="text-xs w-1/2">{skill}:</label>
                        <input
                          type="number"
                          className="w-1/2 p-1 border rounded text-sm"
                          value={
                            option.conditions.required_skills?.[skill] || 0
                          }
                          onChange={(e) => {
                            const newRequiredSkills = {
                              ...option.conditions.required_skills,
                              [skill]: parseInt(e.target.value) || 0,
                            };
                            onUpdate(idx, {
                              conditions: {
                                ...option.conditions,
                                required_skills: newRequiredSkills,
                              },
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => addConditions(idx)}
                className="text-purple-500 text-sm hover:text-purple-700"
              >
                + Add Conditions
              </button>
            )}
          </div>

          {/* Script Effects */}
          <div className="mb-2">
            {option.script_effects ? (
              <div className="border p-2 rounded bg-yellow-50">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-sm">Script Effects</h5>
                  <button
                    onClick={() => onUpdate(idx, { script_effects: null })}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  className="w-full p-1 border rounded text-sm font-mono"
                  value={option.script_effects}
                  rows={3}
                  placeholder="Enter script commands..."
                  onChange={(e) =>
                    onUpdate(idx, { script_effects: e.target.value })
                  }
                />
              </div>
            ) : (
              <button
                onClick={() => onUpdate(idx, { script_effects: "" })}
                className="text-yellow-500 text-sm hover:text-yellow-700"
              >
                + Add Script Effects
              </button>
            )}
          </div>

          {/* Item Rewards */}
          <div className="mb-2">
            {option.item_rewards ? (
              <div className="border p-2 rounded bg-indigo-50">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-sm">Item Rewards</h5>
                  <button
                    onClick={() => onUpdate(idx, { item_rewards: null })}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <select
                  multiple
                  className="w-full p-1 border rounded text-sm h-20"
                  value={option.item_rewards || []}
                  onChange={(e) => {
                    const selectedRewards = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value,
                    );
                    onUpdate(idx, { item_rewards: selectedRewards });
                  }}
                >
                  {availableItems.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <button
                onClick={() => onUpdate(idx, { item_rewards: [] })}
                className="text-indigo-500 text-sm hover:text-indigo-700"
              >
                + Add Item Rewards
              </button>
            )}
          </div>

          {/* Special Flags */}
          <div className="mb-2">
            <div className="flex flex-wrap gap-2 mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={option.is_default || false}
                  onChange={(e) =>
                    onUpdate(idx, { is_default: e.target.checked })
                  }
                />
                <span className="text-xs">Default Option</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={option.is_fallback || false}
                  onChange={(e) =>
                    onUpdate(idx, { is_fallback: e.target.checked })
                  }
                />
                <span className="text-xs">Fallback Option</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={option.is_hidden || false}
                  onChange={(e) =>
                    onUpdate(idx, { is_hidden: e.target.checked })
                  }
                />
                <span className="text-xs">Hidden Option</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={option.is_once_only || false}
                  onChange={(e) =>
                    onUpdate(idx, { is_once_only: e.target.checked })
                  }
                />
                <span className="text-xs">Once Only</span>
              </label>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OptionEditor;
