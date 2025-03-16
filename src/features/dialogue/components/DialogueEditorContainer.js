import React from "react";
import { DialogueProvider } from "../context/DialogueContext";
import DialogueHeader from "./DialogueHeader";
import DialogueEditorLayout from "./DialogueEditorLayout";

/**
 * Main container component for the Dialogue Editor
 * Wraps everything in the DialogueProvider context
 */
const DialogueEditorContainer = () => {
  return (
    <DialogueProvider>
      <div className="dialogue-editor-container">
        <DialogueHeader />
        <DialogueEditorLayout />
      </div>
    </DialogueProvider>
  );
};

export default DialogueEditorContainer;
