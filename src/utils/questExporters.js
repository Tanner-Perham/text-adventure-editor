/**
 * Export quests to YAML format
 * @param {Object} quests - The quests data
 * @returns {string} - YAML string representation
 */
export const exportQuestsToYAML = (quests) => {
  let yaml = "quests:\n";

  Object.entries(quests).forEach(([id, quest]) => {
    yaml += `  ${id}:\n`;
    yaml += `    id: "${quest.id}"\n`;
    yaml += `    title: "${quest.title?.replace(/"/g, '\\"') || ""}"\n`;
    yaml += `    description: "${quest.description?.replace(/"/g, '\\"') || ""}"\n`;
    yaml += `    short_description: "${quest.short_description?.replace(/"/g, '\\"') || ""}"\n`;
    yaml += `    importance: "${quest.importance || "Side"}"\n`;
    yaml += `    is_hidden: ${quest.is_hidden || false}\n`;
    yaml += `    is_main_quest: ${quest.is_main_quest || false}\n`;

    // Add related NPCs
    if (quest.related_npcs && quest.related_npcs.length > 0) {
      yaml += `    related_npcs:\n`;
      quest.related_npcs.forEach((npc) => {
        yaml += `      - "${npc}"\n`;
      });
    } else {
      yaml += `    related_npcs: []\n`;
    }

    // Add related locations
    if (quest.related_locations && quest.related_locations.length > 0) {
      yaml += `    related_locations:\n`;
      quest.related_locations.forEach((location) => {
        yaml += `      - "${location}"\n`;
      });
    } else {
      yaml += `    related_locations: []\n`;
    }

    // Add stages
    yaml += `    stages:\n`;
    if (quest.stages && quest.stages.length > 0) {
      quest.stages.forEach((stage) => {
        yaml += `      - id: "${stage.id}"\n`;
        yaml += `        description: "${stage.description?.replace(/"/g, '\\"') || ""}"\n`;
        yaml += `        notification_text: "${stage.notification_text?.replace(/"/g, '\\"') || ""}"\n`;
        yaml += `        status: "${stage.status || "NotStarted"}"\n`;

        // Add objectives
        if (stage.objectives && stage.objectives.length > 0) {
          yaml += `        objectives:\n`;
          stage.objectives.forEach((objective) => {
            yaml += `          - id: "${objective.id}"\n`;
            yaml += `            description: "${objective.description?.replace(/"/g, '\\"') || ""}"\n`;

            // Add required clues
            if (
              objective.required_clues &&
              objective.required_clues.length > 0
            ) {
              yaml += `            required_clues:\n`;
              objective.required_clues.forEach((clue) => {
                yaml += `              - "${clue}"\n`;
              });
            } else {
              yaml += `            required_clues: []\n`;
            }

            // Add required items
            if (
              objective.required_items &&
              objective.required_items.length > 0
            ) {
              yaml += `            required_items:\n`;
              objective.required_items.forEach((item) => {
                yaml += `              - "${item}"\n`;
              });
            } else {
              yaml += `            required_items: []\n`;
            }

            // Add required location
            if (objective.required_location) {
              yaml += `            required_location: "${objective.required_location}"\n`;
            } else {
              yaml += `            required_location: null\n`;
            }

            // Add required NPC interaction
            if (objective.required_npc_interaction) {
              yaml += `            required_npc_interaction: "${objective.required_npc_interaction}"\n`;
            } else {
              yaml += `            required_npc_interaction: null\n`;
            }

            yaml += `            is_completed: ${objective.is_completed || false}\n`;
            yaml += `            is_optional: ${objective.is_optional || false}\n`;

            // Add completion events
            if (
              objective.completion_events &&
              objective.completion_events.length > 0
            ) {
              yaml += `            completion_events:\n`;
              objective.completion_events.forEach((event) => {
                yaml += `              - event_type: "${event.event_type}"\n`;
                yaml += `                data: ${formatEventData(event.data)}\n`;
              });
            } else {
              yaml += `            completion_events: []\n`;
            }
          });
        } else {
          yaml += `        objectives: []\n`;
        }

        // Add completion events
        if (stage.completion_events && stage.completion_events.length > 0) {
          yaml += `        completion_events:\n`;
          stage.completion_events.forEach((event) => {
            yaml += `          - event_type: "${event.event_type}"\n`;
            yaml += `            data: ${formatEventData(event.data)}\n`;
          });
        } else {
          yaml += `        completion_events: []\n`;
        }

        // Add next stages
        if (stage.next_stages && stage.next_stages.length > 0) {
          yaml += `        next_stages:\n`;
          stage.next_stages.forEach((nextStage) => {
            yaml += `          - stage_id: "${nextStage.stage_id}"\n`;

            if (nextStage.condition) {
              yaml += `            condition:\n`;
              yaml += `              condition_type: "${nextStage.condition.condition_type}"\n`;
              yaml += `              target_id: "${nextStage.condition.target_id || ""}"\n`;

              if (
                nextStage.condition.value !== null &&
                nextStage.condition.value !== undefined
              ) {
                yaml += `              value: ${nextStage.condition.value}\n`;
              } else {
                yaml += `              value: null\n`;
              }
            } else {
              yaml += `            condition: null\n`;
            }

            if (nextStage.choice_description) {
              yaml += `            choice_description: "${nextStage.choice_description.replace(/"/g, '\\"')}"\n`;
            } else {
              yaml += `            choice_description: null\n`;
            }
          });
        } else {
          yaml += `        next_stages: []\n`;
        }
      });
    }

    // Add rewards
    yaml += `    rewards:\n`;
    if (quest.rewards) {
      // Add item rewards
      if (quest.rewards.items && quest.rewards.items.length > 0) {
        yaml += `      items:\n`;
        quest.rewards.items.forEach((item) => {
          yaml += `        - id: "${item.id}"\n`;
          yaml += `          name: "${item.name || item.id}"\n`;
          yaml += `          description: "${(item.description || "").replace(/"/g, '\\"')}"\n`;

          // Add effects
          yaml += `          effects: `;
          if (item.effects && Object.keys(item.effects).length > 0) {
            yaml += `\n`;
            Object.entries(item.effects).forEach(([key, value]) => {
              yaml += `            ${key}: ${value}\n`;
            });
          } else {
            yaml += `{}\n`;
          }
        });
      } else {
        yaml += `      items: []\n`;
      }

      // Add skill rewards
      if (
        quest.rewards.skill_rewards &&
        Object.keys(quest.rewards.skill_rewards).length > 0
      ) {
        yaml += `      skill_rewards:\n`;
        Object.entries(quest.rewards.skill_rewards).forEach(
          ([skill, value]) => {
            yaml += `        ${skill}: ${value}\n`;
          },
        );
      } else {
        yaml += `      skill_rewards: {}\n`;
      }

      // Add relationship changes
      if (
        quest.rewards.relationship_changes &&
        Object.keys(quest.rewards.relationship_changes).length > 0
      ) {
        yaml += `      relationship_changes:\n`;
        Object.entries(quest.rewards.relationship_changes).forEach(
          ([npc, value]) => {
            yaml += `        ${npc}: ${value}\n`;
          },
        );
      } else {
        yaml += `      relationship_changes: {}\n`;
      }

      // Add experience
      yaml += `      experience: ${quest.rewards.experience || 0}\n`;

      // Add unlocked locations
      if (
        quest.rewards.unlocked_locations &&
        quest.rewards.unlocked_locations.length > 0
      ) {
        yaml += `      unlocked_locations:\n`;
        quest.rewards.unlocked_locations.forEach((location) => {
          yaml += `        - "${location}"\n`;
        });
      } else {
        yaml += `      unlocked_locations: []\n`;
      }

      // Add unlocked dialogues
      if (
        quest.rewards.unlocked_dialogues &&
        quest.rewards.unlocked_dialogues.length > 0
      ) {
        yaml += `      unlocked_dialogues:\n`;
        quest.rewards.unlocked_dialogues.forEach((dialogue) => {
          yaml += `        - "${dialogue}"\n`;
        });
      } else {
        yaml += `      unlocked_dialogues: []\n`;
      }
    } else {
      yaml += `      items: []\n`;
      yaml += `      skill_rewards: {}\n`;
      yaml += `      relationship_changes: {}\n`;
      yaml += `      experience: 0\n`;
      yaml += `      unlocked_locations: []\n`;
      yaml += `      unlocked_dialogues: []\n`;
    }
  });

  return yaml;
};

