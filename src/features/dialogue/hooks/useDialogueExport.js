import { useCallback } from "react";
import { useDialogue } from "../context/DialogueContext";
import { exportToYAML, exportToJSON } from "../../../utils/exporters";
import {
  exportQuestsToYAML,
  exportQuestsToJSON,
} from "../../../utils/questExporters";
import { importFromYAML } from "../../../utils/yamlImporter";

/**
 * Custom hook for dialogue and quest export/import functionality
 * @returns {Object} Export/import methods
 */
const useDialogueExport = () => {
  const {
    dialogueTrees,
    quests,
    setDialogueTrees,
    setQuests,
    setCurrentNode,
    setYamlOutput,
    setJsonOutput,
    setQuestsYamlOutput,
    setQuestsJsonOutput,
    setTabView,
  } = useDialogue();

  /**
   * Export dialogue trees to YAML
   */
  const handleExportYAML = useCallback(() => {
    const yaml = exportToYAML(dialogueTrees);
    setYamlOutput(yaml);
    setTabView("yaml");
  }, [dialogueTrees, setYamlOutput, setTabView]);

  /**
   * Export dialogue trees to JSON
   */
  const handleExportJSON = useCallback(() => {
    const json = exportToJSON(dialogueTrees);
    setJsonOutput(json);
    setTabView("json");
  }, [dialogueTrees, setJsonOutput, setTabView]);

  /**
   * Import dialogue trees from JSON file
   * @param {Event} event - The file input change event
   */
  const importFromJSON = useCallback(
    (event) => {
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
    },
    [setDialogueTrees, setCurrentNode],
  );

  /**
   * Import dialogue trees from YAML file
   * @param {Event} event - The file input change event
   */
  const handleImportYAML = useCallback(
    (event) => {
      if (!event.target.files || !event.target.files[0]) return;

      const file = event.target.files[0];
      if (!file) return;

      try {
        // Use the imported function directly
        importFromYAML(file)
          .then((parsedData) => {
            setDialogueTrees(parsedData);
            alert("YAML dialogue tree imported successfully!");

            // Set current node to first node in the tree
            if (Object.keys(parsedData).length > 0) {
              setCurrentNode(Object.keys(parsedData)[0]);
            }
          })
          .catch((error) => {
            alert(error.message);
          });
      } catch (error) {
        alert("Error importing YAML file: " + error.message);
      }
    },
    [setDialogueTrees, setCurrentNode],
  );

  /**
   * Export quests to YAML
   */
  const handleExportQuestsYAML = useCallback(() => {
    const yaml = exportQuestsToYAML(quests);
    setQuestsYamlOutput(yaml);
    setTabView("quests-yaml");
  }, [quests, setQuestsYamlOutput, setTabView]);

  /**
   * Export quests to JSON
   */
  const handleExportQuestsJSON = useCallback(() => {
    const json = exportQuestsToJSON(quests);
    setQuestsJsonOutput(json);
    setTabView("quests-json");
  }, [quests, setQuestsJsonOutput, setTabView]);

  /**
   * Import quests from JSON file
   * @param {Event} event - The file input change event
   */
  const importQuestsFromJSON = useCallback(
    (event) => {
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
    },
    [setQuests],
  );

  return {
    handleExportYAML,
    handleExportJSON,
    importFromJSON,
    handleImportYAML,
    handleExportQuestsYAML,
    handleExportQuestsJSON,
    importQuestsFromJSON,
  };
};

export default useDialogueExport;
