import React, { useState, useEffect } from "react";

const NodeList = ({
  nodes,
  currentNode,
  onSelectNode,
  onAddNode,
  onDeleteNode,
  searchTerm,
  onSearchChange,
  onExportJSON,
  onImportJSON,
  onImportYAML,
  quests, // New prop for quest data
}) => {
  const [questFilter, setQuestFilter] = useState("all"); // "all" or specific quest ID
  const [questRelatedNodes, setQuestRelatedNodes] = useState({});

  // Find nodes that are related to quests
  useEffect(() => {
    if (!quests || Object.keys(quests).length === 0) {
      setQuestRelatedNodes({});
      return;
    }

    const relatedNodes = {};

    // Examine all nodes and their options for quest-related effects
    Object.entries(nodes).forEach(([nodeId, node]) => {
      if (node.options) {
        node.options.forEach((option, optionIndex) => {
          if (option.consequences) {
            option.consequences.forEach((effect) => {
              // Check all quest-related effect types
              const questId = getQuestIdFromEffect(effect);
              if (questId) {
                if (!relatedNodes[nodeId]) {
                  relatedNodes[nodeId] = {
                    questIds: new Set(),
                    options: {},
                  };
                }
                relatedNodes[nodeId].questIds.add(questId);

                if (!relatedNodes[nodeId].options[optionIndex]) {
                  relatedNodes[nodeId].options[optionIndex] = new Set();
                }
                relatedNodes[nodeId].options[optionIndex].add(questId);
              }
            });
          }
        });
      }
    });

    // Convert Sets to Arrays for easier use in rendering
    const processedNodes = {};
    Object.entries(relatedNodes).forEach(([nodeId, data]) => {
      processedNodes[nodeId] = {
        questIds: Array.from(data.questIds),
        options: Object.entries(data.options).reduce(
          (acc, [optIdx, questSet]) => {
            acc[optIdx] = Array.from(questSet);
            return acc;
          },
          {},
        ),
      };
    });

    setQuestRelatedNodes(processedNodes);
  }, [nodes, quests]);

  // Helper function to extract quest ID from a dialogue effect
  const getQuestIdFromEffect = (effect) => {
    if (!effect || !effect.event_type) return null;

    switch (effect.event_type) {
      case "StartQuest":
        return typeof effect.data === "string" ? effect.data : null;
      case "AdvanceQuest":
      case "CompleteQuestObjective":
      case "UnlockQuestBranch":
        return Array.isArray(effect.data) && effect.data.length > 0
          ? effect.data[0]
          : null;
      case "FailQuest":
        return typeof effect.data === "string" ? effect.data : null;
      case "AddQuestItem":
        return effect.data?.quest_id || null;
      case "RevealClue":
        return effect.data?.related_quest || null;
      default:
        return null;
    }
  };

  // Filter nodes based on search term and quest filter
  const filteredNodes = Object.entries(nodes)
    .filter(([id, node]) => {
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          id.toLowerCase().includes(searchLower) ||
          node.text.toLowerCase().includes(searchLower) ||
          node.speaker.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Filter by quest ID
      if (questFilter !== "all") {
        const isRelatedToQuest =
          questRelatedNodes[id] &&
          questRelatedNodes[id].questIds.includes(questFilter);

        if (!isRelatedToQuest) return false;
      }

      return true;
    })
    .sort(([idA], [idB]) => idA.localeCompare(idB));

  // Check if node is related to any quest
  const isQuestRelatedNode = (nodeId) => {
    return (
      questRelatedNodes[nodeId] && questRelatedNodes[nodeId].questIds.length > 0
    );
  };

  // Get the quest titles for a node for tooltips
  const getQuestTitles = (nodeId) => {
    if (!questRelatedNodes[nodeId]) return "";

    return questRelatedNodes[nodeId].questIds
      .map((questId) => quests[questId]?.title || questId)
      .join(", ");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <button
            onClick={onExportJSON}
            className="button button-outline button-sm"
            title="Export to JSON"
          >
            Export
          </button>
        </div>
      </div>

      {/* Import buttons */}
      <div className="flex gap-2 mb-4">
        <label className="button button-outline button-sm cursor-pointer flex-1 text-center">
          Import JSON
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={onImportJSON}
          />
        </label>
        <label className="button button-outline button-sm cursor-pointer flex-1 text-center">
          Import YAML
          <input
            type="file"
            accept=".yaml,.yml"
            className="hidden"
            onChange={onImportYAML}
          />
        </label>
      </div>

      {/* Search and quest filter */}
      <div className="search-box">
        <span className="search-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Quest filter dropdown */}
      {quests && Object.keys(quests).length > 0 && (
        <div className="quest-filter mt-2 mb-4">
          <select
            className="select-field w-full text-sm"
            value={questFilter}
            onChange={(e) => setQuestFilter(e.target.value)}
          >
            <option value="all">All Nodes</option>
            <option disabled>── Quests ──</option>
            {Object.entries(quests).map(([questId, quest]) => (
              <option key={questId} value={questId}>
                {quest.title} ({questId})
              </option>
            ))}
          </select>
        </div>
      )}

      <button onClick={onAddNode} className="button button-primary w-full mb-4">
        + Add New Node
      </button>

      <div className="node-list">
        {filteredNodes.length === 0 ? (
          <p className="text-center text-light">No nodes found</p>
        ) : (
          filteredNodes.map(([id, node]) => (
            <div
              key={id}
              className={`node-card ${id === currentNode ? "active" : ""} ${
                isQuestRelatedNode(id) ? "quest-related-node" : ""
              }`}
              onClick={() => onSelectNode(id)}
              title={
                isQuestRelatedNode(id)
                  ? `Related quests: ${getQuestTitles(id)}`
                  : ""
              }
            >
              <div className="node-card-header">
                <div className="node-id">{id}</div>
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNode(id);
                  }}
                  title="Delete node"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              {node.speaker && (
                <div className="node-speaker">{node.speaker}</div>
              )}
              <div className="node-text">{node.text}</div>

              {/* Quest tags */}
              {isQuestRelatedNode(id) && (
                <div className="node-quest-tags mt-2">
                  {questRelatedNodes[id].questIds.map((questId) => (
                    <span key={questId} className="node-quest-tag">
                      {quests[questId]?.title || questId}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NodeList;
