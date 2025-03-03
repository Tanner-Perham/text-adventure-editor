import React from "react";

const Settings = ({
  emotionalStates,
  availableSkills,
  availableItems,
  onUpdateEmotionalStates,
  onUpdateAvailableSkills,
  onUpdateAvailableItems,
}) => {
  // Add an emotional state
  const addEmotionalState = (state) => {
    if (state && !emotionalStates.includes(state)) {
      onUpdateEmotionalStates([...emotionalStates, state]);
    }
  };

  // Remove an emotional state
  const removeEmotionalState = (index) => {
    const newStates = [...emotionalStates];
    newStates.splice(index, 1);
    onUpdateEmotionalStates(newStates);
  };

  // Add a skill
  const addSkill = (skill) => {
    if (skill && !availableSkills.includes(skill.toLowerCase())) {
      onUpdateAvailableSkills([...availableSkills, skill.toLowerCase()]);
    }
  };

  // Remove a skill
  const removeSkill = (index) => {
    const newSkills = [...availableSkills];
    newSkills.splice(index, 1);
    onUpdateAvailableSkills(newSkills);
  };

  // Add an item
  const addItem = (item) => {
    if (item && !availableItems.includes(item.toLowerCase())) {
      onUpdateAvailableItems([...availableItems, item.toLowerCase()]);
    }
  };

  // Remove an item
  const removeItem = (index) => {
    const newItems = [...availableItems];
    newItems.splice(index, 1);
    onUpdateAvailableItems(newItems);
  };

  return (
    <div className="bg-white p-4 border rounded">
      <h2 className="text-lg font-semibold mb-4">Editor Settings</h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Emotional States Section */}
        <div>
          <h3 className="font-medium mb-3">Emotional States</h3>
          <div className="mb-2">
            <div className="flex mb-2">
              <input
                type="text"
                className="flex-1 p-2 border rounded-l"
                placeholder="Add new emotional state..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value) {
                    addEmotionalState(e.target.value);
                    e.target.value = "";
                  }
                }}
              />
              <button
                className="bg-green-500 text-white px-3 rounded-r hover:bg-green-600"
                onClick={(e) => {
                  const input = e.target.previousSibling;
                  if (input.value) {
                    addEmotionalState(input.value);
                    input.value = "";
                  }
                }}
              >
                +
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto border rounded p-2">
            {emotionalStates.map((state, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-1 px-2 hover:bg-gray-100"
              >
                <span>{state}</span>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => removeEmotionalState(idx)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <h3 className="font-medium mb-3">Available Skills</h3>
          <div className="mb-2">
            <div className="flex mb-2">
              <input
                type="text"
                className="flex-1 p-2 border rounded-l"
                placeholder="Add new skill..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value) {
                    addSkill(e.target.value);
                    e.target.value = "";
                  }
                }}
              />
              <button
                className="bg-green-500 text-white px-3 rounded-r hover:bg-green-600"
                onClick={(e) => {
                  const input = e.target.previousSibling;
                  if (input.value) {
                    addSkill(input.value);
                    input.value = "";
                  }
                }}
              >
                +
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto border rounded p-2">
            {availableSkills.map((skill, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-1 px-2 hover:bg-gray-100"
              >
                <span>{skill}</span>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => removeSkill(idx)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="mt-8">
        <h3 className="font-medium mb-3">Items</h3>
        <div className="mb-2">
          <div className="flex mb-2">
            <input
              type="text"
              className="flex-1 p-2 border rounded-l"
              placeholder="Add new item..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value) {
                  addItem(e.target.value);
                  e.target.value = "";
                }
              }}
            />
            <button
              className="bg-green-500 text-white px-3 rounded-r hover:bg-green-600"
              onClick={(e) => {
                const input = e.target.previousSibling;
                if (input.value) {
                  addItem(input.value);
                  input.value = "";
                }
              }}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border rounded p-2">
          {availableItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center bg-gray-100 px-2 py-1 rounded"
            >
              <span className="mr-2">{item}</span>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => removeItem(idx)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
