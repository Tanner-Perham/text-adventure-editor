import React from "react";
import NextStageConditionEditor from "./NextStageConditionEditor";

/**
 * Component for editing next stages of a quest stage
 */
const QuestNextStagesEditor = ({
  nextStages,
  allStages,
  currentStageId,
  onUpdate,
}) => {
  // Add a new next stage
  const handleAddNextStage = () => {
    // Find a stage that's not already in the next_stages list and is not the current stage
    const availableStages = allStages.filter(
      (s) =>
        s.id !== currentStageId &&
        !nextStages.some((nextStage) => nextStage.stage_id === s.id),
    );

    if (availableStages.length === 0) {
      alert(
        "All available stages are already added to next stages or there are no other stages",
      );
      return;
    }

    const newNextStage = {
      stage_id: availableStages[0].id,
      condition: null,
      choice_description: null,
    };

    onUpdate([...nextStages, newNextStage]);
  };

  // Update a next stage
  const handleUpdateNextStage = (index, updatedNextStage) => {
    const newNextStages = [...nextStages];
    newNextStages[index] = {
      ...newNextStages[index],
      ...updatedNextStage,
    };
    onUpdate(newNextStages);
  };

  // Delete a next stage
  const handleDeleteNextStage = (index) => {
    const newNextStages = [...nextStages];
    newNextStages.splice(index, 1);
    onUpdate(newNextStages);
  };

  // Add a condition to a next stage
  const handleAddConditionToNextStage = (index, conditionType) => {
    const newNextStages = [...nextStages];

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

    onUpdate(newNextStages);
  };

  return (
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
        {nextStages.length > 0 ? (
          nextStages.map((nextStage, index) => (
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
                    .filter((s) => s.id !== currentStageId)
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
                  />
                </div>
              ) : (
                <div className="add-condition">
                  <div className="dropdown">
                    <button className="button button-sm button-outline dropdown-toggle">
                      + Add Condition
                    </button>
                    <div className="dropdown-menu">
                      <button
                        onClick={() =>
                          handleAddConditionToNextStage(index, "HasItem")
                        }
                        className="dropdown-item"
                      >
                        Has Item
                      </button>
                      <button
                        onClick={() =>
                          handleAddConditionToNextStage(index, "HasClue")
                        }
                        className="dropdown-item"
                      >
                        Has Clue
                      </button>
                      <button
                        onClick={() =>
                          handleAddConditionToNextStage(
                            index,
                            "LocationVisited",
                          )
                        }
                        className="dropdown-item"
                      >
                        Location Visited
                      </button>
                      <button
                        onClick={() =>
                          handleAddConditionToNextStage(
                            index,
                            "NPCRelationship",
                          )
                        }
                        className="dropdown-item"
                      >
                        NPC Relationship
                      </button>
                      <button
                        onClick={() =>
                          handleAddConditionToNextStage(index, "SkillValue")
                        }
                        className="dropdown-item"
                      >
                        Skill Value
                      </button>
                      <button
                        onClick={() =>
                          handleAddConditionToNextStage(index, "DialogueChoice")
                        }
                        className="dropdown-item"
                      >
                        Dialogue Choice
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-message">
            No next stages defined. Add connections to other stages to create
            quest progression paths.
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestNextStagesEditor;
