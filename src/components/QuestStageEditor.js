import React, { useState } from "react";
import QuestObjectiveEditor from "./QuestObjectiveEditor";

const QuestStageEditor = ({
  stage,
  allStages,
  onUpdate,
  onDelete,
  availableItems,
  availableSkills,
  availableLocations,
  dialogueTrees,
}) => {
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [newStageId, setNewStageId] = useState(stage.id);
  const [idError, setIdError] = useState("");
  const [activeTab, setActiveTab] = useState("details"); // details, objectives, completion, next

  // Handle basic property changes
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

  // Handle adding an objective
  const handleAddObjective = () => {
    const newObjectiveId = `objective_${Date.now()}`;

    const newObjective = {
      id: newObjectiveId,
      description: "New objective",
      required_clues: [],
      required_items: [],
      required_location: null,
      required_npc_interaction: null,
      is_completed: false,
      is_optional: false,
      completion_events: [],
    };

    onUpdate({
      objectives: [...(stage.objectives || []), newObjective],
    });
  };

  // Handle updating an objective
  const handleUpdateObjective = (index, updatedObjective) => {
    const newObjectives = [...(stage.objectives || [])];
    newObjectives[index] = {
      ...newObjectives[index],
      ...updatedObjective,
    };

    onUpdate({ objectives: newObjectives });
  };

  // Handle deleting an objective
  const handleDeleteObjective = (index) => {
    const newObjectives = [...(stage.objectives || [])];
    newObjectives.splice(index, 1);

    onUpdate({ objectives: newObjectives });
  };

  // Handle adding a completion event
  const handleAddCompletionEvent = (eventType) => {
    let newEvent;

    switch (eventType) {
      case "AddClue":
        newEvent = {
          event_type: "AddClue",
          data: {
            id: `clue_${Date.now()}`,
            description: "New clue",
            related_quest: "",
            discovered: false,
          },
        };
        break;
      case "AddItem":
        newEvent = {
          event_type: "AddItem",
          data: {
            id: "",
            name: "",
            description: "",
            effects: {},
          },
        };
        break;
      case "ModifySkill":
        newEvent = {
          event_type: "ModifySkill",
          data: ["", 0],
        };
        break;
      case "ModifyRelationship":
        newEvent = {
          event_type: "ModifyRelationship",
          data: ["", 0],
        };
        break;
      case "ChangeLocation":
        newEvent = {
          event_type: "ChangeLocation",
          data: "",
        };
        break;
      case "UnlockLocation":
        newEvent = {
          event_type: "UnlockLocation",
          data: "",
        };
        break;
      default:
        newEvent = {
          event_type: eventType,
          data: "",
        };
    }

    onUpdate({
      completion_events: [...(stage.completion_events || []), newEvent],
    });
  };

  // Handle updating a completion event
  const handleUpdateCompletionEvent = (index, updatedEvent) => {
    const newEvents = [...(stage.completion_events || [])];
    newEvents[index] = updatedEvent;

    onUpdate({ completion_events: newEvents });
  };

  // Handle deleting a completion event
  const handleDeleteCompletionEvent = (index) => {
    const newEvents = [...(stage.completion_events || [])];
    newEvents.splice(index, 1);

    onUpdate({ completion_events: newEvents });
  };

  // Handle adding a next stage
  const handleAddNextStage = () => {
    // Find a stage that's not already in the next_stages list
    const availableStages = allStages.filter(
      (s) =>
        s.id !== stage.id &&
        !stage.next_stages?.some((nextStage) => nextStage.stage_id === s.id),
    );

    if (availableStages.length === 0) {
      alert("All available stages are already added to next stages");
      return;
    }

    const newNextStage = {
      stage_id: availableStages[0].id,
      condition: null,
      choice_description: null,
    };

    onUpdate({
      next_stages: [...(stage.next_stages || []), newNextStage],
    });
  };

  // Handle updating a next stage
  const handleUpdateNextStage = (index, updatedNextStage) => {
    const newNextStages = [...(stage.next_stages || [])];
    newNextStages[index] = {
      ...newNextStages[index],
      ...updatedNextStage,
    };

    onUpdate({ next_stages: newNextStages });
  };

  // Handle deleting a next stage
  const handleDeleteNextStage = (index) => {
    const newNextStages = [...(stage.next_stages || [])];
    newNextStages.splice(index, 1);

    onUpdate({ next_stages: newNextStages });
  };

  // Handle adding a condition to a next stage
  const handleAddConditionToNextStage = (index, conditionType) => {
    const newNextStages = [...(stage.next_stages || [])];

    let condition = {
      condition_type: conditionType,
      target_id: "",
      value: null,
    };

    // For certain condition types, set default values
    if (conditionType === "NPCRelationship" || conditionType === "SkillValue") {
      condition.value = 0;
    }

    newNextStages[index] = {
      ...newNextStages[index],
      condition,
    };

    onUpdate({ next_stages: newNextStages });
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
    <div className="quest-stage-editor">
      <div className="stage-editor-header">
        <div className="stage-editor-tabs">
          <button
            className={`tab-button ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
          <button
            className={`tab-button ${activeTab === "objectives" ? "active" : ""}`}
            onClick={() => setActiveTab("objectives")}
          >
            Objectives ({(stage.objectives || []).length})
          </button>
          <button
            className={`tab-button ${activeTab === "completion" ? "active" : ""}`}
            onClick={() => setActiveTab("completion")}
          >
            Completion Events ({(stage.completion_events || []).length})
          </button>
          <button
            className={`tab-button ${activeTab === "next" ? "active" : ""}`}
            onClick={() => setActiveTab("next")}
          >
            Next Stages ({(stage.next_stages || []).length})
          </button>
        </div>
        <button
          onClick={onDelete}
          className="button button-sm button-danger"
          title="Delete this stage"
        >
          Delete Stage
        </button>
      </div>

      {/* Stage Details */}
      {activeTab === "details" && (
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
                {idError && (
                  <div className="text-danger text-sm">{idError}</div>
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
              <div className="p-2 bg-light rounded border">{stage.id}</div>
            )}
          </div>

          {/* Description */}
          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea
              className="input-field textarea-field"
              value={stage.description || ""}
              onChange={(e) =>
                handlePropertyChange("description", e.target.value)
              }
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
      )}

      {/* Objectives */}
      {activeTab === "objectives" && (
        <div className="stage-objectives">
          <div className="section-header">
            <h3 className="section-title">Objectives</h3>
            <button
              onClick={handleAddObjective}
              className="button button-sm button-primary"
            >
              + Add Objective
            </button>
          </div>

          <div className="objectives-list">
            {stage.objectives && stage.objectives.length > 0 ? (
              stage.objectives.map((objective, index) => (
                <QuestObjectiveEditor
                  key={index}
                  objective={objective}
                  index={index}
                  onUpdate={(updatedObjective) =>
                    handleUpdateObjective(index, updatedObjective)
                  }
                  onDelete={() => handleDeleteObjective(index)}
                  availableItems={availableItems}
                  availableLocations={availableLocations}
                  npcs={getAllNPCs()}
                />
              ))
            ) : (
              <div className="empty-message">
                No objectives added to this stage. Add objectives to give
                players tasks to complete.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion Events */}
      {activeTab === "completion" && (
        <div className="stage-completion-events">
          <div className="section-header">
            <h3 className="section-title">Completion Events</h3>
            <div className="dropdown">
              <button className="button button-sm button-primary dropdown-toggle">
                + Add Event
              </button>
              <div className="dropdown-menu">
                <button
                  onClick={() => handleAddCompletionEvent("AddClue")}
                  className="dropdown-item"
                >
                  Add Clue
                </button>
                <button
                  onClick={() => handleAddCompletionEvent("AddItem")}
                  className="dropdown-item"
                >
                  Add Item
                </button>
                <button
                  onClick={() => handleAddCompletionEvent("ModifySkill")}
                  className="dropdown-item"
                >
                  Modify Skill
                </button>
                <button
                  onClick={() => handleAddCompletionEvent("ModifyRelationship")}
                  className="dropdown-item"
                >
                  Modify Relationship
                </button>
                <button
                  onClick={() => handleAddCompletionEvent("ChangeLocation")}
                  className="dropdown-item"
                >
                  Change Location
                </button>
                <button
                  onClick={() => handleAddCompletionEvent("UnlockLocation")}
                  className="dropdown-item"
                >
                  Unlock Location
                </button>
              </div>
            </div>
          </div>

          <div className="completion-events-list">
            {stage.completion_events && stage.completion_events.length > 0 ? (
              stage.completion_events.map((event, index) => (
                <div key={index} className="completion-event-card">
                  <div className="completion-event-header">
                    <h4>Event: {event.event_type}</h4>
                    <button
                      onClick={() => handleDeleteCompletionEvent(index)}
                      className="button button-sm button-danger"
                    >
                      Delete
                    </button>
                  </div>
                  <CompletionEventEditor
                    event={event}
                    onUpdate={(updatedEvent) =>
                      handleUpdateCompletionEvent(index, updatedEvent)
                    }
                    availableItems={availableItems}
                    availableSkills={availableSkills}
                    availableLocations={availableLocations}
                    npcs={getAllNPCs()}
                  />
                </div>
              ))
            ) : (
              <div className="empty-message">
                No completion events added. These events trigger when all
                required objectives are completed.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Stages */}
      {activeTab === "next" && (
        <div className="stage-next-stages">
          <div className="section-header">
            <h3 className="section-title">Next Stages</h3>
            <button
              onClick={handleAddNextStage}
              className="button button-sm button-primary"
              disabled={allStages.length <= 1}
            >
              + Add Next Stage
            </button>
          </div>

          <div className="next-stages-list">
            {stage.next_stages && stage.next_stages.length > 0 ? (
              stage.next_stages.map((nextStage, index) => (
                <div key={index} className="next-stage-card">
                  <div className="next-stage-header">
                    <h4>Next Stage Connection</h4>
                    <button
                      onClick={() => handleDeleteNextStage(index)}
                      className="button button-sm button-danger"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Target Stage</label>
                    <select
                      className="select-field"
                      value={nextStage.stage_id || ""}
                      onChange={(e) =>
                        handleUpdateNextStage(index, {
                          stage_id: e.target.value,
                        })
                      }
                    >
                      <option value="">-- Select Stage --</option>
                      {allStages
                        .filter((s) => s.id !== stage.id)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.id}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">
                      Choice Description (Optional)
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={nextStage.choice_description || ""}
                      onChange={(e) =>
                        handleUpdateNextStage(index, {
                          choice_description: e.target.value,
                        })
                      }
                      placeholder="Description shown to player for this choice"
                    />
                  </div>

                  {nextStage.condition ? (
                    <div className="next-stage-condition">
                      <div className="condition-header">
                        <h5>Condition: {nextStage.condition.condition_type}</h5>
                        <button
                          onClick={() =>
                            handleUpdateNextStage(index, { condition: null })
                          }
                          className="button button-xs button-danger"
                        >
                          Remove
                        </button>
                      </div>
                      <NextStageConditionEditor
                        condition={nextStage.condition}
                        onUpdate={(updatedCondition) =>
                          handleUpdateNextStage(index, {
                            condition: updatedCondition,
                          })
                        }
                        availableItems={availableItems}
                        availableSkills={availableSkills}
                        availableLocations={availableLocations}
                        npcs={getAllNPCs()}
                      />
                    </div>
                  ) : (
                    <div className="add-condition">
                      <button
                        onClick={() =>
                          handleAddConditionToNextStage(index, "HasItem")
                        }
                        className="button button-sm button-outline"
                      >
                        + Add Condition
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-message">
                No next stages defined. Add connections to other stages to
                create quest progression paths.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// CompletionEventEditor component
const CompletionEventEditor = ({
  event,
  onUpdate,
  availableItems,
  availableSkills,
  availableLocations,
  npcs,
}) => {
  // Handle different event types and their specific editors
  switch (event.event_type) {
    case "AddClue":
      return (
        <div className="event-editor">
          <div className="input-group">
            <label className="input-label">Clue ID</label>
            <input
              type="text"
              className="input-field"
              value={event.data.id || ""}
              onChange={(e) =>
                onUpdate({
                  ...event,
                  data: { ...event.data, id: e.target.value },
                })
              }
              placeholder="Unique clue identifier"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea
              className="input-field textarea-field"
              value={event.data.description || ""}
              onChange={(e) =>
                onUpdate({
                  ...event,
                  data: { ...event.data, description: e.target.value },
                })
              }
              placeholder="Clue description"
              rows={2}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Related Quest</label>
            <input
              type="text"
              className="input-field"
              value={event.data.related_quest || ""}
              onChange={(e) =>
                onUpdate({
                  ...event,
                  data: { ...event.data, related_quest: e.target.value },
                })
              }
              placeholder="Quest ID this clue relates to"
            />
          </div>
          <div className="checkbox-group">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={event.data.discovered || false}
                onChange={(e) =>
                  onUpdate({
                    ...event,
                    data: { ...event.data, discovered: e.target.checked },
                  })
                }
                className="mr-2"
              />
              <span>Already Discovered</span>
            </label>
          </div>
        </div>
      );

    case "AddItem":
      return (
        <div className="event-editor">
          <div className="input-group">
            <label className="input-label">Item ID</label>
            <select
              className="select-field"
              value={event.data.id || ""}
              onChange={(e) =>
                onUpdate({
                  ...event,
                  data: {
                    ...event.data,
                    id: e.target.value,
                    name: e.target.value, // For simplicity, use ID as name
                  },
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
          <div className="input-group">
            <label className="input-label">Item Name</label>
            <input
              type="text"
              className="input-field"
              value={event.data.name || ""}
              onChange={(e) =>
                onUpdate({
                  ...event,
                  data: { ...event.data, name: e.target.value },
                })
              }
              placeholder="Display name for the item"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea
              className="input-field textarea-field"
              value={event.data.description || ""}
              onChange={(e) =>
                onUpdate({
                  ...event,
                  data: { ...event.data, description: e.target.value },
                })
              }
              placeholder="Item description"
              rows={2}
            />
          </div>
        </div>
      );

    case "ModifySkill":
      return (
        <div className="event-editor">
          <div className="input-group">
            <label className="input-label">Skill</label>
            <select
              className="select-field"
              value={event.data[0] || ""}
              onChange={(e) =>
                onUpdate({
                  ...event,
                  data: [e.target.value, event.data[1] || 0],
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
            <label className="input-label">Value Change</label>
            <input
              type="number"
              className="input-field"
              value={event.data[1] || 0}
              onChange={(e) =>
                onUpdate({
                  ...event,
                  data: [event.data[0] || "", parseInt(e.target.value) || 0],
                })
              }
              placeholder="Amount to change skill by"
            />
          </div>
        </div>
      );

    case "ModifyRelationship":
      return (
        <div className="event-editor">
          <div className="input-group">
            <label className="input-label">NPC</label>
            <select
              className="select-field"
              value={event.data[0] || ""}
              onChange={(e) =>
                onUpdate({
                  ...event,
                  data: [e.target.value, event.data[1] || 0],
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
            <label className="input-label">Relationship Change</label>
            <input
              type="number"
              className="input-field"
              value={event.data[1] || 0}
              onChange={(e) =>
                onUpdate({
                  ...event,
                  data: [event.data[0] || "", parseInt(e.target.value) || 0],
                })
              }
              placeholder="Amount to change relationship by"
            />
          </div>
        </div>
      );

    case "ChangeLocation":
    case "UnlockLocation":
      return (
        <div className="event-editor">
          <div className="input-group">
            <label className="input-label">Location</label>
            <select
              className="select-field"
              value={event.data || ""}
              onChange={(e) =>
                onUpdate({
                  ...event,
                  data: e.target.value,
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
        </div>
      );

    default:
      return (
        <div className="event-editor">
          <div className="input-group">
            <label className="input-label">Event Data</label>
            <input
              type="text"
              className="input-field"
              value={
                typeof event.data === "string"
                  ? event.data
                  : JSON.stringify(event.data)
              }
              onChange={(e) =>
                onUpdate({
                  ...event,
                  data: e.target.value,
                })
              }
              placeholder="Event data"
            />
            <p className="text-xs text-light mt-1">
              Enter data appropriate for this event type
            </p>
          </div>
        </div>
      );
  }
};

// NextStageConditionEditor component
const NextStageConditionEditor = ({
  condition,
  onUpdate,
  availableItems,
  availableSkills,
  availableLocations,
  npcs,
}) => {
  const handleTypeChange = (newType) => {
    onUpdate({
      condition_type: newType,
      target_id: "",
      value: null,
    });
  };

  if (!condition) return null;

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

export default QuestStageEditor;
