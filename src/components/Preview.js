import React from "react";

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

    // If there's a next node, add it to the conversation
    if (selectedOption.next_node && dialogueTrees[selectedOption.next_node]) {
      const nextNode = dialogueTrees[selectedOption.next_node];

      // Add a small delay to simulate conversation flow
      setTimeout(() => {
        setPreviewConversation((prev) => [
          ...prev,
          {
            nodeId: selectedOption.next_node,
            speaker: nextNode.speaker,
            text: nextNode.text,
            emotional_state: nextNode.emotional_state,
          },
        ]);
      }, 500);
    }
  };

  return (
    <div className="bg-white p-4 border rounded">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Dialogue Preview</h2>
        <button
          onClick={onRestart}
          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
        >
          Restart Preview
        </button>
      </div>

      <div className="border rounded p-4 bg-gray-100 max-h-96 overflow-y-auto mb-4">
        {previewConversation.map((entry, idx) => (
          <div key={idx} className={`mb-4 ${entry.isOption ? "pl-8" : ""}`}>
            {!entry.isOption && (
              <div className="font-medium flex items-center">
                <span
                  className="inline-block w-3 h-3 rounded-full mr-2"
                  style={{
                    backgroundColor: entry.emotional_state
                      ? colorMap[entry.emotional_state] || "#999"
                      : "#999",
                  }}
                ></span>
                {entry.speaker}
              </div>
            )}
            <div
              className={`${
                entry.isOption
                  ? "text-blue-600 italic"
                  : "bg-white p-3 rounded shadow-sm"
              }`}
            >
              {entry.text}
            </div>
          </div>
        ))}
      </div>

      {previewConversation.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Options:</h3>
          <div className="space-y-2">
            {dialogueTrees[
              previewConversation[previewConversation.length - 1].nodeId
            ]?.options?.map((option, idx) => (
              <button
                key={idx}
                className="block w-full text-left p-2 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200"
                onClick={() => selectPreviewOption(idx)}
              >
                {option.text}
              </button>
            )) || (
              <div className="text-gray-500 italic">
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
