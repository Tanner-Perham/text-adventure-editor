import React from "react";

/**
 * Tabs for navigating between quest stages
 */
const QuestStageTabs = ({
  stages,
  currentStageIndex,
  onSelectStage,
  onAddStage,
}) => {
  return (
    <div className="stage-tabs">
      {/* Render a tab for each stage */}
      {stages.map((stage, index) => (
        <button
          key={stage.id}
          className={`stage-tab ${index === currentStageIndex ? "active" : ""}`}
          onClick={() => onSelectStage(index)}
        >
          {stage.id}
        </button>
      ))}

      {/* Add stage button */}
      <button
        className="stage-tab stage-tab-add"
        onClick={onAddStage}
        title="Add new stage"
      >
        +
      </button>
    </div>
  );
};

export default QuestStageTabs;
