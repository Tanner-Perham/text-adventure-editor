/**
 * Export dialogue trees to YAML format
 * @param {Object} dialogueTrees - The dialogue trees data
 * @returns {string} - YAML string representation
 */
export const exportToYAML = (dialogueTrees) => {
  let yaml = "dialogue_trees:\n";

  Object.entries(dialogueTrees).forEach(([id, node]) => {
    yaml += `  ${id}:\n`;
    yaml += `    id: "${node.id}"\n`;
    yaml += `    text: "${node.text?.replace(/"/g, '\\"')}"\n`;
    yaml += `    speaker: "${node.speaker || ""}"\n`;
    yaml += `    emotional_state: "${node.emotional_state || "Neutral"}"\n`;

    if (node.inner_voice_comments && node.inner_voice_comments.length > 0) {
      yaml += `    inner_voice_comments:\n`;
      node.inner_voice_comments.forEach((comment) => {
        yaml += `      - voice_type: "${comment.voice_type}"\n`;
        yaml += `        text: "${comment.text?.replace(/"/g, '\\"')}"\n`;
        yaml += `        skill_requirement: ${comment.skill_requirement}\n`;
      });
    }

    if (node.options && node.options.length > 0) {
      yaml += `    options:\n`;
      node.options.forEach((option) => {
        yaml += `      - id: "${option.id}"\n`;
        yaml += `        text: "${option.text?.replace(/"/g, '\\"')}"\n`;

        // Only include next_node if there's no skill check
        if (option.next_node && !option.skill_check) {
          yaml += `        next_node: "${option.next_node}"\n`;
        }

        if (option.skill_check) {
          yaml += `        skill_check:\n`;
          yaml += `          base_difficulty: ${option.skill_check.base_difficulty}\n`;
          yaml += `          primary_skill: "${option.skill_check.primary_skill}"\n`;

          if (
            option.skill_check.supporting_skills &&
            option.skill_check.supporting_skills.length > 0
          ) {
            yaml += `          supporting_skills:\n`;
            option.skill_check.supporting_skills.forEach((skill) => {
              yaml += `            - ["${skill[0]}", ${skill[1]}]\n`;
            });
          }

          if (option.skill_check.emotional_modifiers) {
            yaml += `          emotional_modifiers:\n`;
            Object.entries(option.skill_check.emotional_modifiers).forEach(
              ([emotion, modifier]) => {
                yaml += `            ${emotion}: ${modifier}\n`;
              },
            );
          }

          yaml += `          white_check: ${option.skill_check.white_check}\n`;
          yaml += `          hidden: ${option.skill_check.hidden}\n`;

          // Add success_node and failure_node if they exist with skill check
          if (option.success_node) {
            yaml += `        success_node: "${option.success_node}"\n`;
          }

          if (option.failure_node) {
            yaml += `        failure_node: "${option.failure_node}"\n`;
          }
        }

        if (option.emotional_impact) {
          yaml += `        emotional_impact:\n`;
          Object.entries(option.emotional_impact).forEach(
            ([emotion, impact]) => {
              yaml += `          ${emotion}: ${impact}\n`;
            },
          );
        }

        if (option.conditions) {
          yaml += `        conditions:\n`;

          if (
            option.conditions.required_items &&
            option.conditions.required_items.length > 0
          ) {
            yaml += `          required_items: [${option.conditions.required_items.map((item) => `"${item}"`).join(", ")}]\n`;
          }

          if (option.conditions.required_skills) {
            yaml += `          required_skills:\n`;
            Object.entries(option.conditions.required_skills).forEach(
              ([skill, level]) => {
                yaml += `            ${skill}: ${level}\n`;
              },
            );
          }
        }

        if (option.consequences && option.consequences.length > 0) {
          yaml += `        consequences:\n`;
          option.consequences.forEach((consequence) => {
            yaml += `          - event_type: "${consequence.event_type}"\n`;
            if (Array.isArray(consequence.data)) {
              yaml += `            data: [${consequence.data.map((item) => (typeof item === "string" ? `"${item}"` : item)).join(", ")}]\n`;
            } else {
              yaml += `            data: "${consequence.data}"\n`;
            }
          });
        }
      });
    }
  });

  return yaml;
};

/**
 * Export dialogue trees to JSON format
 * @param {Object} dialogueTrees - The dialogue trees data
 * @returns {string} - JSON string representation
 */
export const exportToJSON = (dialogueTrees) => {
  return JSON.stringify(dialogueTrees, null, 2);
};
