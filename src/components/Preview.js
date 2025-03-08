import React, { useState } from "react";

// Color mapping for emotional states
const colorMap = {
  Neutral: "#A9A9A9",
  Friendly: "#4CAF50",
  Suspicious: "#FFC107",
  Angry: "#F44336",
  Scared: "#9C27B0",
  Nervous: "#FF9800",
  Sad: "#2196F3",
  Happy: "#8BC34A",
  Confused: "#E91E63",
};

const Preview = ({
  dialogueTrees,
  previewConversation,
  setPreviewConversation,
  onRestart,
}) => {
  // State to control the skill check simulation dialog
  const [skillCheckOption, setSkillCheckOption] = useState(null);

  // Select an option from the conversation
  const selectPreviewOption = (optionIndex) => {
    const currentPreviewNode =
      previewConversation[previewConversation.length - 1].nodeId;
    const selectedOption =
      dialogueTrees[currentPreviewNode].options[optionIndex];

    // Add the player's choice to the conversation
    setPreviewConversation((prev) => [
      ...prev,
      {
        nodeId: null,
        speaker: "Player",
        text: selectedOption.text,
        isOption: true,
      },
    ]);

    // If this option has a skill check, show the skill check simulation dialog
    if (selectedOption.skill_check) {
      // Show skill check dialog
      setSkillCheckOption(selectedOption);
      return;
    }

    // If there's a next node and no skill check, add it to the conversation
    if (selectedOption.next_node && dialogueTrees[selectedOption.next_node]) {
      continueToNextNode(selectedOption.next_node);
    }
  };

  // Handle skill check success
  const handleSkillCheckSuccess = () => {
    if (
      skillCheckOption.success_node &&
      dialogueTrees[skillCheckOption.success_node]
    ) {
      // Add a note about passing the skill check
      addSkillCheckNote(true);

      // Continue to the success node
      continueToNextNode(skillCheckOption.success_node);

      // Reset skill check dialog
      setSkillCheckOption(null);
    } else {
      // Handle missing success node
      addSkillCheckNote(true);
      addSystemNote("No success node defined for this skill check.");
      setSkillCheckOption(null);
    }
  };

  // Handle skill check failure
  const handleSkillCheckFailure = () => {
    if (
      skillCheckOption.failure_node &&
      dialogueTrees[skillCheckOption.failure_node]
    ) {
      // Add a note about failing the skill check
      addSkillCheckNote(false);

      // Continue to the failure node
      continueToNextNode(skillCheckOption.failure_node);

      // Reset skill check dialog
      setSkillCheckOption(null);
    } else {
      // Handle missing failure node
      addSkillCheckNote(false);
      addSystemNote("No failure node defined for this skill check.");
      setSkillCheckOption(null);
    }
  };

  // Add a skill check note to the conversation
  const addSkillCheckNote = (success) => {
    const skillCheck = skillCheckOption.skill_check;
    const difficulty = skillCheck.base_difficulty;
    const primarySkill = skillCheck.primary_skill;

    setPreviewConversation((prev) => [
      ...prev,
      {
        nodeId: null,
        speaker: "System",
        text: `${success ? "SUCCESS" : "FAILURE"}: ${primarySkill.charAt(0).toUpperCase() + primarySkill.slice(1)} check (Difficulty ${difficulty})`,
        isSystem: true,
        isSkillCheck: true,
        success,
      },
    ]);
  };

  // Add a system note to the conversation
  const addSystemNote = (text) => {
    setPreviewConversation((prev) => [
      ...prev,
      {
        nodeId: null,
        speaker: "System",
        text,
        isSystem: true,
      },
    ]);
  };

  // Continue to the next node
  const continueToNextNode = (nextNodeId) => {
    const nextNode = dialogueTrees[nextNodeId];

    // Add a small delay to simulate conversation flow
    setTimeout(() => {
      setPreviewConversation((prev) => [
        ...prev,
        {
          nodeId: nextNodeId,
          speaker: nextNode.speaker,
          text: nextNode.text,
          emotional_state: nextNode.emotional_state,
        },
      ]);
    }, 500);
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Dialogue Preview</h2>
        <button onClick={onRestart} className="button button-outline">
          Restart Preview
        </button>
      </div>

      <div className="preview-conversation mb-4">
        {previewConversation.map((entry, idx) => (
          <div
            key={idx}
            className={`message ${entry.isOption ? "message-player" : ""}`}
          >
            {!entry.isOption && !entry.isSystem && (
              <div className="message-speaker">
                <span
                  className="emotion-indicator"
                  style={{
                    backgroundColor: entry.emotional_state
                      ? colorMap[entry.emotional_state] || "#999"
                      : "#999",
                  }}
                ></span>
                {entry.speaker}
              </div>
            )}

            {entry.isSystem && (
              <div
                className={`p-2 rounded mb-2 ${
                  entry.isSkillCheck
                    ? entry.success
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <strong>{entry.speaker}: </strong>
                {entry.text}
              </div>
            )}

            {!entry.isSystem && (
              <div
                className={`${
                  entry.isOption ? "message-player" : "message-bubble"
                }`}
              >
                {entry.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Skill Check Dialog */}
      {skillCheckOption && (
        <div className="skill-check-card mb-4">
          <h3 className="font-medium mb-2">
            Skill Check: {skillCheckOption.skill_check.primary_skill}
          </h3>
          <p className="mb-2">
            Difficulty: {skillCheckOption.skill_check.base_difficulty}
          </p>
          <p className="mb-4 text-sm text-gray-600">
            In the actual game, this would use the player's stats to determine
            the outcome. For this preview, choose the result:
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleSkillCheckSuccess}
              className="button button-success flex-1"
            >
              Pass Check
            </button>
            <button
              onClick={handleSkillCheckFailure}
              className="button button-danger flex-1"
            >
              Fail Check
            </button>
          </div>
        </div>
      )}

      {/* Options Section */}
      {previewConversation.length > 0 && !skillCheckOption && (
        <div>
          <h3 className="font-medium mb-2">Options:</h3>
          <div className="preview-options">
            {dialogueTrees[
              previewConversation[previewConversation.length - 1].nodeId
            ]?.options?.map((option, idx) => (
              <button
                key={idx}
                className="preview-option-button"
                onClick={() => selectPreviewOption(idx)}
              >
                {option.text}
                {option.skill_check && (
                  <span className="ml-2 text-xs text-blue-600">
                    (Skill: {option.skill_check.primary_skill}, Difficulty:{" "}
                    {option.skill_check.base_difficulty})
                  </span>
                )}
              </button>
            )) || (
              <div className="text-light italic">
                No options available. End of dialogue branch.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Preview;
