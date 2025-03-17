import React from "react";
import { useQuest } from "../context/QuestContext";

/**
 * Panel component for showing dialogue nodes related to the current quest
 */
const QuestRelatedDialoguePanel = () => {
  const { currentQuestId, findRelatedDialogue } = useQuest();

  // Find dialogue nodes related to this quest
  const relatedDialogue = findRelatedDialogue(currentQuestId);

  return (
    <div className="related-dialogue-container">
      <h3 className="section-title">Dialogue Nodes Related to this Quest</h3>
      <div className="related-nodes-list">
        {relatedDialogue.length > 0 ? (
          relatedDialogue.map((node, index) => (
            <div key={index} className="related-node-card">
              <div className="related-node-header">
                <div className="related-node-id">{node.nodeId}</div>
                <div className="related-node-speaker">{node.speaker}</div>
              </div>
              <div className="related-node-text">{node.nodeText}</div>
              <div className="related-node-option">
                <span className="related-node-option-label">Via option:</span>{" "}
                {node.optionText}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-message">
            No dialogue nodes are directly related to this quest.
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestRelatedDialoguePanel;
