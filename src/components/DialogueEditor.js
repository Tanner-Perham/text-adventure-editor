import React, { useState, useEffect, useCallback } from "react";
import NodeList from "./NodeList";
import NodeEditor from "./NodeEditor";
import Visualisation from "./Visualisation";
import Preview from "./Preview";
import SaveReminder from "./SaveReminder";
import ExportPanel from "./ExportPanel";
import Settings from "./Settings";
import QuestEditor from "./QuestEditor";
import { exportToYAML, exportToJSON } from "../utils/exporters";
import { importFromYAML } from "../utils/yamlImporter";
import {
  exportQuestsToYAML,
  exportQuestsToJSON,
} from "../utils/questExporters";
import HistoryManager from "../utils/historyManager";
import "./DialogueEditor.css"; // Import the CSS file
import "./QuestEditor.css"; // Import the Quest Editor CSS file

const DialogueEditor = () => {
  const [dialogueTrees, setDialogueTrees] = useState({
    martinez_intro: {
      id: "martinez_intro",
      text: "What are you doing here? This is a restricted area.",
      speaker: "Officer Martinez",
      emotional_state: "Suspicious",
      inner_voice_comments: [
        {
          voice_type: "Empathy",
          text: "His posture is defensive, but there's worry in his eyes. Something's eating at him.",
          skill_requirement: 8,
        },
        {
          voice_type: "Authority",
          text: "He's testing your authority. Stand your ground.",
          skill_requirement: 7,
        },
      ],
      options: [],
    },
  });

  // State for quests
  const [quests, setQuests] = useState({});

  // Initialize history manager with the initial state
  const [historyManager] = useState(
    () =>
      new HistoryManager({
        dialogueTrees,
        quests,
      }),
  );

  const [historyStatus, setHistoryStatus] = useState({
    canUndo: false,
    canRedo: false,
    undoCount: 0,
    redoCount: 0,
  });

  const [currentNode, setCurrentNode] = useState("martinez_intro");
  const [yamlOutput, setYamlOutput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [questsYamlOutput, setQuestsYamlOutput] = useState("");
  const [questsJsonOutput, setQuestsJsonOutput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [tabView, setTabView] = useState("editor"); // editor, yaml, json, preview, quests, settings
  const [emotionalStates, setEmotionalStates] = useState([
    "Neutral",
    "Friendly",
    "Suspicious",
    "Angry",
    "Scared",
    "Nervous",
    "Sad",
    "Happy",
    "Confused",
  ]);
  const [availableSkills, setAvailableSkills] = useState([
    "authority",
    "composure",
    "suggestion",
    "empathy",
    "logic",
    "perception",
    "strength",
    "agility",
  ]);
  const [previewConversation, setPreviewConversation] = useState([]);
  const [availableItems, setAvailableItems] = useState([
    "police_badge",
    "gun",
    "id_card",
    "radio",
  ]);
  const [availableLocations, setAvailableLocations] = useState([
    "warehouse_entrance",
    "warehouse_office",
    "town_square",
    "market",
    "garden",
    "parking_lot",
  ]);
  const [showNodeDetails, setShowNodeDetails] = useState(true);
  const [showSkillChecks, setShowSkillChecks] = useState(true);
  const [viewMode, setViewMode] = useState("flow"); // flow, tree, timeline
  const [showQuestsInVisualization, setShowQuestsInVisualization] =
    useState(false);

  // Update the history status whenever the history manager changes
  useEffect(() => {
    setHistoryStatus(historyManager.getHistoryStatus());
  }, [historyManager.getCurrentState()]);

  // Create a wrapper for setDialogueTrees that also updates the history
  const updateDialogueTrees = useCallback(
    (newTreesOrUpdater) => {
      setDialogueTrees((prevTrees) => {
        const newTrees =
          typeof newTreesOrUpdater === "function"
            ? newTreesOrUpdater(prevTrees)
            : newTreesOrUpdater;

        // Push the new state to the history manager
        historyManager.pushState({
          dialogueTrees: newTrees,
          quests,
        });

        // Update the history status
        setHistoryStatus(historyManager.getHistoryStatus());

        return newTrees;
      });
    },
    [historyManager, quests],
  );

  // Create a wrapper for setQuests that also updates the history
  const updateQuests = useCallback(
    (newQuestsOrUpdater) => {
      setQuests((prevQuests) => {
        const newQuests =
          typeof newQuestsOrUpdater === "function"
            ? newQuestsOrUpdater(prevQuests)
            : newQuestsOrUpdater;

        // Push the new state to the history manager
        historyManager.pushState({
          dialogueTrees,
          quests: newQuests,
        });

        // Update the history status
        setHistoryStatus(historyManager.getHistoryStatus());

        return newQuests;
      });
    },
    [historyManager, dialogueTrees],
  );

  // Undo the last change
  const handleUndo = useCallback(() => {
    const previousState = historyManager.undo();
    if (previousState) {
      setDialogueTrees(previousState.dialogueTrees);
      setQuests(previousState.quests);
      setHistoryStatus(historyManager.getHistoryStatus());
    }
  }, [historyManager]);

  // Redo the last undone change
  const handleRedo = useCallback(() => {
    const nextState = historyManager.redo();
    if (nextState) {
      setDialogueTrees(nextState.dialogueTrees);
      setQuests(nextState.quests);
      setHistoryStatus(historyManager.getHistoryStatus());
    }
  }, [historyManager]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+Z (Undo) or Command+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Check for Ctrl+Y (Redo) or Command+Shift+Z (Mac)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.shiftKey && e.key === "z"))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  // Node modification handlers
  const handleNodeSelect = (nodeId) => {
    setCurrentNode(nodeId);
  };

  const handleNodeUpdate = (nodeId, updatedData) => {
    updateDialogueTrees((prev) => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        ...updatedData,
      },
    }));
  };

  const addNewNode = () => {
    const newNodeId = `node_${Date.now()}`;
    updateDialogueTrees((prev) => ({
      ...prev,
      [newNodeId]: {
        id: newNodeId,
        text: "New dialogue node",
        speaker: "",
        emotional_state: "Neutral",
        options: [],
      },
    }));
    setCurrentNode(newNodeId);
  };

  const deleteNode = (nodeId) => {
    // Check if any other nodes refer to this node
    const hasReferences = Object.values(dialogueTrees).some(
      (node) =>
        node.options &&
        node.options.some((option) => option.next_node === nodeId),
    );

    if (hasReferences) {
      if (
        !confirm(
          "This node is referenced by other nodes. Deleting it may create broken links. Continue?",
        )
      ) {
        return;
      }
    }

    updateDialogueTrees((prev) => {
      const newTrees = { ...prev };
      delete newTrees[nodeId];
      return newTrees;
    });

    // If deleting current node, switch to another node
    if (currentNode === nodeId) {
      const remainingNodes = Object.keys(dialogueTrees).filter(
        (id) => id !== nodeId,
      );
      if (remainingNodes.length > 0) {
        setCurrentNode(remainingNodes[0]);
      } else {
        setCurrentNode("");
      }
    }
  };

  // New handler for renaming node IDs
  const renameNodeId = (oldNodeId, newNodeId) => {
    if (oldNodeId === newNodeId) return;

    // Create a copy of the dialogue trees
    updateDialogueTrees((prev) => {
      const newTrees = { ...prev };

      // Create the new node with the updated ID
      newTrees[newNodeId] = {
        ...newTrees[oldNodeId],
        id: newNodeId, // Update the internal ID to match as well
      };

      // Remove the old node
      delete newTrees[oldNodeId];

      // Update any references to this node in options
      Object.keys(newTrees).forEach((nodeKey) => {
        const node = newTrees[nodeKey];
        if (node.options && node.options.length > 0) {
          node.options.forEach((option) => {
            if (option.next_node === oldNodeId) {
              option.next_node = newNodeId;
            }
          });
        }
      });

      return newTrees;
    });

    // Update the current node selection if needed
    if (currentNode === oldNodeId) {
      setCurrentNode(newNodeId);
    }
  };

  // Import/Export handlers for dialogue trees
  const handleExportYAML = () => {
    const yaml = exportToYAML(dialogueTrees);
    setYamlOutput(yaml);
    setTabView("yaml");
  };

  const handleExportJSON = () => {
    const json = exportToJSON(dialogueTrees);
    setJsonOutput(json);
    setTabView("json");
  };

  const importFromJSON = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        updateDialogueTrees(parsed);
        alert("Dialogue tree imported successfully!");

        // Set current node to first node in the tree
        if (Object.keys(parsed).length > 0) {
          setCurrentNode(Object.keys(parsed)[0]);
        }
      } catch (error) {
        alert("Error importing file: " + error.message);
      }
    };
  };

  const handleImportYAML = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");

    fileReader.onload = (e) => {
      try {
        // Use the imported function directly
        const result = importFromYAML(file);

        result
          .then((parsedData) => {
            updateDialogueTrees(parsedData);
            alert("YAML dialogue tree imported successfully!");

            // Set current node to first node in the tree
            if (Object.keys(parsedData).length > 0) {
              setCurrentNode(Object.keys(parsedData)[0]);
            }
          })
          .catch((error) => {
            alert(error.message);
          });
      } catch (error) {
        alert("Error importing YAML file: " + error.message);
      }
    };

    fileReader.onerror = () => {
      alert("Failed to read the file");
    };
  };

  // Import/Export handlers for quests
  const handleExportQuestsYAML = () => {
    const yaml = exportQuestsToYAML(quests);
    setQuestsYamlOutput(yaml);
    setTabView("quests-yaml");
  };

  const handleExportQuestsJSON = () => {
    const json = exportQuestsToJSON(quests);
    setQuestsJsonOutput(json);
    setTabView("quests-json");
  };

  const importQuestsFromJSON = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        updateQuests(parsed);
        alert("Quests imported successfully!");
      } catch (error) {
        alert("Error importing file: " + error.message);
      }
    };
  };

  // Preview handlers
  const startPreview = () => {
    setPreviewConversation([
      {
        nodeId: currentNode,
        speaker: dialogueTrees[currentNode].speaker,
        text: dialogueTrees[currentNode].text,
        emotional_state: dialogueTrees[currentNode].emotional_state,
      },
    ]);
    setTabView("preview");
  };

  // Settings handlers
  const updateEmotionalStates = (newStates) => {
    setEmotionalStates(newStates);
  };

  const updateAvailableSkills = (newSkills) => {
    setAvailableSkills(newSkills);
  };

  const updateAvailableItems = (newItems) => {
    setAvailableItems(newItems);
  };

  const updateAvailableLocations = (newLocations) => {
    setAvailableLocations(newLocations);
  };

  // Find dialogue nodes related to a quest
  const findQuestRelatedNodes = (questId) => {
    const relatedNodes = [];

    Object.entries(dialogueTrees).forEach(([nodeId, node]) => {
      if (node.options) {
        node.options.forEach((option, optionIndex) => {
          if (option.consequences) {
            const hasQuestEffect = option.consequences.some((effect) => {
              if (effect.event_type === "StartQuest" && effect.data === questId)
                return true;
              if (
                effect.event_type === "AdvanceQuest" &&
                effect.data &&
                effect.data[0] === questId
              )
                return true;
              if (
                effect.event_type === "CompleteQuestObjective" &&
                effect.data &&
                effect.data[0] === questId
              )
                return true;
              if (effect.event_type === "FailQuest" && effect.data === questId)
                return true;
              return false;
            });

            if (hasQuestEffect) {
              relatedNodes.push({
                nodeId,
                optionIndex,
                speaker: node.speaker,
                text: node.text,
                optionText: option.text,
              });
            }
          }
        });
      }
    });

    return relatedNodes;
  };

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Cancel the event and show confirmation dialog
      event.preventDefault();
      // Chrome requires returnValue to be set
      event.returnValue = "";

      // Custom message (Note: Most modern browsers no longer display custom messages for security reasons)
      return "You have unsaved changes. Your work will be lost if you leave the page without exporting. Are you sure you want to leave?";
    };

    // Check if there are changes (undoStack has items)
    if (historyStatus.undoCount > 0) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    } else {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [historyStatus.undoCount]); // Dependency on undoCount ensures the listener is added/removed appropriately

  return (
    <div className="dialogue-editor-container">
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
                className={`history-status-dot ${historyStatus.undoCount > 0 ? "has-history" : "no-history"}`}
              ></div>
              <span>
                {historyStatus.undoCount > 0
                  ? `${historyStatus.undoCount} change${historyStatus.undoCount !== 1 ? "s" : ""}`
                  : "No changes"}
              </span>
            </div>
          </div>
          <div className="tabs-container">
            <button
              className={`tab-button ${tabView === "editor" ? "active" : ""}`}
              onClick={() => setTabView("editor")}
            >
              Dialogue Editor
            </button>
            <button
              className={`tab-button ${tabView === "quests" ? "active" : ""}`}
              onClick={() => setTabView("quests")}
            >
              Quest Editor
            </button>
            <button
              className={`tab-button ${tabView === "visualization" ? "active" : ""}`}
              onClick={() => setTabView("visualization")}
            >
              Visualization
            </button>
            <button
              className={`tab-button ${tabView === "preview" ? "active" : ""}`}
              onClick={startPreview}
            >
              Preview
            </button>
            <button
              className={`tab-button ${tabView === "yaml" || tabView === "quests-yaml" ? "active" : ""}`}
              onClick={
                tabView === "quests" ? handleExportQuestsYAML : handleExportYAML
              }
            >
              YAML
            </button>
            <button
              className={`tab-button ${tabView === "json" || tabView === "quests-json" ? "active" : ""}`}
              onClick={
                tabView === "quests" ? handleExportQuestsJSON : handleExportJSON
              }
            >
              JSON
            </button>
            <button
              className={`tab-button ${tabView === "settings" ? "active" : ""}`}
              onClick={() => setTabView("settings")}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {tabView === "editor" && (
        <div className="editor-layout">
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Dialogue Nodes</h2>
            </div>
            <div className="panel-content">
              <NodeList
                nodes={dialogueTrees}
                currentNode={currentNode}
                onSelectNode={handleNodeSelect}
                onAddNode={addNewNode}
                onDeleteNode={deleteNode}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onExportJSON={handleExportJSON}
                onImportJSON={importFromJSON}
                onImportYAML={handleImportYAML}
                quests={quests} // Pass quests to highlight related nodes
              />
            </div>
          </div>

          <div className="panel-large">
            <div className="panel-header">
              <h2 className="panel-title">
                {currentNode ? `Edit Node: ${currentNode}` : "Node Editor"}
              </h2>
            </div>
            <div className="panel-content panel-scroll">
              {currentNode && dialogueTrees[currentNode] ? (
                <NodeEditor
                  node={dialogueTrees[currentNode]}
                  nodeId={currentNode}
                  emotionalStates={emotionalStates}
                  availableSkills={availableSkills}
                  availableItems={availableItems}
                  allNodes={dialogueTrees}
                  quests={quests} // Pass quests for quest-related dialogue effects
                  onUpdate={(updatedData) =>
                    handleNodeUpdate(currentNode, updatedData)
                  }
                  onRenameNodeId={renameNodeId}
                />
              ) : (
                <div className="empty-state">
                  <p className="text-center text-light">
                    No node selected. Create a new node or select an existing
                    one.
                  </p>
                  <div className="text-center mt-4">
                    <button
                      onClick={addNewNode}
                      className="button button-primary"
                    >
                      Create First Node
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tabView === "quests" && (
        <QuestEditor
          quests={quests}
          dialogueTrees={dialogueTrees}
          updateQuests={updateQuests}
          availableSkills={availableSkills}
          availableItems={availableItems}
          availableLocations={availableLocations}
          onExportQuests={handleExportQuestsYAML}
        />
      )}

      {tabView === "visualization" && (
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
      )}

      {tabView === "preview" && (
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
              quests={quests} // Pass quests to show quest effects in preview
              onRestart={startPreview}
            />
          </div>
        </div>
      )}

      {tabView === "yaml" && (
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
      )}

      {tabView === "json" && (
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
      )}

      {tabView === "quests-yaml" && (
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
      )}

      {tabView === "quests-json" && (
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
      )}

      {tabView === "settings" && (
        <div className="settings-container">
          <h2 className="settings-header">Editor Settings</h2>

          <Settings
            emotionalStates={emotionalStates}
            availableSkills={availableSkills}
            availableItems={availableItems}
            availableLocations={availableLocations}
            onUpdateEmotionalStates={updateEmotionalStates}
            onUpdateAvailableSkills={updateAvailableSkills}
            onUpdateAvailableItems={updateAvailableItems}
            onUpdateAvailableLocations={updateAvailableLocations}
          />
        </div>
      )}
      <SaveReminder
        hasUnsavedChanges={historyStatus.undoCount > 0}
        onExport={
          tabView === "quests" ? handleExportQuestsJSON : handleExportJSON
        }
      />
    </div>
  );
};

export default DialogueEditor;
