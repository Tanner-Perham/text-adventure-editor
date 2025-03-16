import React, { useState, useEffect } from "react";
import QuestList from "./QuestList";
import QuestDetailsEditor from "./QuestDetailsEditor";
import QuestStageEditor from "./QuestStageEditor";
import QuestExportPanel from "./QuestExportPanel";
import "./QuestEditor.css";

const QuestEditor = ({
  quests,
  dialogueTrees,
  updateQuests,
  availableSkills,
  availableItems,
  availableLocations,
  onExportQuests,
}) => {
  const [currentQuestId, setCurrentQuestId] = useState(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("details"); // details, stages, related-dialogue, export

  // Handle selecting a quest
  const handleQuestSelect = (questId) => {
    setCurrentQuestId(questId);
    setCurrentStageIndex(0);
    setViewMode("details");
  };

  // Handle adding a new quest
  const handleAddQuest = () => {
    const newQuestId = `quest_${Date.now()}`;

    const newQuest = {
      id: newQuestId,
      title: "New Quest",
      description: "Quest description",
      short_description: "Short description",
      importance: "Side", // Main or Side
      is_hidden: false,
      is_main_quest: false,
      related_npcs: [],
      related_locations: [],
      stages: [
        {
          id: "start",
          description: "Initial quest stage",
          notification_text: "New quest started",
          status: "NotStarted",
          objectives: [],
          completion_events: [],
          next_stages: [],
        },
      ],
      rewards: {
        items: [],
        skill_rewards: {},
        relationship_changes: {},
        experience: 0,
        unlocked_locations: [],
        unlocked_dialogues: [],
      },
    };

    updateQuests({
      ...quests,
      [newQuestId]: newQuest,
    });

    handleQuestSelect(newQuestId);
  };

  // Handle deleting a quest
  const handleDeleteQuest = (questId) => {
    if (window.confirm("Are you sure you want to delete this quest?")) {
      const newQuests = { ...quests };
      delete newQuests[questId];

      updateQuests(newQuests);

      if (currentQuestId === questId) {
        setCurrentQuestId(Object.keys(newQuests)[0] || null);
        setCurrentStageIndex(0);
      }
    }
  };

  // Handle updating quest details
  const handleQuestUpdate = (updatedData) => {
    if (!currentQuestId) return;

    updateQuests({
      ...quests,
      [currentQuestId]: {
        ...quests[currentQuestId],
        ...updatedData,
      },
    });
  };

  // Handle updating a quest stage
  const handleStageUpdate = (stageIndex, updatedStage) => {
    if (!currentQuestId) return;

    const updatedQuest = { ...quests[currentQuestId] };
    const updatedStages = [...updatedQuest.stages];
    updatedStages[stageIndex] = {
      ...updatedStages[stageIndex],
      ...updatedStage,
    };

    updatedQuest.stages = updatedStages;

    updateQuests({
      ...quests,
      [currentQuestId]: updatedQuest,
    });
  };

  // Handle adding a new stage
  const handleAddStage = () => {
    if (!currentQuestId) return;

    const updatedQuest = { ...quests[currentQuestId] };
    const newStageId = `stage_${Date.now()}`;

    const newStage = {
      id: newStageId,
      description: "New quest stage",
      notification_text: "Quest updated",
      status: "NotStarted",
      objectives: [],
      completion_events: [],
      next_stages: [],
    };

    updatedQuest.stages = [...updatedQuest.stages, newStage];

    updateQuests({
      ...quests,
      [currentQuestId]: updatedQuest,
    });

    // Set to newly created stage
    setCurrentStageIndex(updatedQuest.stages.length - 1);
  };

  // Handle deleting a stage
  const handleDeleteStage = (stageIndex) => {
    if (!currentQuestId || quests[currentQuestId].stages.length <= 1) {
      alert(
        "Cannot delete the only stage in a quest. Delete the entire quest instead.",
      );
      return;
    }

    if (window.confirm("Are you sure you want to delete this stage?")) {
      const updatedQuest = { ...quests[currentQuestId] };
      const updatedStages = [...updatedQuest.stages];

      // Remove references to this stage from other stages' next_stages
      const stageToDelete = updatedStages[stageIndex];
      updatedStages.forEach((stage) => {
        if (stage.next_stages) {
          stage.next_stages = stage.next_stages.filter(
            (nextStage) => nextStage.stage_id !== stageToDelete.id,
          );
        }
      });

      // Remove the stage
      updatedStages.splice(stageIndex, 1);
      updatedQuest.stages = updatedStages;

      updateQuests({
        ...quests,
        [currentQuestId]: updatedQuest,
      });

      // Update current stage index if needed
      if (stageIndex >= updatedStages.length) {
        setCurrentStageIndex(Math.max(0, updatedStages.length - 1));
      }
    }
  };

  // Find dialogue nodes related to the current quest
  const findRelatedDialogue = () => {
    if (!currentQuestId) return [];

    const relatedNodes = [];

    // Search through dialogue options for quest-related effects
    Object.entries(dialogueTrees).forEach(([nodeId, node]) => {
      if (node.options) {
        node.options.forEach((option) => {
          if (option.consequences) {
            const hasQuestEffect = option.consequences.some((effect) => {
              // Check all effect types that might reference this quest
              if (
                effect.event_type === "StartQuest" &&
                effect.data === currentQuestId
              )
                return true;
              if (
                effect.event_type === "AdvanceQuest" &&
                effect.data &&
                effect.data[0] === currentQuestId
              )
                return true;
              if (
                effect.event_type === "CompleteQuestObjective" &&
                effect.data &&
                effect.data[0] === currentQuestId
              )
                return true;
              if (
                effect.event_type === "FailQuest" &&
                effect.data === currentQuestId
              )
                return true;
              return false;
            });

            if (hasQuestEffect) {
              relatedNodes.push({
                nodeId,
                nodeText: node.text,
                speaker: node.speaker,
                optionText: option.text,
              });
            }
          }
        });
      }
    });

    return relatedNodes;
  };

  // Handle changing view mode
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Get the current quest
  const currentQuest = currentQuestId ? quests[currentQuestId] : null;
  const currentStage =
    currentQuest &&
    currentQuest.stages &&
    currentQuest.stages.length > currentStageIndex
      ? currentQuest.stages[currentStageIndex]
      : null;

  return (
    <div className="quest-editor-container">
      <div className="quest-editor-layout">
        {/* Left panel: Quest list */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Quests</h2>
          </div>
          <div className="panel-content">
            <QuestList
              quests={quests}
              currentQuestId={currentQuestId}
              onSelectQuest={handleQuestSelect}
              onAddQuest={handleAddQuest}
              onDeleteQuest={handleDeleteQuest}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
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
                  onClick={() => handleViewModeChange("details")}
                >
                  Details
                </button>
                <button
                  className={`tab-button ${viewMode === "stages" ? "active" : ""}`}
                  onClick={() => handleViewModeChange("stages")}
                >
                  Stages
                </button>
                <button
                  className={`tab-button ${viewMode === "related-dialogue" ? "active" : ""}`}
                  onClick={() => handleViewModeChange("related-dialogue")}
                >
                  Related Dialogue
                </button>
                <button
                  className={`tab-button ${viewMode === "export" ? "active" : ""}`}
                  onClick={() => handleViewModeChange("export")}
                >
                  Export
                </button>
              </div>
            )}
          </div>
          <div className="panel-content panel-scroll">
            {currentQuest ? (
              <>
                {viewMode === "details" && (
                  <QuestDetailsEditor
                    quest={currentQuest}
                    onUpdate={handleQuestUpdate}
                    availableSkills={availableSkills}
                    availableItems={availableItems}
                    availableLocations={availableLocations}
                    dialogueTrees={dialogueTrees}
                  />
                )}

                {viewMode === "stages" && (
                  <div className="stage-editor-container">
                    <div className="stage-tabs">
                      {currentQuest.stages.map((stage, index) => (
                        <button
                          key={stage.id}
                          className={`stage-tab ${index === currentStageIndex ? "active" : ""}`}
                          onClick={() => setCurrentStageIndex(index)}
                        >
                          {stage.id}
                        </button>
                      ))}
                      <button
                        className="stage-tab stage-tab-add"
                        onClick={handleAddStage}
                        title="Add new stage"
                      >
                        +
                      </button>
                    </div>

                    {currentStage && (
                      <QuestStageEditor
                        stage={currentStage}
                        allStages={currentQuest.stages}
                        onUpdate={(updatedStage) =>
                          handleStageUpdate(currentStageIndex, updatedStage)
                        }
                        onDelete={() => handleDeleteStage(currentStageIndex)}
                        availableItems={availableItems}
                        availableSkills={availableSkills}
                        availableLocations={availableLocations}
                        dialogueTrees={dialogueTrees}
                      />
                    )}
                  </div>
                )}

                {viewMode === "related-dialogue" && (
                  <div className="related-dialogue-container">
                    <h3 className="section-title">
                      Dialogue Nodes Related to this Quest
                    </h3>
                    <div className="related-nodes-list">
                      {findRelatedDialogue().length > 0 ? (
                        findRelatedDialogue().map((node, index) => (
                          <div key={index} className="related-node-card">
                            <div className="related-node-header">
                              <div className="related-node-id">
                                {node.nodeId}
                              </div>
                              <div className="related-node-speaker">
                                {node.speaker}
                              </div>
                            </div>
                            <div className="related-node-text">
                              {node.nodeText}
                            </div>
                            <div className="related-node-option">
                              <span className="related-node-option-label">
                                Via option:
                              </span>{" "}
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
                )}

                {viewMode === "export" && (
                  <QuestExportPanel
                    quest={currentQuest}
                    onExport={() => onExportQuests()}
                  />
                )}
              </>
            ) : (
              <div className="empty-state">
                <p className="text-center text-light">
                  No quest selected. Create a new quest or select an existing
                  one.
                </p>
                <div className="text-center mt-4">
                  <button
                    onClick={handleAddQuest}
                    className="button button-primary"
                  >
                    Create First Quest
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestEditor;
