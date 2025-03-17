import React from "react";
import { useDialogue } from "../context/DialogueContext";
import Panel from "./common/Panel";
import NodeList from "../../../components/NodeList";
import { importFromYAML } from "../../../utils/yamlImporter";

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
    if (!event.target.files || !event.target.files[0]) return;

    const file = event.target.files[0];

    importFromYAML(file)
      .then((parsedData) => {
        setDialogueTrees(parsedData);
        alert("Dialogue tree imported successfully!");

        // Set current node to first node in the tree
        if (Object.keys(parsedData).length > 0) {
          setCurrentNode(Object.keys(parsedData)[0]);
        }
      })
      .catch((error) => {
        alert(error.message);
      });
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
