import React from "react";
import NodeBasicEditor from "./NodeBasicEditor";
import InnerVoicePanel from "./InnerVoicePanel"; // To be implemented
import DialogueOptionsPanel from "./DialogueOptionsPanel"; // To be implemented
import useNodeEditor from "../hooks/useNodeEditor";

/**
 * Refactored version of the NodeEditor component
 * Breaks down functionality into smaller, focused components
 */
const NodeEditor = ({
  nodeId,
  emotionalStates,
  availableSkills,
  availableItems,
  allNodes,
  quests,
  onUpdate,
  onRenameNodeId,
}) => {
  const {
    node,
    addInnerVoice,
    updateInnerVoice,
    deleteInnerVoice,
    addOption,
    updateOption,
    deleteOption,
  } = useNodeEditor(nodeId);

  if (!node) return null;

  return (
    <div className="node-editor">
      <NodeBasicEditor
        nodeId={nodeId}
        emotionalStates={emotionalStates}
        onRenameNodeId={onRenameNodeId}
      />

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Inner Voice Comments</h3>
          <button
            onClick={addInnerVoice}
            className="button button-sm button-outline"
          >
            + Add Inner Voice
          </button>
        </div>
        <div className="card-body">
          {/* 
            This would be replaced with the InnerVoicePanel component:
            <InnerVoicePanel
              innerVoiceComments={node.inner_voice_comments || []}
              onUpdate={updateInnerVoice}
              onDelete={deleteInnerVoice}
            />
          */}
          <p className="text-light italic text-sm">
            Inner Voice Panel to be implemented
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Dialogue Options</h3>
          <button
            onClick={addOption}
            className="button button-sm button-primary"
          >
            + Add Option
          </button>
        </div>
        <div className="card-body">
          {/* 
            This would be replaced with the DialogueOptionsPanel component:
            <DialogueOptionsPanel
              options={node.options || []}
              allNodes={allNodes}
              availableSkills={availableSkills}
              availableItems={availableItems}
              emotionalStates={emotionalStates}
              quests={quests}
              onUpdate={updateOption}
              onDelete={deleteOption}
            />
          */}
          <p className="text-light italic text-sm">
            Dialogue Options Panel to be implemented
          </p>
        </div>
      </div>
    </div>
  );
};

export default NodeEditor;
