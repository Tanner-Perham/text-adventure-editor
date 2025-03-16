import React from "react";
import { useQuest } from "../context/QuestContext";
import QuestStageTabs from "./QuestStageTabs";
import QuestStageEditor from "./QuestStageEditor";

/**
 * Panel component for editing quest stages
 */
const QuestStagesPanel = () => {
  const {
    currentQuestId,
    currentQuest,
    currentStageIndex,
    currentStage,
    addStage,
    updateStage,
    deleteStage,
    setCurrentStageIndex,
  } = useQuest();

  if (!currentQuest) return null;

  // Handler for updating the current stage
  const handleStageUpdate = (updatedStage) => {
    updateStage(currentQuestId, currentStageIndex, updatedStage);
  };

  // Handler for deleting the current stage
  const handleDeleteStage = () => {
    deleteStage(currentQuestId, currentStageIndex);
  };

  return (
    <div className="stage-editor-container">
      {/* Stage tabs for navigation */}
      <QuestStageTabs
        stages={currentQuest.stages || []}
        currentStageIndex={currentStageIndex}
        onSelectStage={setCurrentStageIndex}
        onAddStage={() => addStage(currentQuestId)}
      />

      {/* Stage editor */}
      {currentStage ? (
        <QuestStageEditor
          stage={currentStage}
          allStages={currentQuest.stages || []}
          onUpdate={handleStageUpdate}
          onDelete={handleDeleteStage}
        />
      ) : (
        <div className="empty-message">
          No stages found. Add your first stage to get started.
        </div>
      )}
    </div>
  );
};

export default QuestStagesPanel;
