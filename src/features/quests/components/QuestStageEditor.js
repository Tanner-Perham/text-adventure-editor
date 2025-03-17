import React, { useState } from "react";
import { useQuest } from "../context/QuestContext";
import QuestStageDetails from "./QuestStageDetails";
import QuestObjectivesEditor from "./QuestObjectivesEditor";
import QuestCompletionEventsEditor from "./QuestCompletionEventsEditor";
import QuestNextStagesEditor from "./QuestNextStagesEditor";

/**
 * Component for editing a quest stage with multiple sections
 */
const QuestStageEditor = ({ stage, allStages, onUpdate, onDelete }) => {
  // State for active tab within the stage editor
  const [activeTab, setActiveTab] = useState("details"); // details, objectives, completion, next

  // Access shared data and functions
  const {
    availableSkills,
    availableItems,
    availableLocations,
    currentQuestId,
    currentStageIndex,
    addObjective,
    updateObjective,
    deleteObjective,
  } = useQuest();

  return (
    <div className="quest-stage-editor">
      {/* Tabs for stage sections */}
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

      {/* Content based on active tab */}
      {activeTab === "details" && (
        <QuestStageDetails stage={stage} onUpdate={onUpdate} />
      )}

      {activeTab === "objectives" && (
        <div className="stage-objectives">
          <div className="section-header">
            <h3 className="section-title">Objectives</h3>
            <button
              onClick={() => addObjective(currentQuestId, currentStageIndex)}
              className="button button-sm button-primary"
            >
              + Add Objective
            </button>
          </div>

          <QuestObjectivesEditor
            objectives={stage.objectives || []}
            stageIndex={currentStageIndex}
            onUpdateObjective={(objectiveIndex, updatedObjective) =>
              updateObjective(
                currentQuestId,
                currentStageIndex,
                objectiveIndex,
                updatedObjective,
              )
            }
            onDeleteObjective={(objectiveIndex) =>
              deleteObjective(currentQuestId, currentStageIndex, objectiveIndex)
            }
          />
        </div>
      )}

      {activeTab === "completion" && (
        <QuestCompletionEventsEditor
          completionEvents={stage.completion_events || []}
          onUpdate={(newEvents) => onUpdate({ completion_events: newEvents })}
        />
      )}

      {activeTab === "next" && (
        <QuestNextStagesEditor
          nextStages={stage.next_stages || []}
          allStages={allStages}
          currentStageId={stage.id}
          onUpdate={(newNextStages) => onUpdate({ next_stages: newNextStages })}
        />
      )}
    </div>
  );
};

export default QuestStageEditor;
