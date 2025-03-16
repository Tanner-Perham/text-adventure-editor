import React from "react";
import { useDialogue } from "../context/DialogueContext";
import Panel from "./common/Panel";
import NodeEditor from "../../../components/NodeEditor";

/**
 * Panel for editing the currently selected dialogue node
 */
const NodeEditorPanel = () => {
  const {
    dialogueTrees,
    currentNode,
    emotionalStates,
    availableSkills,
    availableItems,
    quests,
    handleNodeUpdate,
    renameNodeId,
    addNewNode,
  } = useDialogue();

  // Get the current node data
  const currentNodeData = currentNode ? dialogueTrees[currentNode] : null;

  // Panel title based on current node
  const panelTitle = currentNode ? `Edit Node: ${currentNode}` : "Node Editor";

  return (
    <Panel title={panelTitle} large>
      <div className="panel-scroll">
        {currentNodeData ? (
          <NodeEditor
            node={currentNodeData}
            nodeId={currentNode}
            emotionalStates={emotionalStates}
            availableSkills={availableSkills}
            availableItems={availableItems}
            allNodes={dialogueTrees}
            quests={quests}
            onUpdate={(updatedData) =>
              handleNodeUpdate(currentNode, updatedData)
            }
            onRenameNodeId={renameNodeId}
          />
        ) : (
          <div className="empty-state">
            <p className="text-center text-light">
              No node selected. Create a new node or select an existing one.
            </p>
            <div className="text-center mt-4">
              <button onClick={addNewNode} className="button button-primary">
                Create First Node
              </button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};

export default NodeEditorPanel;
