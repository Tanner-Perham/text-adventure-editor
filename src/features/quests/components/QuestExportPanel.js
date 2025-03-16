import React, { useState, useEffect } from "react";
import { useQuest } from "../context/QuestContext";
import useQuestExport from "../hooks/useQuestExport";
import {
  exportQuestsToYAML,
  exportQuestsToJSON,
} from "../../../utils/questExporters";

/**
 * Panel component for exporting quest data
 */
const QuestExportPanel = () => {
  const [exportType, setExportType] = useState("yaml"); // yaml or json
  const [output, setOutput] = useState("");

  const { currentQuest, currentQuestId, quests } = useQuest();
  const {
    exportCurrentQuestToYAML,
    exportCurrentQuestToJSON,
    exportAllQuestsToYAML,
    exportAllQuestsToJSON,
  } = useQuestExport();

  // Generate YAML or JSON output when the component mounts or when needed values change
  useEffect(() => {
    if (currentQuest) {
      updateOutput();
    }
  }, [currentQuest, exportType]);

  // Update the output based on the current export type
  const updateOutput = () => {
    if (exportType === "yaml") {
      // Create a single-quest object for exporting
      const questToExport = {
        [currentQuestId]: currentQuest,
      };
      const yaml = exportQuestsToYAML(questToExport);
      setOutput(yaml);
    } else {
      // JSON export
      const json = JSON.stringify(currentQuest, null, 2);
      setOutput(json);
    }
  };

  // Copy the output to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert(`Quest exported to clipboard as ${exportType.toUpperCase()}`);
  };

  if (!currentQuest) return null;

  return (
    <div className="quest-export-panel">
      <div className="export-header mb-4">
        <h3 className="section-title">Export Quest</h3>
        <div className="export-format-selector">
          <button
            className={`tab-button ${exportType === "yaml" ? "active" : ""}`}
            onClick={() => setExportType("yaml")}
          >
            YAML
          </button>
          <button
            className={`tab-button ${exportType === "json" ? "active" : ""}`}
            onClick={() => setExportType("json")}
          >
            JSON
          </button>
        </div>
      </div>

      <div className="export-content">
        <div className="export-code">
          <pre className="export-pre">{output}</pre>
        </div>

        <div className="export-buttons mt-4">
          <button onClick={copyToClipboard} className="button button-primary">
            Copy to Clipboard
          </button>
          <button
            onClick={
              exportType === "yaml"
                ? exportAllQuestsToYAML
                : exportAllQuestsToJSON
            }
            className="button button-outline ml-2"
          >
            Export All Quests
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestExportPanel;
