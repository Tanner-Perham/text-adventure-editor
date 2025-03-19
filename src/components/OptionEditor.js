import React, { useState, useEffect, useRef } from "react";
import SkillCheckEditor from "./SkillCheckEditor";
import ConsequenceEditor from "./ConsequenceEditor";

const OptionEditor = ({
  options,
  allNodes,
  availableSkills,
  availableItems,
  emotionalStates,
  quests, // Add quests parameter
  onUpdate,
  onDelete,
}) => {
  // State for dropdown menus
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Keep track of quest-related options
  const [questRelatedOptions, setQuestRelatedOptions] = useState({});

  // Dropdown reference for click outside handling
  const dropdownRef = useRef(null);

  // Detect quest-related options
  useEffect(() => {
    if (!options || !quests) return;

    const relatedOptions = {};
    options.forEach((option, index) => {
      if (option.consequences) {
        const questIds = new Set();

        option.consequences.forEach((effect) => {
          const questId = getQuestIdFromEffect(effect);
          if (questId) {
            questIds.add(questId);
          }
        });

        if (questIds.size > 0) {
          relatedOptions[index] = Array.from(questIds);
        }
      }
    });

    setQuestRelatedOptions(relatedOptions);
  }, [options, quests]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle dropdown menu
  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  // Helper function to extract quest ID from a dialogue effect
  const getQuestIdFromEffect = (effect) => {
    if (!effect || !effect.event_type) return null;

    switch (effect.event_type) {
      case "StartQuest":
        return typeof effect.data === "string" ? effect.data : null;
      case "AdvanceQuest":
      case "CompleteQuestObjective":
      case "UnlockQuestBranch":
        return Array.isArray(effect.data) && effect.data.length > 0
          ? effect.data[0]
          : null;
      case "FailQuest":
        return typeof effect.data === "string" ? effect.data : null;
      case "AddQuestItem":
        return effect.data?.quest_id || null;
      case "RevealClue":
        return effect.data?.related_quest || null;
      default:
        return null;
    }
  };

  // Check if option is related to any quest
  const isQuestRelatedOption = (index) => {
    return questRelatedOptions[index] && questRelatedOptions[index].length > 0;
  };

  // Get quest titles for tooltips
  const getQuestTitles = (index) => {
    if (!questRelatedOptions[index]) return "";

    return questRelatedOptions[index]
      .map((questId) => quests[questId]?.title || questId)
      .join(", ");
  };

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
      // When adding a skill check, also initialize success and failure nodes
      success_node: "",
      failure_node: "",
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
    // When removing a skill check, also remove success and failure nodes
    onUpdate(optionIndex, {
      skill_check: null,
      success_node: null,
      failure_node: null,
    });
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

  // Handler for adding consequences (dialogue effects)
  const addConsequences = (optionIndex) => {
    // Create with default first effect
    const defaultEffect = {
      event_type: "ModifyRelationship",
      data: ["", 0], // Default to empty NPC ID and 0 value
    };

    onUpdate(optionIndex, {
      consequences: [defaultEffect],
    });
  };

  // Handler for adding a specific consequence type
  const addConsequence = (optionIndex, eventType) => {
    let newConsequence;

    switch (eventType) {
      case "ModifyRelationship":
        newConsequence = {
          event_type: "ModifyRelationship",
          data: ["", 0], // NPC ID, relationship change value
        };
        break;
      case "ChangeEmotionalState":
        newConsequence = {
          event_type: "ChangeEmotionalState",
          data: "Neutral", // Default emotional state
        };
        break;
      case "RevealClue":
        newConsequence = {
          event_type: "RevealClue",
          data: {
            id: `clue_${Date.now()}`,
            description: "New clue revealed",
            related_quest: "",
            discovered: true,
          },
        };
        break;
      case "UnlockThought":
        newConsequence = {
          event_type: "UnlockThought",
          data: "",
        };
        break;
      case "ModifySkill":
        newConsequence = {
          event_type: "ModifySkill",
          data: ["", 0], // Skill name, change value
        };
        break;
      case "TriggerEvent":
        newConsequence = {
          event_type: "TriggerEvent",
          data: "",
        };
        break;
      case "ModifyQuestStatus":
        newConsequence = {
          event_type: "ModifyQuestStatus",
          data: ["", "InProgress"], // Quest ID, new status
        };
        break;
      case "UnlockDialogueNode":
        newConsequence = {
          event_type: "UnlockDialogueNode",
          data: "",
        };
        break;
      case "LockDialogueNode":
        newConsequence = {
          event_type: "LockDialogueNode",
          data: "",
        };
        break;
      case "StartQuest":
        newConsequence = {
          event_type: "StartQuest",
          data: "", // Quest ID
        };
        break;
      case "AdvanceQuest":
        newConsequence = {
          event_type: "AdvanceQuest",
          data: ["", ""], // Quest ID, Stage ID
        };
        break;
      case "CompleteQuestObjective":
        newConsequence = {
          event_type: "CompleteQuestObjective",
          data: ["", ""], // Quest ID, Objective ID
        };
        break;
      case "FailQuest":
        newConsequence = {
          event_type: "FailQuest",
          data: "", // Quest ID
        };
        break;
      case "AddQuestItem":
        newConsequence = {
          event_type: "AddQuestItem",
          data: {
            quest_id: "",
            item: {
              id: "",
              name: "",
              description: "",
              effects: {},
            },
          },
        };
        break;
      case "UnlockQuestBranch":
        newConsequence = {
          event_type: "UnlockQuestBranch",
          data: ["", ""], // Quest ID, Branch ID
        };
        break;
      default:
        newConsequence = {
          event_type: eventType,
          data: "",
        };
    }

    // Add new consequence to the existing array or create a new array
    const currentConsequences = options[optionIndex].consequences || [];
    onUpdate(optionIndex, {
      consequences: [...currentConsequences, newConsequence],
    });

    // Close the dropdown after selecting
    setActiveDropdown(null);
  };

  // Handler for updating a consequence
  const updateConsequence = (
    optionIndex,
    consequenceIndex,
    updatedConsequence,
  ) => {
    const newConsequences = [...(options[optionIndex].consequences || [])];
    newConsequences[consequenceIndex] = updatedConsequence;

    onUpdate(optionIndex, {
      consequences: newConsequences,
    });
  };

  // Handler for deleting a consequence
  const deleteConsequence = (optionIndex, consequenceIndex) => {
    const newConsequences = [...(options[optionIndex].consequences || [])];
    newConsequences.splice(consequenceIndex, 1);

    onUpdate(optionIndex, {
      consequences: newConsequences.length > 0 ? newConsequences : null,
    });
  };

  // Helper to get all quest stages for a specific quest
  const getQuestStages = (questId) => {
    if (!questId || !quests || !quests[questId] || !quests[questId].stages) {
      return [];
    }

    return quests[questId].stages.map((stage) => ({
      id: stage.id,
      description: stage.description,
    }));
  };

  // Helper to get all quest objectives for a specific quest stage
  const getQuestObjectives = (questId, stageId) => {
    if (!questId || !quests || !quests[questId] || !quests[questId].stages) {
      return [];
    }

    const stage = quests[questId].stages.find((s) => s.id === stageId);
    if (!stage || !stage.objectives) {
      return [];
    }

    return stage.objectives.map((obj) => ({
      id: obj.id,
      description: obj.description,
    }));
  };

  // Check if a consequence is quest-related
  const isQuestConsequence = (consequence) => {
    if (!consequence || !consequence.event_type) return false;

    const questEventTypes = [
      "StartQuest",
      "AdvanceQuest",
      "CompleteQuestObjective",
      "FailQuest",
      "AddQuestItem",
      "UnlockQuestBranch",
    ];

    return questEventTypes.includes(consequence.event_type);
  };

  if (options.length === 0) {
    return (
      <div className="text-light italic text-sm p-3 border rounded">
        No dialogue options. Add some to give the player choices.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {options.map((option, idx) => (
        <div
          key={idx}
          className={`option-item ${isQuestRelatedOption(idx) ? "quest-related" : ""}`}
          title={
            isQuestRelatedOption(idx)
              ? `Related quests: ${getQuestTitles(idx)}`
              : ""
          }
        >
          <div className="option-header">
            <h4 className="font-medium">Option #{idx + 1}</h4>
            <button
              onClick={() => onDelete(idx)}
              className="button button-sm button-danger"
            >
              Remove
            </button>
          </div>

          <div className="input-group">
            <label className="input-label">Option Text</label>
            <textarea
              className="input-field textarea-field"
              value={option.text}
              onChange={(e) => onUpdate(idx, { text: e.target.value })}
              placeholder="What the player can say"
            />
          </div>

          <div className="option-grid">
            <div className="input-group">
              <label className="input-label">Option ID</label>
              <input
                type="text"
                className="input-field"
                value={option.id}
                onChange={(e) => onUpdate(idx, { id: e.target.value })}
                placeholder="unique_option_id"
              />
            </div>

            {/* Only show next_node if there's no skill check */}
            {!option.skill_check && (
              <div className="input-group">
                <label className="input-label">Next Node</label>
                <select
                  className="select-field"
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
            )}
          </div>

          {/* Skill Check */}
          <div className="mb-2">
            {option.skill_check ? (
              <div>
                <SkillCheckEditor
                  skillCheck={option.skill_check}
                  availableSkills={availableSkills}
                  emotionalStates={emotionalStates}
                  onUpdate={(updates) => updateSkillCheck(idx, updates)}
                  onRemove={() => removeSkillCheck(idx)}
                />

                {/* Success Node Selector - only visible when skill check exists */}
                <div className="input-group mt-2">
                  <label className="input-label">Success Node</label>
                  <select
                    className="select-field"
                    value={option.success_node || ""}
                    onChange={(e) =>
                      onUpdate(idx, { success_node: e.target.value })
                    }
                  >
                    <option value="">-- None --</option>
                    {Object.keys(allNodes).map((nodeId) => (
                      <option key={nodeId} value={nodeId}>
                        {nodeId}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-light mt-1">
                    Node to navigate to when skill check succeeds
                  </p>
                </div>

                {/* Failure Node Selector - only visible when skill check exists */}
                <div className="input-group mt-2">
                  <label className="input-label">Failure Node</label>
                  <select
                    className="select-field"
                    value={option.failure_node || ""}
                    onChange={(e) =>
                      onUpdate(idx, { failure_node: e.target.value })
                    }
                  >
                    <option value="">-- None --</option>
                    {Object.keys(allNodes).map((nodeId) => (
                      <option key={nodeId} value={nodeId}>
                        {nodeId}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-light mt-1">
                    Node to navigate to when skill check fails
                  </p>
                </div>
              </div>
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
              <div className="emotional-impact-card">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-sm">Emotional Impact</h5>
                  <button
                    onClick={() => removeEmotionalImpact(idx)}
                    className="button button-sm button-danger"
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
                        className="input-field text-sm p-1"
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
              <div className="conditions-card">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-sm">Conditions</h5>
                  <button
                    onClick={() => removeConditions(idx)}
                    className="button button-sm button-danger"
                  >
                    Remove
                  </button>
                </div>

                {/* Required Items */}
                <div className="mb-2">
                  <label className="input-label text-xs">Required Items</label>
                  <select
                    multiple
                    className="input-field text-sm h-20"
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
                  <label className="input-label text-xs">Required Skills</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSkills.map((skill) => (
                      <div key={skill} className="flex items-center">
                        <label className="text-xs w-1/2">{skill}:</label>
                        <input
                          type="number"
                          className="input-field text-sm p-1"
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

          {/* Consequences/Dialogue Effects */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium text-sm">
                Dialogue Effects
                {option.consequences && option.consequences.length > 0
                  ? ` (${option.consequences.length})`
                  : ""}
              </h5>

              <div className="dropdown" ref={dropdownRef}>
                <button
                  className="button button-sm button-primary dropdown-toggle"
                  onClick={() => toggleDropdown(idx)}
                >
                  + Add Effect
                </button>
                {activeDropdown === idx && (
                  <div className="dropdown-menu dropdown-menu-wider show">
                    {/* Standard effects */}
                    <div className="dropdown-menu-section">
                      <div className="dropdown-menu-title">
                        Standard Effects
                      </div>
                      <button
                        onClick={() =>
                          addConsequence(idx, "ModifyRelationship")
                        }
                        className="dropdown-item"
                      >
                        Modify Relationship
                      </button>
                      <button
                        onClick={() =>
                          addConsequence(idx, "ChangeEmotionalState")
                        }
                        className="dropdown-item"
                      >
                        Change Emotional State
                      </button>
                      <button
                        onClick={() => addConsequence(idx, "RevealClue")}
                        className="dropdown-item"
                      >
                        Reveal Clue
                      </button>
                      <button
                        onClick={() => addConsequence(idx, "UnlockThought")}
                        className="dropdown-item"
                      >
                        Unlock Thought
                      </button>
                      <button
                        onClick={() => addConsequence(idx, "ModifySkill")}
                        className="dropdown-item"
                      >
                        Modify Skill
                      </button>
                      <button
                        onClick={() => addConsequence(idx, "TriggerEvent")}
                        className="dropdown-item"
                      >
                        Trigger Event
                      </button>
                    </div>

                    {/* Dialogue effects */}
                    <div className="dropdown-menu-section">
                      <div className="dropdown-menu-title">
                        Dialogue Effects
                      </div>
                      <button
                        onClick={() =>
                          addConsequence(idx, "UnlockDialogueNode")
                        }
                        className="dropdown-item"
                      >
                        Unlock Dialogue Node
                      </button>
                      <button
                        onClick={() => addConsequence(idx, "LockDialogueNode")}
                        className="dropdown-item"
                      >
                        Lock Dialogue Node
                      </button>
                    </div>

                    {/* Quest effects */}
                    <div className="dropdown-menu-section">
                      <div className="dropdown-menu-title">Quest Effects</div>
                      <button
                        onClick={() => addConsequence(idx, "StartQuest")}
                        className="dropdown-item"
                      >
                        Start Quest
                      </button>
                      <button
                        onClick={() => addConsequence(idx, "AdvanceQuest")}
                        className="dropdown-item"
                      >
                        Advance Quest
                      </button>
                      <button
                        onClick={() =>
                          addConsequence(idx, "CompleteQuestObjective")
                        }
                        className="dropdown-item"
                      >
                        Complete Quest Objective
                      </button>
                      <button
                        onClick={() => addConsequence(idx, "FailQuest")}
                        className="dropdown-item"
                      >
                        Fail Quest
                      </button>
                      <button
                        onClick={() => addConsequence(idx, "AddQuestItem")}
                        className="dropdown-item"
                      >
                        Add Quest Item
                      </button>
                      <button
                        onClick={() => addConsequence(idx, "UnlockQuestBranch")}
                        className="dropdown-item"
                      >
                        Unlock Quest Branch
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Display consequences */}
            {option.consequences && option.consequences.length > 0 && (
              <div className="consequences-list">
                {option.consequences.map((consequence, consequenceIdx) => (
                  <div
                    key={consequenceIdx}
                    className={`consequence-item ${isQuestConsequence(consequence) ? "quest-consequence" : ""}`}
                  >
                    <div className="consequence-header">
                      <span className="consequence-type">
                        {consequence.event_type}
                      </span>
                      <button
                        onClick={() => deleteConsequence(idx, consequenceIdx)}
                        className="button button-xs button-danger"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="consequence-editor">
                      <ConsequenceEditor
                        consequence={consequence}
                        onUpdate={(updatedConsequence) =>
                          updateConsequence(
                            idx,
                            consequenceIdx,
                            updatedConsequence,
                          )
                        }
                        availableItems={availableItems}
                        availableSkills={availableSkills}
                        emotionalStates={emotionalStates}
                        allNodes={allNodes}
                        quests={quests}
                        getQuestStages={getQuestStages}
                        getQuestObjectives={getQuestObjectives}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Special Flags */}
          <div>
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
