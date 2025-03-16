import React, { createContext, useContext, useState, useCallback } from "react";

// Create context
const QuestContext = createContext();

// Custom hook to use the quest context
export const useQuest = () => {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error("useQuest must be used within a QuestProvider");
  }
  return context;
};

export const QuestProvider = ({
  children,
  initialQuests = {},
  dialogueTrees = {},
  availableSkills = [],
  availableItems = [],
  availableLocations = [],
  onUpdateQuests, // Function to call when quests are updated (for history)
  onExportQuests, // Function to call for exporting quests
}) => {
  // Main quest state
  const [quests, setQuestsInternal] = useState(initialQuests);

  // UI state
  const [currentQuestId, setCurrentQuestId] = useState(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("details"); // details, stages, related-dialogue, export

  // Export state
  const [questsYamlOutput, setQuestsYamlOutput] = useState("");
  const [questsJsonOutput, setQuestsJsonOutput] = useState("");

  // Wrap the setQuests to propagate changes to parent component
  const setQuests = useCallback(
    (newQuestsOrUpdater) => {
      setQuestsInternal((prevQuests) => {
        const newQuests =
          typeof newQuestsOrUpdater === "function"
            ? newQuestsOrUpdater(prevQuests)
            : newQuestsOrUpdater;

        // Call the parent update handler if provided
        if (onUpdateQuests) {
          onUpdateQuests(newQuests);
        }

        return newQuests;
      });
    },
    [onUpdateQuests],
  );

  // Quest selection handler
  const handleQuestSelect = useCallback((questId) => {
    setCurrentQuestId(questId);
    setCurrentStageIndex(0);
    setViewMode("details");
  }, []);

  // Add new quest
  const handleAddQuest = useCallback(() => {
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

    setQuests((prev) => ({
      ...prev,
      [newQuestId]: newQuest,
    }));

    handleQuestSelect(newQuestId);
  }, [handleQuestSelect, setQuests]);

  // Delete quest
  const handleDeleteQuest = useCallback(
    (questId) => {
      if (window.confirm("Are you sure you want to delete this quest?")) {
        setQuests((prev) => {
          const newQuests = { ...prev };
          delete newQuests[questId];
          return newQuests;
        });

        if (currentQuestId === questId) {
          // Select another quest if available, otherwise clear selection
          const remainingQuestIds = Object.keys(quests).filter(
            (id) => id !== questId,
          );
          if (remainingQuestIds.length > 0) {
            setCurrentQuestId(remainingQuestIds[0]);
          } else {
            setCurrentQuestId(null);
          }
          setCurrentStageIndex(0);
        }
      }
    },
    [currentQuestId, quests, setQuests],
  );

  // Update quest details
  const updateQuestDetails = useCallback(
    (questId, updatedData) => {
      if (!questId) return;

      setQuests((prev) => ({
        ...prev,
        [questId]: {
          ...prev[questId],
          ...updatedData,
        },
      }));
    },
    [setQuests],
  );

  // Add a stage to a quest
  const addStage = useCallback(
    (questId) => {
      if (!questId) return;

      setQuests((prev) => {
        const quest = prev[questId];
        if (!quest) return prev;

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

        return {
          ...prev,
          [questId]: {
            ...quest,
            stages: [...quest.stages, newStage],
          },
        };
      });

      // Set to newly created stage
      setCurrentStageIndex(quests[questId]?.stages.length || 0);
    },
    [quests, setQuests],
  );

  // Update a stage
  const updateStage = useCallback(
    (questId, stageIndex, updatedStage) => {
      if (!questId) return;

      setQuests((prev) => {
        const quest = prev[questId];
        if (!quest || !quest.stages || stageIndex >= quest.stages.length)
          return prev;

        const updatedStages = [...quest.stages];
        updatedStages[stageIndex] = {
          ...updatedStages[stageIndex],
          ...updatedStage,
        };

        return {
          ...prev,
          [questId]: {
            ...quest,
            stages: updatedStages,
          },
        };
      });
    },
    [setQuests],
  );

  // Delete a stage
  const deleteStage = useCallback(
    (questId, stageIndex) => {
      if (!questId) return;

      const quest = quests[questId];
      if (!quest || !quest.stages || quest.stages.length <= 1) {
        alert(
          "Cannot delete the only stage in a quest. Delete the entire quest instead.",
        );
        return;
      }

      if (window.confirm("Are you sure you want to delete this stage?")) {
        setQuests((prev) => {
          const quest = prev[questId];
          const updatedStages = [...quest.stages];

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

          return {
            ...prev,
            [questId]: {
              ...quest,
              stages: updatedStages,
            },
          };
        });

        // Update current stage index if needed
        if (stageIndex >= quest.stages.length - 1) {
          setCurrentStageIndex(Math.max(0, quest.stages.length - 2));
        }
      }
    },
    [quests, setQuests],
  );

  // Add an objective to a stage
  const addObjective = useCallback(
    (questId, stageIndex) => {
      if (!questId) return;

      const newObjectiveId = `objective_${Date.now()}`;
      const newObjective = {
        id: newObjectiveId,
        description: "New objective",
        required_clues: [],
        required_items: [],
        required_location: null,
        required_npc_interaction: null,
        is_completed: false,
        is_optional: false,
        completion_events: [],
      };

      setQuests((prev) => {
        const quest = prev[questId];
        if (!quest || !quest.stages || stageIndex >= quest.stages.length)
          return prev;

        const updatedStages = [...quest.stages];
        const currentStage = updatedStages[stageIndex];

        updatedStages[stageIndex] = {
          ...currentStage,
          objectives: [...(currentStage.objectives || []), newObjective],
        };

        return {
          ...prev,
          [questId]: {
            ...quest,
            stages: updatedStages,
          },
        };
      });
    },
    [setQuests],
  );

  // Update an objective
  const updateObjective = useCallback(
    (questId, stageIndex, objectiveIndex, updatedObjective) => {
      if (!questId) return;

      setQuests((prev) => {
        const quest = prev[questId];
        if (!quest || !quest.stages || stageIndex >= quest.stages.length)
          return prev;

        const stage = quest.stages[stageIndex];
        if (!stage.objectives || objectiveIndex >= stage.objectives.length)
          return prev;

        const updatedStages = [...quest.stages];
        const updatedObjectives = [...stage.objectives];

        updatedObjectives[objectiveIndex] = {
          ...updatedObjectives[objectiveIndex],
          ...updatedObjective,
        };

        updatedStages[stageIndex] = {
          ...stage,
          objectives: updatedObjectives,
        };

        return {
          ...prev,
          [questId]: {
            ...quest,
            stages: updatedStages,
          },
        };
      });
    },
    [setQuests],
  );

  // Delete an objective
  const deleteObjective = useCallback(
    (questId, stageIndex, objectiveIndex) => {
      if (!questId) return;

      setQuests((prev) => {
        const quest = prev[questId];
        if (!quest || !quest.stages || stageIndex >= quest.stages.length)
          return prev;

        const stage = quest.stages[stageIndex];
        if (!stage.objectives || objectiveIndex >= stage.objectives.length)
          return prev;

        const updatedStages = [...quest.stages];
        const updatedObjectives = [...stage.objectives];

        updatedObjectives.splice(objectiveIndex, 1);

        updatedStages[stageIndex] = {
          ...stage,
          objectives: updatedObjectives,
        };

        return {
          ...prev,
          [questId]: {
            ...quest,
            stages: updatedStages,
          },
        };
      });
    },
    [setQuests],
  );

  // Find dialogue nodes related to the current quest
  const findRelatedDialogue = useCallback(
    (questId) => {
      if (!questId || !dialogueTrees) return [];

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
                  effect.data === questId
                )
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
                if (
                  effect.event_type === "FailQuest" &&
                  effect.data === questId
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
    },
    [dialogueTrees],
  );

  // Get all NPCs from dialogue trees
  const getAllNPCs = useCallback(() => {
    if (!dialogueTrees) return [];

    const npcSet = new Set();

    Object.values(dialogueTrees).forEach((node) => {
      if (node.speaker && node.speaker.trim() !== "") {
        npcSet.add(node.speaker);
      }
    });

    return Array.from(npcSet).sort();
  }, [dialogueTrees]);

  // Get all stages for a specific quest
  const getQuestStages = useCallback(
    (questId) => {
      if (!questId || !quests[questId] || !quests[questId].stages) {
        return [];
      }

      return quests[questId].stages.map((stage) => ({
        id: stage.id,
        description: stage.description,
      }));
    },
    [quests],
  );

  // Get objectives for a specific quest stage
  const getQuestObjectives = useCallback(
    (questId, stageId) => {
      if (!questId || !quests[questId] || !quests[questId].stages) {
        return [];
      }

      const stage = quests[questId].stages.find((s) => s.id === stageId);
      if (!stage || !stage.objectives) {
        return [];
      }

      return stage.objectives.map((obj) => ({
        id: obj.id,
        description: obj.description,
      }));
    },
    [quests],
  );

  // Filter quests based on search term
  const filteredQuests = Object.entries(quests).filter(([_, quest]) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      quest.id.toLowerCase().includes(searchLower) ||
      quest.title.toLowerCase().includes(searchLower) ||
      quest.description.toLowerCase().includes(searchLower)
    );
  });

  // Current quest and stage
  const currentQuest = currentQuestId ? quests[currentQuestId] : null;
  const currentStage =
    currentQuest &&
    currentQuest.stages &&
    currentQuest.stages.length > currentStageIndex
      ? currentQuest.stages[currentStageIndex]
      : null;

  // Context value
  const value = {
    // Data
    quests,
    filteredQuests,
    currentQuestId,
    currentStageIndex,
    currentQuest,
    currentStage,
    searchTerm,
    viewMode,
    questsYamlOutput,
    questsJsonOutput,
    dialogueTrees,
    availableSkills,
    availableItems,
    availableLocations,

    // Actions
    setQuests,
    setSearchTerm,
    setViewMode,
    setCurrentQuestId,
    setCurrentStageIndex,
    setQuestsYamlOutput,
    setQuestsJsonOutput,

    // Quest operations
    handleQuestSelect,
    handleAddQuest,
    handleDeleteQuest,
    updateQuestDetails,

    // Stage operations
    addStage,
    updateStage,
    deleteStage,

    // Objective operations
    addObjective,
    updateObjective,
    deleteObjective,

    // Utility functions
    findRelatedDialogue,
    getAllNPCs,
    getQuestStages,
    getQuestObjectives,

    // Export function
    onExportQuests,
  };

  return (
    <QuestContext.Provider value={value}>{children}</QuestContext.Provider>
  );
};

export default QuestContext;
