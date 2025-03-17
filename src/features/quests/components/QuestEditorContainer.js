import React from "react";
import { QuestProvider } from "../context/QuestContext";
import QuestEditorLayout from "./QuestEditorLayout";

/**
 * Main container component for the Quest Editor
 * Wraps everything in the QuestProvider context
 */
const QuestEditorContainer = ({
  quests = {},
  dialogueTrees = {},
  updateQuests,
  availableSkills = [],
  availableItems = [],
  availableLocations = [],
  onExportQuests,
}) => {
  return (
    <QuestProvider
      initialQuests={quests}
      dialogueTrees={dialogueTrees}
      availableSkills={availableSkills}
      availableItems={availableItems}
      availableLocations={availableLocations}
      onUpdateQuests={updateQuests}
      onExportQuests={onExportQuests}
    >
      <div className="quest-editor-container">
        <QuestEditorLayout />
      </div>
    </QuestProvider>
  );
};

export default QuestEditorContainer;
