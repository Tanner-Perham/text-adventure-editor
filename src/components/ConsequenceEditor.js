import React from "react";

const ConsequenceEditor = ({
  consequence,
  onUpdate,
  availableItems,
  availableSkills,
  emotionalStates,
  allNodes,
  quests,
  getQuestStages,
  getQuestObjectives,
}) => {
  // Function to render the appropriate editor UI based on event_type
  const renderEditor = () => {
    switch (consequence.event_type) {
      case "ModifyRelationship":
        return (
          <div className="grid grid-cols-2 gap-2">
            <div className="input-group">
              <label className="input-label text-xs">NPC ID</label>
              <input
                type="text"
                className="input-field text-sm"
                value={consequence.data[0] || ""}
                onChange={(e) => {
                  const newData = [...consequence.data];
                  newData[0] = e.target.value;
                  onUpdate({ ...consequence, data: newData });
                }}
                placeholder="NPC ID"
              />
            </div>
            <div className="input-group">
              <label className="input-label text-xs">Value Change</label>
              <input
                type="number"
                className="input-field text-sm"
                value={consequence.data[1] || 0}
                onChange={(e) => {
                  const newData = [...consequence.data];
                  newData[1] = parseInt(e.target.value) || 0;
                  onUpdate({ ...consequence, data: newData });
                }}
                placeholder="Value"
              />
            </div>
          </div>
        );

      case "ChangeEmotionalState":
        return (
          <div className="input-group">
            <label className="input-label text-xs">Emotional State</label>
            <select
              className="select-field text-sm"
              value={consequence.data || "Neutral"}
              onChange={(e) =>
                onUpdate({ ...consequence, data: e.target.value })
              }
            >
              {emotionalStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        );

      case "RevealClue":
        return (
          <div className="space-y-2">
            <div className="input-group">
              <label className="input-label text-xs">Clue ID</label>
              <input
                type="text"
                className="input-field text-sm"
                value={consequence.data?.id || ""}
                onChange={(e) =>
                  onUpdate({
                    ...consequence,
                    data: {
                      ...consequence.data,
                      id: e.target.value,
                    },
                  })
                }
                placeholder="Clue ID"
              />
            </div>
            <div className="input-group">
              <label className="input-label text-xs">Description</label>
              <textarea
                className="input-field text-sm"
                value={consequence.data?.description || ""}
                onChange={(e) =>
                  onUpdate({
                    ...consequence,
                    data: {
                      ...consequence.data,
                      description: e.target.value,
                    },
                  })
                }
                placeholder="Clue description"
              />
            </div>
            <div className="input-group">
              <label className="input-label text-xs">Related Quest</label>
              <select
                className="select-field text-sm"
                value={consequence.data?.related_quest || ""}
                onChange={(e) =>
                  onUpdate({
                    ...consequence,
                    data: {
                      ...consequence.data,
                      related_quest: e.target.value,
                    },
                  })
                }
              >
                <option value="">-- None --</option>
                {quests &&
                  Object.keys(quests).map((questId) => (
                    <option key={questId} value={questId}>
                      {quests[questId].title || questId}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                className="mr-1"
                checked={consequence.data?.discovered || false}
                onChange={(e) =>
                  onUpdate({
                    ...consequence,
                    data: {
                      ...consequence.data,
                      discovered: e.target.checked,
                    },
                  })
                }
              />
              <label className="text-xs">Already Discovered</label>
            </div>
          </div>
        );

      case "UnlockThought":
        return (
          <div className="input-group">
            <label className="input-label text-xs">Thought ID</label>
            <input
              type="text"
              className="input-field text-sm"
              value={consequence.data || ""}
              onChange={(e) =>
                onUpdate({ ...consequence, data: e.target.value })
              }
              placeholder="Thought ID"
            />
          </div>
        );

      case "ModifySkill":
        return (
          <div className="grid grid-cols-2 gap-2">
            <div className="input-group">
              <label className="input-label text-xs">Skill</label>
              <select
                className="select-field text-sm"
                value={consequence.data[0] || ""}
                onChange={(e) => {
                  const newData = [...consequence.data];
                  newData[0] = e.target.value;
                  onUpdate({ ...consequence, data: newData });
                }}
              >
                <option value="">-- Select Skill --</option>
                {availableSkills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label text-xs">Value Change</label>
              <input
                type="number"
                className="input-field text-sm"
                value={consequence.data[1] || 0}
                onChange={(e) => {
                  const newData = [...consequence.data];
                  newData[1] = parseInt(e.target.value) || 0;
                  onUpdate({ ...consequence, data: newData });
                }}
                placeholder="Value"
              />
            </div>
          </div>
        );

      case "TriggerEvent":
        return (
          <div className="input-group">
            <label className="input-label text-xs">Event ID</label>
            <input
              type="text"
              className="input-field text-sm"
              value={consequence.data || ""}
              onChange={(e) =>
                onUpdate({ ...consequence, data: e.target.value })
              }
              placeholder="Event ID"
            />
          </div>
        );

      case "ModifyQuestStatus":
        return (
          <div className="grid grid-cols-2 gap-2">
            <div className="input-group">
              <label className="input-label text-xs">Quest ID</label>
              <select
                className="select-field text-sm"
                value={consequence.data[0] || ""}
                onChange={(e) => {
                  const newData = [...consequence.data];
                  newData[0] = e.target.value;
                  onUpdate({ ...consequence, data: newData });
                }}
              >
                <option value="">-- Select Quest --</option>
                {quests &&
                  Object.keys(quests).map((questId) => (
                    <option key={questId} value={questId}>
                      {quests[questId].title || questId}
                    </option>
                  ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label text-xs">Status</label>
              <select
                className="select-field text-sm"
                value={consequence.data[1] || ""}
                onChange={(e) => {
                  const newData = [...consequence.data];
                  newData[1] = e.target.value;
                  onUpdate({ ...consequence, data: newData });
                }}
              >
                <option value="NotStarted">Not Started</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
        );

      case "UnlockDialogueNode":
      case "LockDialogueNode":
        return (
          <div className="input-group">
            <label className="input-label text-xs">Dialog Node ID</label>
            <select
              className="select-field text-sm"
              value={consequence.data || ""}
              onChange={(e) =>
                onUpdate({ ...consequence, data: e.target.value })
              }
            >
              <option value="">-- Select Node --</option>
              {Object.keys(allNodes).map((nodeId) => (
                <option key={nodeId} value={nodeId}>
                  {nodeId}
                </option>
              ))}
            </select>
          </div>
        );

      case "StartQuest":
      case "FailQuest":
        return (
          <div className="input-group">
            <label className="input-label text-xs">Quest ID</label>
            <select
              className="select-field text-sm"
              value={consequence.data || ""}
              onChange={(e) =>
                onUpdate({ ...consequence, data: e.target.value })
              }
            >
              <option value="">-- Select Quest --</option>
              {quests &&
                Object.keys(quests).map((questId) => (
                  <option key={questId} value={questId}>
                    {quests[questId].title || questId}
                  </option>
                ))}
            </select>
          </div>
        );

      case "AdvanceQuest":
      case "UnlockQuestBranch":
        return (
          <div className="space-y-2">
            <div className="input-group">
              <label className="input-label text-xs">Quest ID</label>
              <select
                className="select-field text-sm"
                value={
                  Array.isArray(consequence.data)
                    ? consequence.data[0] || ""
                    : ""
                }
                onChange={(e) => {
                  const newData = Array.isArray(consequence.data)
                    ? [...consequence.data]
                    : ["", ""];
                  newData[0] = e.target.value;
                  onUpdate({ ...consequence, data: newData });
                }}
              >
                <option value="">-- Select Quest --</option>
                {quests &&
                  Object.keys(quests).map((questId) => (
                    <option key={questId} value={questId}>
                      {quests[questId].title || questId}
                    </option>
                  ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label text-xs">
                {consequence.event_type === "AdvanceQuest"
                  ? "Stage ID"
                  : "Branch ID"}
              </label>
              <select
                className="select-field text-sm"
                value={
                  Array.isArray(consequence.data)
                    ? consequence.data[1] || ""
                    : ""
                }
                onChange={(e) => {
                  const newData = Array.isArray(consequence.data)
                    ? [...consequence.data]
                    : ["", ""];
                  newData[1] = e.target.value;
                  onUpdate({ ...consequence, data: newData });
                }}
                disabled={
                  !Array.isArray(consequence.data) || !consequence.data[0]
                }
              >
                <option value="">-- Select Stage --</option>
                {Array.isArray(consequence.data) &&
                  consequence.data[0] &&
                  getQuestStages(consequence.data[0]).map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.description || stage.id}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        );

      case "CompleteQuestObjective":
        return (
          <div className="space-y-2">
            <div className="input-group">
              <label className="input-label text-xs">Quest ID</label>
              <select
                className="select-field text-sm"
                value={
                  Array.isArray(consequence.data)
                    ? consequence.data[0] || ""
                    : ""
                }
                onChange={(e) => {
                  const newData = Array.isArray(consequence.data)
                    ? [...consequence.data]
                    : ["", ""];
                  newData[0] = e.target.value;
                  onUpdate({ ...consequence, data: newData });
                }}
              >
                <option value="">-- Select Quest --</option>
                {quests &&
                  Object.keys(quests).map((questId) => (
                    <option key={questId} value={questId}>
                      {quests[questId].title || questId}
                    </option>
                  ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label text-xs">Stage ID</label>
              <select
                className="select-field text-sm"
                value=""
                onChange={() => {}}
                disabled={true}
              >
                <option value="">-- First select Quest and Stage --</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label text-xs">Objective ID</label>
              <select
                className="select-field text-sm"
                value={
                  Array.isArray(consequence.data)
                    ? consequence.data[1] || ""
                    : ""
                }
                onChange={(e) => {
                  const newData = Array.isArray(consequence.data)
                    ? [...consequence.data]
                    : ["", ""];
                  newData[1] = e.target.value;
                  onUpdate({ ...consequence, data: newData });
                }}
                disabled={
                  !Array.isArray(consequence.data) || !consequence.data[0]
                }
              >
                <option value="">-- Select Objective --</option>
                {Array.isArray(consequence.data) &&
                  consequence.data[0] &&
                  quests[consequence.data[0]]?.stages
                    .flatMap((stage) =>
                      (stage.objectives || []).map((obj) => ({
                        id: obj.id,
                        description: obj.description,
                        stageId: stage.id,
                      })),
                    )
                    .map((objective) => (
                      <option key={objective.id} value={objective.id}>
                        {objective.description || objective.id} (Stage:{" "}
                        {objective.stageId})
                      </option>
                    ))}
              </select>
            </div>
          </div>
        );

      case "AddQuestItem":
        return (
          <div className="space-y-2">
            <div className="input-group">
              <label className="input-label text-xs">Quest ID</label>
              <select
                className="select-field text-sm"
                value={consequence.data?.quest_id || ""}
                onChange={(e) =>
                  onUpdate({
                    ...consequence,
                    data: {
                      ...consequence.data,
                      quest_id: e.target.value,
                    },
                  })
                }
              >
                <option value="">-- Select Quest --</option>
                {quests &&
                  Object.keys(quests).map((questId) => (
                    <option key={questId} value={questId}>
                      {quests[questId].title || questId}
                    </option>
                  ))}
              </select>
            </div>
            <div className="item-details border-t border-gray-200 pt-2 mt-2">
              <h6 className="text-xs font-medium mb-2">Item Details:</h6>
              <div className="grid grid-cols-1 gap-2">
                <div className="input-group">
                  <label className="input-label text-xs">Item ID</label>
                  <input
                    type="text"
                    className="input-field text-sm"
                    value={consequence.data?.item?.id || ""}
                    onChange={(e) =>
                      onUpdate({
                        ...consequence,
                        data: {
                          ...consequence.data,
                          item: {
                            ...consequence.data?.item,
                            id: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Item ID"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label text-xs">Name</label>
                  <input
                    type="text"
                    className="input-field text-sm"
                    value={consequence.data?.item?.name || ""}
                    onChange={(e) =>
                      onUpdate({
                        ...consequence,
                        data: {
                          ...consequence.data,
                          item: {
                            ...consequence.data?.item,
                            name: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Item Name"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label text-xs">Description</label>
                  <textarea
                    className="input-field text-sm"
                    value={consequence.data?.item?.description || ""}
                    onChange={(e) =>
                      onUpdate({
                        ...consequence,
                        data: {
                          ...consequence.data,
                          item: {
                            ...consequence.data?.item,
                            description: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Item Description"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        // Generic editor for other event types
        return (
          <div className="input-group">
            <label className="input-label text-xs">Data</label>
            <input
              type="text"
              className="input-field text-sm"
              value={
                typeof consequence.data === "string"
                  ? consequence.data
                  : JSON.stringify(consequence.data || "")
              }
              onChange={(e) =>
                onUpdate({
                  ...consequence,
                  data: e.target.value,
                })
              }
              placeholder="Event Data"
            />
          </div>
        );
    }
  };

  return (
    <div className="consequence-editor-container p-2">{renderEditor()}</div>
  );
};

export default ConsequenceEditor;
