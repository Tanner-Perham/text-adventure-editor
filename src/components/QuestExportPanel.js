import React, { useState, useEffect } from "react";

const QuestExportPanel = ({ quest, onExport }) => {
  const [yamlOutput, setYamlOutput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [exportType, setExportType] = useState("yaml"); // yaml or json

  // Generate YAML and JSON outputs when quest changes
  useEffect(() => {
    if (quest) {
      // Generate formatted JSON
      setJsonOutput(JSON.stringify(quest, null, 2));

      // Generate YAML
      const yaml = generateYAML(quest);
      setYamlOutput(yaml);
    }
  }, [quest]);

  // Helper function to generate YAML representation
  const generateYAML = (quest) => {
    if (!quest) return "";

    let yaml = "";

    // Add quest basic info
    yaml += `---\n`;
    yaml += `id: "${quest.id}"\n`;
    yaml += `title: "${quest.title || ""}"\n`;
    yaml += `description: "${(quest.description || "").replace(/"/g, '\\"')}"\n`;
    yaml += `short_description: "${(quest.short_description || "").replace(/"/g, '\\"')}"\n`;
    yaml += `importance: "${quest.importance || "Side"}"\n`;
    yaml += `is_hidden: ${quest.is_hidden || false}\n`;
    yaml += `is_main_quest: ${quest.is_main_quest || false}\n`;

    // Add related NPCs
    if (quest.related_npcs && quest.related_npcs.length > 0) {
      yaml += `related_npcs:\n`;
      quest.related_npcs.forEach((npc) => {
        yaml += `  - "${npc}"\n`;
      });
    } else {
      yaml += `related_npcs: []\n`;
    }

    // Add related locations
    if (quest.related_locations && quest.related_locations.length > 0) {
      yaml += `related_locations:\n`;
      quest.related_locations.forEach((location) => {
        yaml += `  - "${location}"\n`;
      });
    } else {
      yaml += `related_locations: []\n`;
    }

    // Add stages
    yaml += `stages:\n`;
    if (quest.stages && quest.stages.length > 0) {
      quest.stages.forEach((stage) => {
        yaml += `  - id: "${stage.id}"\n`;
        yaml += `    description: "${(stage.description || "").replace(/"/g, '\\"')}"\n`;
        yaml += `    notification_text: "${(stage.notification_text || "").replace(/"/g, '\\"')}"\n`;
        yaml += `    status: "${stage.status || "NotStarted"}"\n`;

        // Add objectives
        yaml += `    objectives:\n`;
        if (stage.objectives && stage.objectives.length > 0) {
          stage.objectives.forEach((objective) => {
            yaml += `      - id: "${objective.id}"\n`;
            yaml += `        description: "${(objective.description || "").replace(/"/g, '\\"')}"\n`;

            // Add required clues
            if (
              objective.required_clues &&
              objective.required_clues.length > 0
            ) {
              yaml += `        required_clues:\n`;
              objective.required_clues.forEach((clue) => {
                yaml += `          - "${clue}"\n`;
              });
            } else {
              yaml += `        required_clues: []\n`;
            }

            // Add required items
            if (
              objective.required_items &&
              objective.required_items.length > 0
            ) {
              yaml += `        required_items:\n`;
              objective.required_items.forEach((item) => {
                yaml += `          - "${item}"\n`;
              });
            } else {
              yaml += `        required_items: []\n`;
            }

            // Add required location and NPC interaction
            yaml += `        required_location: ${objective.required_location ? `"${objective.required_location}"` : "null"}\n`;
            yaml += `        required_npc_interaction: ${objective.required_npc_interaction ? `"${objective.required_npc_interaction}"` : "null"}\n`;
            yaml += `        is_completed: ${objective.is_completed || false}\n`;
            yaml += `        is_optional: ${objective.is_optional || false}\n`;

            // Add completion events
            yaml += `        completion_events:\n`;
            if (
              objective.completion_events &&
              objective.completion_events.length > 0
            ) {
              objective.completion_events.forEach((event) => {
                yaml += `          - event_type: "${event.event_type}"\n`;
                yaml += `            data: ${formatYAMLData(event.data)}\n`;
              });
            }
          });
        }

        // Add completion events
        yaml += `    completion_events:\n`;
        if (stage.completion_events && stage.completion_events.length > 0) {
          stage.completion_events.forEach((event) => {
            yaml += `      - event_type: "${event.event_type}"\n`;
            yaml += `        data: ${formatYAMLData(event.data)}\n`;
          });
        }

        // Add next stages
        yaml += `    next_stages:\n`;
        if (stage.next_stages && stage.next_stages.length > 0) {
          stage.next_stages.forEach((nextStage) => {
            yaml += `      - stage_id: "${nextStage.stage_id}"\n`;

            if (nextStage.condition) {
              yaml += `        condition:\n`;
              yaml += `          condition_type: "${nextStage.condition.condition_type}"\n`;
              yaml += `          target_id: "${nextStage.condition.target_id || ""}"\n`;
              yaml += `          value: ${nextStage.condition.value !== null ? nextStage.condition.value : "null"}\n`;
            } else {
              yaml += `        condition: null\n`;
            }

            yaml += `        choice_description: ${nextStage.choice_description ? `"${nextStage.choice_description.replace(/"/g, '\\"')}"` : "null"}\n`;
          });
        }
      });
    }

    // Add rewards
    yaml += `rewards:\n`;
    if (quest.rewards) {
      // Add item rewards
      yaml += `  items:\n`;
      if (quest.rewards.items && quest.rewards.items.length > 0) {
        quest.rewards.items.forEach((item) => {
          yaml += `    - id: "${item.id}"\n`;
          yaml += `      name: "${item.name || item.id}"\n`;
          yaml += `      description: "${(item.description || "").replace(/"/g, '\\"')}"\n`;
          yaml += `      effects: {}\n`; // Simplified effects
        });
      }

      // Add skill rewards
      yaml += `  skill_rewards:\n`;
      if (
        quest.rewards.skill_rewards &&
        Object.keys(quest.rewards.skill_rewards).length > 0
      ) {
        Object.entries(quest.rewards.skill_rewards).forEach(
          ([skill, value]) => {
            yaml += `    ${skill}: ${value}\n`;
          },
        );
      }

      // Add relationship changes
      yaml += `  relationship_changes:\n`;
      if (
        quest.rewards.relationship_changes &&
        Object.keys(quest.rewards.relationship_changes).length > 0
      ) {
        Object.entries(quest.rewards.relationship_changes).forEach(
          ([npc, value]) => {
            yaml += `    ${npc}: ${value}\n`;
          },
        );
      }

      // Add experience
      yaml += `  experience: ${quest.rewards.experience || 0}\n`;

      // Add unlocked locations
      yaml += `  unlocked_locations: ${formatYAMLArray(quest.rewards.unlocked_locations || [])}\n`;

      // Add unlocked dialogues
      yaml += `  unlocked_dialogues: ${formatYAMLArray(quest.rewards.unlocked_dialogues || [])}\n`;
    }

    return yaml;
  };

  // Helper function to format YAML data
  const formatYAMLData = (data) => {
    if (data === null) return "null";
    if (typeof data === "string") return `"${data.replace(/"/g, '\\"')}"`;
    if (typeof data === "number") return data;
    if (typeof data === "boolean") return data;
    if (Array.isArray(data)) return formatYAMLArray(data);
    if (typeof data === "object") return formatYAMLObject(data);
    return `"${data}"`;
  };

  // Helper function to format YAML arrays
  const formatYAMLArray = (arr) => {
    if (!arr || arr.length === 0) return "[]";

    return `[${arr
      .map((item) => {
        if (typeof item === "string") return `"${item.replace(/"/g, '\\"')}"`;
        return item;
      })
      .join(", ")}]`;
  };

  // Helper function to format YAML objects
  const formatYAMLObject = (obj) => {
    if (!obj || Object.keys(obj).length === 0) return "{}";

    const objStr = JSON.stringify(obj).replace(/"/g, '\\"');
    return `"${objStr}"`;
  };

  const copyToClipboard = () => {
    const textToCopy = exportType === "yaml" ? yamlOutput : jsonOutput;
    navigator.clipboard.writeText(textToCopy);
    alert(`Quest exported to clipboard as ${exportType.toUpperCase()}`);
  };

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
          <pre className="export-pre">
            {exportType === "yaml" ? yamlOutput : jsonOutput}
          </pre>
        </div>

        <div className="export-buttons mt-4">
          <button onClick={copyToClipboard} className="button button-primary">
            Copy to Clipboard
          </button>
          <button onClick={onExport} className="button button-outline ml-2">
            Export All Quests
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestExportPanel;
