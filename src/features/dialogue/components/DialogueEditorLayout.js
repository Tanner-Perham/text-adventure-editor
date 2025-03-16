import React from "react";
import { useDialogue } from "../context/DialogueContext";
import NodeListPanel from "./NodeListPanel";
import NodeEditorPanel from "./NodeEditorPanel";
import SaveReminder from "../../../components/SaveReminder";
import Visualisation from "../../../components/Visualisation";
import Preview from "../../../components/Preview";
import { QuestEditorContainer } from "../../quests";

/**
 * Main layout component for the dialogue editor
 * Renders different content based on the active tab
 */
const DialogueEditorLayout = () => {
  const {
    tabView,
    dialogueTrees,
    quests,
    currentNode,
    emotionalStates,
    availableSkills,
    availableItems,
    availableLocations,
    updateQuests,
    handleNodeSelect,
    viewMode,
    setViewMode,
    showNodeDetails,
    setShowNodeDetails,
    showQuestsInVisualization,
    setShowQuestsInVisualization,
    previewConversation,
    setPreviewConversation,
    startPreview,
    yamlOutput,
    jsonOutput,
    questsYamlOutput,
    questsJsonOutput,
    setJsonOutput,
    setQuestsJsonOutput,
    updateEmotionalStates,
    updateAvailableSkills,
    updateAvailableItems,
    updateAvailableLocations,
    historyStatus,
    setTabView,
    handleExportQuestsYAML,
    handleExportQuestsJSON, // Added this as well for completeness
  } = useDialogue();

  // Render different content based on the active tab
  const renderContent = () => {
    switch (tabView) {
      case "editor":
        return (
          <div className="editor-layout">
            <NodeListPanel />
            <NodeEditorPanel />
          </div>
        );

      case "quests":
        return (
          <QuestEditorContainer
            quests={quests}
            dialogueTrees={dialogueTrees}
            updateQuests={updateQuests}
            availableSkills={availableSkills}
            availableItems={availableItems}
            availableLocations={availableLocations}
            onExportQuests={handleExportQuestsYAML}
          />
        );

      case "visualization":
        return (
          <div className="visualization-container">
            <div className="visualization-toolbar">
              <h2 className="panel-title">Dialogue Visualisation</h2>
              <div className="visualization-controls">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={showQuestsInVisualization}
                    onChange={(e) =>
                      setShowQuestsInVisualization(e.target.checked)
                    }
                  />
                  Show Quest Relationships
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">View Mode:</span>
                  <select
                    className="select-field"
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                  >
                    <option value="flow">Flow Chart</option>
                    <option value="tree">Tree</option>
                    <option value="timeline">Timeline</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="visualization-content">
              <Visualisation
                dialogueTrees={dialogueTrees}
                currentNode={currentNode}
                emotionalStates={emotionalStates}
                viewMode={viewMode}
                showNodeDetails={showNodeDetails}
                showQuestsInVisualization={showQuestsInVisualization}
                quests={quests}
                onViewModeChange={setViewMode}
                onShowNodeDetailsChange={setShowNodeDetails}
                onNodeSelect={handleNodeSelect}
              />
            </div>
          </div>
        );

      case "preview":
        return (
          <div className="preview-container">
            <div className="preview-header">
              <h2 className="panel-title">Dialogue Preview</h2>
              <button onClick={startPreview} className="button button-ghost">
                Restart Preview
              </button>
            </div>

            <div className="preview-conversation">
              <Preview
                dialogueTrees={dialogueTrees}
                previewConversation={previewConversation}
                setPreviewConversation={setPreviewConversation}
                quests={quests}
                onRestart={startPreview}
              />
            </div>
          </div>
        );

      case "yaml":
        return (
          <div className="export-container">
            <div className="export-header">
              <h2 className="panel-title">Dialogue YAML Export</h2>
            </div>
            <div className="export-content">
              <div className="export-code">
                <pre className="export-pre">{yamlOutput}</pre>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(yamlOutput);
                  alert("YAML copied to clipboard!");
                }}
                className="button button-primary"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        );

      case "json":
        return (
          <div className="export-container">
            <div className="export-header">
              <h2 className="panel-title">Dialogue JSON Export</h2>
            </div>
            <div className="export-content">
              <div className="export-code">
                <pre className="export-pre">{jsonOutput}</pre>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(jsonOutput);
                  alert("JSON copied to clipboard!");
                }}
                className="button button-primary"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        );

      case "quests-yaml":
        return (
          <div className="export-container">
            <div className="export-header">
              <h2 className="panel-title">Quests YAML Export</h2>
            </div>
            <div className="export-content">
              <div className="export-code">
                <pre className="export-pre">{questsYamlOutput}</pre>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(questsYamlOutput);
                  alert("Quests YAML copied to clipboard!");
                }}
                className="button button-primary"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        );

      case "quests-json":
        return (
          <div className="export-container">
            <div className="export-header">
              <h2 className="panel-title">Quests JSON Export</h2>
            </div>
            <div className="export-content">
              <div className="export-code">
                <pre className="export-pre">{questsJsonOutput}</pre>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(questsJsonOutput);
                  alert("Quests JSON copied to clipboard!");
                }}
                className="button button-primary"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        );

      case "settings":
        // Settings content...
        return (
          <div className="settings-container">
            <h2 className="settings-header">Editor Settings</h2>
            {/* Settings component would go here */}
          </div>
        );

      default:
        return (
          <div className="empty-state">
            <p>Unknown view: {tabView}</p>
          </div>
        );
    }
  };

  // Determine which export function to use based on current tab
  const getExportFunction = () => {
    if (
      tabView === "quests" ||
      tabView === "quests-yaml" ||
      tabView === "quests-json"
    ) {
      return () => {
        const json = JSON.stringify(quests, null, 2);
        setQuestsJsonOutput(json);
        setTabView("quests-json");
      };
    } else {
      return () => {
        const json = JSON.stringify(dialogueTrees, null, 2);
        setJsonOutput(json);
        setTabView("json");
      };
    }
  };

  return (
    <>
      {renderContent()}
      <SaveReminder
        hasUnsavedChanges={historyStatus.undoCount > 0}
        onExport={getExportFunction()}
      />
    </>
  );
};

export default DialogueEditorLayout;
