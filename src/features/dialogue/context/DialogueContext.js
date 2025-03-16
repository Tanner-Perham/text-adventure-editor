import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import HistoryManager from "../../../utils/historyManager";

// Create the dialogue context
const DialogueContext = createContext();

// Custom hook to use the dialogue context
export const useDialogue = () => {
  const context = useContext(DialogueContext);
  if (!context) {
    throw new Error("useDialogue must be used within a DialogueProvider");
  }
  return context;
};

// Provider component for the dialogue context
export const DialogueProvider = ({ children }) => {
  // State for dialogue trees
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

  // State for history status
  const [historyStatus, setHistoryStatus] = useState({
    canUndo: false,
    canRedo: false,
    undoCount: 0,
    redoCount: 0,
  });

  // Editor state
  const [currentNode, setCurrentNode] = useState("martinez_intro");
  const [tabView, setTabView] = useState("editor"); // editor, yaml, json, preview, quests, settings
  const [searchTerm, setSearchTerm] = useState("");

  // Export state
  const [yamlOutput, setYamlOutput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [questsYamlOutput, setQuestsYamlOutput] = useState("");
  const [questsJsonOutput, setQuestsJsonOutput] = useState("");

  // Settings state
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

  // Preview state
  const [previewConversation, setPreviewConversation] = useState([]);

  // Visualization state
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
      // Use window.confirm instead of the global confirm
      if (
        !window.confirm(
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

  // Handler for renaming node IDs
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

  // Value to provide in the context
  const contextValue = {
    // State
    dialogueTrees,
    quests,
    historyStatus,
    currentNode,
    tabView,
    searchTerm,
    yamlOutput,
    jsonOutput,
    questsYamlOutput,
    questsJsonOutput,
    emotionalStates,
    availableSkills,
    availableItems,
    availableLocations,
    previewConversation,
    showNodeDetails,
    showSkillChecks,
    viewMode,
    showQuestsInVisualization,

    // State updaters
    setDialogueTrees,
    updateDialogueTrees,
    setQuests,
    updateQuests,
    setCurrentNode,
    setTabView,
    setSearchTerm,
    setYamlOutput,
    setJsonOutput,
    setQuestsYamlOutput,
    setQuestsJsonOutput,
    setEmotionalStates,
    setAvailableSkills,
    setAvailableItems,
    setAvailableLocations,
    setPreviewConversation,
    setShowNodeDetails,
    setShowSkillChecks,
    setViewMode,
    setShowQuestsInVisualization,

    // Action handlers
    handleUndo,
    handleRedo,
    handleNodeSelect,
    handleNodeUpdate,
    addNewNode,
    deleteNode,
    renameNodeId,
    startPreview,
    updateEmotionalStates,
    updateAvailableSkills,
    updateAvailableItems,
    updateAvailableLocations,
  };

  return (
    <DialogueContext.Provider value={contextValue}>
      {children}
    </DialogueContext.Provider>
  );
};

export default DialogueContext;
