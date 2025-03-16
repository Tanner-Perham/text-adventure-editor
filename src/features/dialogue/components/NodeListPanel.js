import React from "react";
import { useDialogue } from "../context/DialogueContext";
import Panel from "./common/Panel";
import NodeList from "../../../components/NodeList";

/**
 * Panel for displaying and managing the list of dialogue nodes
 */
const NodeListPanel = () => {
  const {
    dialogueTrees,
    currentNode,
    handleNodeSelect,
    addNewNode,
    deleteNode,
    searchTerm,
    setSearchTerm,
    quests,
    tabView,
    setJsonOutput,
    setTabView,
    setDialogueTrees,
    setCurrentNode,
  } = useDialogue();

  // Handler for exporting to JSON
  const handleExportJSON = () => {
    const json = JSON.stringify(dialogueTrees, null, 2);
    setJsonOutput(json);
    setTabView("json");
  };

  // Import handlers
  const handleImportJSON = (event) => {
    if (!event.target.files || !event.target.files[0]) return;

    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        setDialogueTrees(parsed);
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
    // This would need to use the importFromYAML utility
    if (!event.target.files || !event.target.files[0]) return;

    const file = event.target.files[0];

    // Import logic can be implemented here once we have the import function
    alert("YAML import functionality is in progress");
  };

  return (
    <Panel title="Dialogue Nodes">
      <NodeList
        nodes={dialogueTrees}
        currentNode={currentNode}
        onSelectNode={handleNodeSelect}
        onAddNode={addNewNode}
        onDeleteNode={deleteNode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onImportYAML={handleImportYAML}
        quests={quests}
      />
    </Panel>
  );
};

export default NodeListPanel;
