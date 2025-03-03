import React from "react";

const SkillCheckEditor = ({
  skillCheck,
  availableSkills,
  emotionalStates,
  onUpdate,
  onRemove,
}) => {
  // Handle supporting skill changes
  const addSupportingSkill = () => {
    const newSkill = availableSkills.find(
      (skill) => !skillCheck.supporting_skills.some((s) => s[0] === skill),
    );

    if (newSkill) {
      onUpdate({
        supporting_skills: [
          ...(skillCheck.supporting_skills || []),
          [newSkill, 0.5],
        ],
      });
    }
  };

  const updateSupportingSkill = (index, skill, value) => {
    const newSupportingSkills = [...skillCheck.supporting_skills];
    if (skill) {
      newSupportingSkills[index][0] = skill;
    }
    if (value !== undefined) {
      newSupportingSkills[index][1] = parseFloat(value);
    }

    onUpdate({ supporting_skills: newSupportingSkills });
  };

  const removeSupportingSkill = (index) => {
    const newSupportingSkills = [...skillCheck.supporting_skills];
    newSupportingSkills.splice(index, 1);
    onUpdate({ supporting_skills: newSupportingSkills });
  };

  // Handle emotional modifier changes
  const addEmotionalModifier = (emotion) => {
    onUpdate({
      emotional_modifiers: {
        ...skillCheck.emotional_modifiers,
        [emotion]: 0,
      },
    });
  };

  const updateEmotionalModifier = (emotion, value) => {
    onUpdate({
      emotional_modifiers: {
        ...skillCheck.emotional_modifiers,
        [emotion]: parseInt(value),
      },
    });
  };

  const removeEmotionalModifier = (emotion) => {
    const newEmotionalModifiers = { ...skillCheck.emotional_modifiers };
    delete newEmotionalModifiers[emotion];
    onUpdate({ emotional_modifiers: newEmotionalModifiers });
  };

  return (
    <div className="border p-2 rounded bg-blue-50">
      <div className="flex justify-between items-center mb-2">
        <h5 className="font-medium">Skill Check</h5>
        <button
          onClick={onRemove}
          className="text-red-500 text-sm hover:text-red-700"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        {/* Base Difficulty */}
        <div>
          <label className="block text-xs font-medium mb-1">
            Base Difficulty
          </label>
          <input
            type="number"
            className="w-full p-1 border rounded text-sm"
            value={skillCheck.base_difficulty}
            onChange={(e) =>
              onUpdate({ base_difficulty: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        {/* Primary Skill */}
        <div>
          <label className="block text-xs font-medium mb-1">
            Primary Skill
          </label>
          <select
            className="w-full p-1 border rounded text-sm"
            value={skillCheck.primary_skill}
            onChange={(e) => onUpdate({ primary_skill: e.target.value })}
          >
            {availableSkills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* White Check and Hidden Check */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={skillCheck.white_check || false}
              onChange={(e) => onUpdate({ white_check: e.target.checked })}
            />
            <span className="text-xs">White Check</span>
          </label>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={skillCheck.hidden || false}
              onChange={(e) => onUpdate({ hidden: e.target.checked })}
            />
            <span className="text-xs">Hidden Check</span>
          </label>
        </div>
      </div>

      {/* Supporting Skills */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-medium">Supporting Skills</label>
          <button
            onClick={addSupportingSkill}
            className="text-blue-600 text-xs hover:text-blue-800"
            disabled={
              availableSkills.length ===
              skillCheck.supporting_skills?.length + 1
            }
          >
            + Add Skill
          </button>
        </div>

        {skillCheck.supporting_skills &&
        skillCheck.supporting_skills.length > 0 ? (
          <div className="space-y-1">
            {skillCheck.supporting_skills.map((skill, idx) => (
              <div key={idx} className="flex items-center space-x-1">
                <select
                  className="p-1 border rounded text-xs flex-grow"
                  value={skill[0]}
                  onChange={(e) => updateSupportingSkill(idx, e.target.value)}
                >
                  {availableSkills
                    .filter(
                      (s) =>
                        s !== skillCheck.primary_skill &&
                        !skillCheck.supporting_skills.some(
                          (ss, i) => i !== idx && ss[0] === s,
                        ),
                    )
                    .map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </select>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  className="p-1 border rounded text-xs w-16"
                  value={skill[1]}
                  onChange={(e) =>
                    updateSupportingSkill(idx, null, e.target.value)
                  }
                />
                <button
                  onClick={() => removeSupportingSkill(idx)}
                  className="text-red-500 text-xs hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">
            No supporting skills
          </div>
        )}
      </div>

      {/* Emotional Modifiers */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-medium">Emotional Modifiers</label>
          <div className="relative">
            <select
              className="text-xs p-1 border rounded"
              onChange={(e) => {
                if (e.target.value) {
                  addEmotionalModifier(e.target.value);
                  e.target.value = "";
                }
              }}
            >
              <option value="">+ Add Modifier</option>
              {emotionalStates
                .filter(
                  (state) =>
                    !Object.keys(skillCheck.emotional_modifiers || {}).includes(
                      state,
                    ),
                )
                .map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {Object.keys(skillCheck.emotional_modifiers || {}).length > 0 ? (
          <div className="space-y-1">
            {Object.entries(skillCheck.emotional_modifiers || {}).map(
              ([emotion, modifier]) => (
                <div key={emotion} className="flex items-center space-x-1">
                  <span className="text-xs w-24 truncate">{emotion}:</span>
                  <input
                    type="number"
                    className="p-1 border rounded text-xs flex-grow"
                    value={modifier}
                    onChange={(e) =>
                      updateEmotionalModifier(emotion, e.target.value)
                    }
                  />
                  <button
                    onClick={() => removeEmotionalModifier(emotion)}
                    className="text-red-500 text-xs hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">
            No emotional modifiers
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillCheckEditor;
