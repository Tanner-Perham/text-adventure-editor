import React from "react";
import QuestObjectiveItem from "./QuestObjectiveItem";

/**
 * Component for managing the list of objectives in a quest stage
 */
const QuestObjectivesEditor = ({
  objectives,
  stageIndex,
  onUpdateObjective,
  onDeleteObjective,
}) => {
  return (
    <div className="objectives-list">
      {objectives && objectives.length > 0 ? (
        objectives.map((objective, index) => (
          <QuestObjectiveItem
            key={objective.id || index}
            objective={objective}
            index={index}
            onUpdate={(updatedObjective) =>
              onUpdateObjective(index, updatedObjective)
            }
            onDelete={() => onDeleteObjective(index)}
          />
        ))
      ) : (
        <div className="empty-message">
          No objectives added to this stage. Add objectives to give players
          tasks to complete.
        </div>
      )}
    </div>
  );
};

export default QuestObjectivesEditor;
