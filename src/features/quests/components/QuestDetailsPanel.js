import React from "react";
import { useQuest } from "../context/QuestContext";
import QuestDetailsEditor from "./QuestDetailsEditor";
import QuestRewardsEditor from "./QuestRewardsEditor";

/**
 * Panel component for editing quest details and basic properties
 */
const QuestDetailsPanel = () => {
  const { currentQuestId, currentQuest, updateQuestDetails } = useQuest();

  // Handler for updating quest details
  const handleUpdateQuest = (updatedData) => {
    updateQuestDetails(currentQuestId, updatedData);
  };

  if (!currentQuest) return null;

  return (
    <div className="quest-details-panel">
      <QuestDetailsEditor quest={currentQuest} onUpdate={handleUpdateQuest} />

      {/* Rewards Section */}
      <div className="card mt-6">
        <div className="card-header">
          <h3 className="card-title">Quest Rewards</h3>
        </div>
        <div className="card-body">
          <QuestRewardsEditor
            rewards={currentQuest.rewards || {}}
            onUpdate={(updatedRewards) =>
              handleUpdateQuest({ rewards: updatedRewards })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default QuestDetailsPanel;
