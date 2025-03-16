import React from "react";
import { useDialogue } from "../context/DialogueContext";
import TabNavigation from "./common/TabNavigation";
import { exportToYAML, exportToJSON } from "../../../utils/exporters";
import {
  exportQuestsToYAML,
  exportQuestsToJSON,
} from "../../../utils/questExporters";

/**
 * Header component for the dialogue editor with title, undo/redo controls, and tab navigation
 */
const DialogueHeader = () => {
  const {
    tabView,
    setTabView,
    dialogueTrees,
    quests,
    historyStatus,
    handleUndo,
    handleRedo,
    startPreview,
    setYamlOutput,
    setJsonOutput,
    setQuestsYamlOutput,
    setQuestsJsonOutput,
  } = useDialogue();

  // Tab definitions
  const tabs = [
    { id: "editor", label: "Dialogue Editor" },
    { id: "quests", label: "Quest Editor" },
    { id: "visualization", label: "Visualization" },
    { id: "preview", label: "Preview" },
    { id: "yaml", label: "YAML" },
    { id: "json", label: "JSON" },
    { id: "settings", label: "Settings" },
  ];

  // Tab-specific actions
  const tabCallbacks = {
    preview: startPreview,
    yaml: () => {
      if (tabView === "quests") {
        const yaml = exportQuestsToYAML(quests);
        setQuestsYamlOutput(yaml);
      } else {
        const yaml = exportToYAML(dialogueTrees);
        setYamlOutput(yaml);
      }
    },
    json: () => {
      if (tabView === "quests") {
        const json = exportQuestsToJSON(quests);
        setQuestsJsonOutput(json);
      } else {
        const json = exportToJSON(dialogueTrees);
        setJsonOutput(json);
      }
    },
  };

  return (
    <div className="dialogue-editor-header">
      <h1 className="dialogue-editor-title">Dialogue & Quest Editor</h1>
      <div className="editor-controls">
        <div className="history-controls">
          <button
            className={`history-button ${!historyStatus.canUndo ? "disabled" : ""}`}
            onClick={handleUndo}
            disabled={!historyStatus.canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6M3 10l6-6" />
            </svg>
          </button>
          <button
            className={`history-button ${!historyStatus.canRedo ? "disabled" : ""}`}
            onClick={handleRedo}
            disabled={!historyStatus.canRedo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10H11a8 8 0 0 0-8 8v2M21 10l-6 6M21 10l-6-6" />
            </svg>
          </button>
          <div className="history-status">
            <div
              className={`history-status-dot ${
                historyStatus.undoCount > 0 ? "has-history" : "no-history"
              }`}
            ></div>
            <span>
              {historyStatus.undoCount > 0
                ? `${historyStatus.undoCount} change${
                    historyStatus.undoCount !== 1 ? "s" : ""
                  }`
                : "No changes"}
            </span>
          </div>
        </div>

        <TabNavigation
          activeTab={tabView}
          tabs={tabs}
          onTabChange={setTabView}
          tabCallbacks={tabCallbacks}
        />
      </div>
    </div>
  );
};

export default DialogueHeader;
