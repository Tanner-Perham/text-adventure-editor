import { useCallback } from "react";
import { useQuest } from "../context/QuestContext";
import {
  exportQuestsToYAML,
  exportQuestsToJSON,
} from "../../../utils/questExporters";

/**
 * Custom hook for quest export functionality
 * @returns {Object} Export methods and state
 */
const useQuestExport = () => {
  const {
    quests,
    currentQuestId,
    setQuestsYamlOutput,
    setQuestsJsonOutput,
    setViewMode,
  } = useQuest();

  /**
   * Export all quests to YAML
   */
  const exportAllQuestsToYAML = useCallback(() => {
    const yaml = exportQuestsToYAML(quests);
    setQuestsYamlOutput(yaml);
    setViewMode("quests-yaml");
  }, [quests, setQuestsYamlOutput, setViewMode]);

  /**
   * Export all quests to JSON
   */
  const exportAllQuestsToJSON = useCallback(() => {
    const json = exportQuestsToJSON(quests);
    setQuestsJsonOutput(json);
    setViewMode("quests-json");
  }, [quests, setQuestsJsonOutput, setViewMode]);

  /**
   * Export current quest to YAML
   */
  const exportCurrentQuestToYAML = useCallback(() => {
    if (!currentQuestId) return;

    const questToExport = {
      [currentQuestId]: quests[currentQuestId],
    };

    const yaml = exportQuestsToYAML(questToExport);
    setQuestsYamlOutput(yaml);
    setViewMode("quests-yaml");
  }, [currentQuestId, quests, setQuestsYamlOutput, setViewMode]);

  /**
   * Export current quest to JSON
   */
  const exportCurrentQuestToJSON = useCallback(() => {
    if (!currentQuestId) return;

    const questToExport = {
      [currentQuestId]: quests[currentQuestId],
    };

    const json = exportQuestsToJSON(questToExport);
    setQuestsJsonOutput(json);
    setViewMode("quests-json");
  }, [currentQuestId, quests, setQuestsJsonOutput, setViewMode]);

  /**
   * Import quests from JSON
   * @param {Event} event - The file input change event
   * @param {Function} setQuests - Function to update quests
   */
  const importQuestsFromJSON = useCallback((event, setQuests) => {
    if (!event.target.files || !event.target.files[0]) return;

    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        setQuests(parsed);
        alert("Quests imported successfully!");
      } catch (error) {
        alert("Error importing file: " + error.message);
      }
    };
  }, []);

  return {
    exportAllQuestsToYAML,
    exportAllQuestsToJSON,
    exportCurrentQuestToYAML,
    exportCurrentQuestToJSON,
    importQuestsFromJSON,
  };
};

export default useQuestExport;
