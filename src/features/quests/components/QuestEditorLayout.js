import React from "react";
import { useQuest } from "../context/QuestContext";
import QuestListPanel from "./QuestListPanel";
import QuestDetailsPanel from "./QuestDetailsPanel";
import QuestStagesPanel from "./QuestStagesPanel";
import QuestRelatedDialoguePanel from "./QuestRelatedDialoguePanel";
import QuestExportPanel from "./QuestExportPanel";

/**
 * Main layout component for the quest editor
 * Handles tab switching and renders appropriate content
 */
const QuestEditorLayout = () => {
  const { viewMode, currentQuest, setViewMode } = useQuest();

  return (
    <div className="quest-editor-layout">
      {/* Left panel: Quest list */}
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Quests</h2>
        </div>
        <div className="panel-content">
          <QuestListPanel />
        </div>
      </div>

      {/* Right panel: Quest editor */}
      <div className="panel-large">
        <div className="panel-header">
          <h2 className="panel-title">
            {currentQuest
              ? `Edit Quest: ${currentQuest.title}`
              : "Quest Editor"}
          </h2>
          {currentQuest && (
            <div className="quest-view-controls">
              <button
                className={`tab-button ${viewMode === "details" ? "active" : ""}`}
                onClick={() => setViewMode("details")}
              >
                Details
              </button>
              <button
                className={`tab-button ${viewMode === "stages" ? "active" : ""}`}
                onClick={() => setViewMode("stages")}
              >
                Stages
              </button>
              <button
                className={`tab-button ${viewMode === "related-dialogue" ? "active" : ""}`}
                onClick={() => setViewMode("related-dialogue")}
              >
                Related Dialogue
              </button>
              <button
                className={`tab-button ${viewMode === "export" ? "active" : ""}`}
                onClick={() => setViewMode("export")}
              >
                Export
              </button>
            </div>
          )}
        </div>
        <div className="panel-content panel-scroll">
          {currentQuest ? (
            <>
              {viewMode === "details" && <QuestDetailsPanel />}
              {viewMode === "stages" && <QuestStagesPanel />}
              {viewMode === "related-dialogue" && <QuestRelatedDialoguePanel />}
              {viewMode === "export" && <QuestExportPanel />}
            </>
          ) : (
            <div className="empty-state">
              <p className="text-center text-light">
                No quest selected. Create a new quest or select an existing one.
              </p>
              <div className="text-center mt-4">
                <EmptyStateButton />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Button component for empty state
const EmptyStateButton = () => {
  const { handleAddQuest } = useQuest();

  return (
    <button onClick={handleAddQuest} className="button button-primary">
      Create First Quest
    </button>
  );
};

export default QuestEditorLayout;
