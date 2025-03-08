import * as yaml from "js-yaml";

/**
 * Validates that imported dialogue tree nodes have required properties
 * @param {Object} nodes - The dialogue tree nodes object
 * @returns {Object} - Object with validation result and error message
 */
const validateDialogueTree = (nodes) => {
  if (!nodes || typeof nodes !== "object" || Array.isArray(nodes)) {
    return {
      valid: false,
      error: "Imported YAML must contain a valid dialogue tree object",
    };
  }

  // Check if nodes object is empty
  if (Object.keys(nodes).length === 0) {
    return {
      valid: false,
      error: "Imported dialogue tree cannot be empty",
    };
  }

  // Validate each node
  for (const [nodeId, node] of Object.entries(nodes)) {
    // Check required fields
    if (!node.id) {
      return {
        valid: false,
        error: `Node "${nodeId}" is missing an id property`,
      };
    }

    if (!node.text && node.text !== "") {
      return {
        valid: false,
        error: `Node "${nodeId}" is missing a text property`,
      };
    }

    // Ensure options are valid if present
    if (node.options && !Array.isArray(node.options)) {
      return {
        valid: false,
        error: `Node "${nodeId}" has invalid options (must be an array)`,
      };
    }

    // Validate each option if present
    if (node.options && Array.isArray(node.options)) {
      for (let i = 0; i < node.options.length; i++) {
        const option = node.options[i];
        if (!option.id) {
          return {
            valid: false,
            error: `Option #${i + 1} in node "${nodeId}" is missing an id property`,
          };
        }
        if (!option.text && option.text !== "") {
          return {
            valid: false,
            error: `Option #${i + 1} in node "${nodeId}" is missing a text property`,
          };
        }

        // Check if option has a skill check but no success_node or failure_node
        if (
          option.skill_check &&
          !(option.success_node || option.failure_node)
        ) {
          // This is just a warning, not an error that stops import
          console.warn(
            `Warning: Option #${i + 1} in node "${nodeId}" has a skill check but no success_node or failure_node defined.`,
          );
        }

        // Check if success_node or failure_node is defined but skill_check is not
        if (
          (option.success_node || option.failure_node) &&
          !option.skill_check
        ) {
          console.warn(
            `Warning: Option #${i + 1} in node "${nodeId}" has success_node or failure_node defined but no skill_check.`,
          );
        }
      }
    }

    // Validate inner voice comments if present
    if (
      node.inner_voice_comments &&
      !Array.isArray(node.inner_voice_comments)
    ) {
      return {
        valid: false,
        error: `Node "${nodeId}" has invalid inner_voice_comments (must be an array)`,
      };
    }
  }

  return { valid: true };
};

/**
 * Parses YAML content and converts it to dialogue tree data
 * @param {string} yamlContent - YAML content string
 * @returns {Object} - Object with parsed data or error
 */
const parseYAML = (yamlContent) => {
  try {
    // Parse YAML content to JavaScript object
    const parsed = yaml.load(yamlContent);

    // Check if dialogue_trees key exists
    let dialogueTrees = parsed;
    if (parsed.dialogue_trees) {
      dialogueTrees = parsed.dialogue_trees;
    }

    // Validate the parsed data
    const validation = validateDialogueTree(dialogueTrees);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    return {
      success: true,
      data: dialogueTrees,
    };
  } catch (error) {
    return {
      success: false,
      error: `YAML parsing error: ${error.message}`,
    };
  }
};

/**
 * Imports dialogue tree from YAML file
 * @param {File} file - YAML file to import
 * @returns {Promise} - Promise resolving to parsed data or error
 */
const importFromYAML = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      try {
        const result = parseYAML(e.target.result);
        if (result.success) {
          resolve(result.data);
        } else {
          reject(new Error(result.error));
        }
      } catch (error) {
        reject(new Error(`Error importing YAML: ${error.message}`));
      }
    };

    fileReader.onerror = () => {
      reject(new Error("Failed to read the file"));
    };

    fileReader.readAsText(file, "UTF-8");
  });
};

// Export functions individually and as default object
export { parseYAML, importFromYAML, validateDialogueTree };

export default {
  parseYAML,
  importFromYAML,
  validateDialogueTree,
};