/**
 * Export quests to JSON format
 * @param {Object} quests - The quests data
 * @returns {string} - JSON string representation
 */
export const exportQuestsToJSON = (quests) => {
  return JSON.stringify(quests, null, 2);
};

/**
 * Helper function to format event data for YAML
 * @param {any} data - The event data to format
 * @returns {string} - Formatted YAML string
 */
const formatEventData = (data) => {
  if (data === null || data === undefined) return "null";

  if (typeof data === "string") {
    return `"${data.replace(/"/g, '\\"')}"`;
  }

  if (typeof data === "number" || typeof data === "boolean") {
    return data.toString();
  }

  if (Array.isArray(data)) {
    // Handle array of strings
    if (data.every((item) => typeof item === "string")) {
      const items = data
        .map((item) => `"${item.replace(/"/g, '\\"')}"`)
        .join(", ");
      return `[${items}]`;
    }

    // Handle array with non-string elements
    return JSON.stringify(data).replace(/"/g, '\\"');
  }

  if (typeof data === "object") {
    // Handle simple key-value object with string values
    if (
      Object.values(data).every(
        (val) =>
          val === null ||
          typeof val === "string" ||
          typeof val === "number" ||
          typeof val === "boolean",
      )
    ) {
      let result = "{\n";
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === "string") {
          result += `              ${key}: "${value.replace(/"/g, '\\"')}"\n`;
        } else {
          result += `              ${key}: ${value}\n`;
        }
      });
      result += "            }";
      return result;
    }

    // For complex objects, use JSON
    return JSON.stringify(data).replace(/"/g, '\\"');
  }

  return `"${String(data).replace(/"/g, '\\"')}"`;
};
