import { useState } from "react";
import { useDialogue } from "../context/DialogueContext";

/**
 * Custom hook for node editing functionality
 * @param {string} nodeId - The ID of the node being edited
 * @returns {Object} Node editing methods and state
 */
const useNodeEditor = (nodeId) => {
  const { dialogueTrees, handleNodeUpdate } = useDialogue();
  const node = nodeId ? dialogueTrees[nodeId] : null;

  // State for rename functionality
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [newNodeId, setNewNodeId] = useState(nodeId || "");
  const [renameError, setRenameError] = useState("");

  /**
   * Handle updating a basic node property
   * @param {string} property - The property to update
   * @param {any} value - The new value
   */
  const handleBasicPropertyChange = (property, value) => {
    handleNodeUpdate(nodeId, { [property]: value });
  };

  /**
   * Start the node rename process
   */
  const handleRenameClick = () => {
    setNewNodeId(nodeId);
    setShowRenameInput(true);
    setRenameError("");
  };

  /**
   * Cancel the rename process
   */
  const handleRenameCancel = () => {
    setShowRenameInput(false);
    setRenameError("");
  };

  /**
   * Add a new option to the current node
   */
  const addOption = () => {
    if (!node) return;

    const newOption = {
      id: `option_${Date.now()}`,
      text: "New dialogue option",
      next_node: "",
    };

    handleNodeUpdate(nodeId, {
      options: [...(node.options || []), newOption],
    });
  };

  /**
   * Update an option in the current node
   * @param {number} index - The index of the option to update
   * @param {Object} updatedOption - The updated option data
   */
  const updateOption = (index, updatedOption) => {
    if (!node) return;

    const newOptions = [...(node.options || [])];
    newOptions[index] = {
      ...newOptions[index],
      ...updatedOption,
    };

    handleNodeUpdate(nodeId, { options: newOptions });
  };

  /**
   * Delete an option from the current node
   * @param {number} index - The index of the option to delete
   */
  const deleteOption = (index) => {
    if (!node) return;

    const newOptions = [...(node.options || [])];
    newOptions.splice(index, 1);

    handleNodeUpdate(nodeId, { options: newOptions });
  };

  /**
   * Add an inner voice comment to the current node
   */
  const addInnerVoice = () => {
    if (!node) return;

    const newInnerVoice = {
      voice_type: "Internal",
      text: "New inner voice comment",
      skill_requirement: 5,
    };

    handleNodeUpdate(nodeId, {
      inner_voice_comments: [
        ...(node.inner_voice_comments || []),
        newInnerVoice,
      ],
    });
  };

  /**
   * Update an inner voice comment in the current node
   * @param {number} index - The index of the inner voice comment to update
   * @param {Object} updatedVoice - The updated inner voice comment data
   */
  const updateInnerVoice = (index, updatedVoice) => {
    if (!node) return;

    const newComments = [...(node.inner_voice_comments || [])];
    newComments[index] = {
      ...newComments[index],
      ...updatedVoice,
    };

    handleNodeUpdate(nodeId, { inner_voice_comments: newComments });
  };

  /**
   * Delete an inner voice comment from the current node
   * @param {number} index - The index of the inner voice comment to delete
   */
  const deleteInnerVoice = (index) => {
    if (!node) return;

    const newComments = [...(node.inner_voice_comments || [])];
    newComments.splice(index, 1);

    handleNodeUpdate(nodeId, { inner_voice_comments: newComments });
  };

  return {
    node,
    showRenameInput,
    newNodeId,
    renameError,
    setNewNodeId,
    setRenameError,
    handleBasicPropertyChange,
    handleRenameClick,
    handleRenameCancel,
    addOption,
    updateOption,
    deleteOption,
    addInnerVoice,
    updateInnerVoice,
    deleteInnerVoice,
  };
};

export default useNodeEditor;
