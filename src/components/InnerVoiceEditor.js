import React from "react";

const InnerVoiceEditor = ({ innerVoiceComments, onUpdate, onDelete }) => {
  if (innerVoiceComments.length === 0) {
    return (
      <div className="text-light italic text-sm p-3 border rounded">
        No inner voice comments. Add one to enhance player perception abilities.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {innerVoiceComments.map((comment, idx) => (
        <div key={idx} className="inner-voice-item">
          <div className="inner-voice-header">
            <h4 className="text-sm font-medium">Inner Voice #{idx + 1}</h4>
            <button
              onClick={() => onDelete(idx)}
              className="button button-sm button-danger"
            >
              Remove
            </button>
          </div>

          <div className="input-group mb-2">
            <label className="input-label">Voice Type</label>
            <input
              type="text"
              className="input-field"
              value={comment.voice_type}
              onChange={(e) => onUpdate(idx, { voice_type: e.target.value })}
              placeholder="e.g., Empathy, Logic, Intuition"
            />
          </div>

          <div className="input-group mb-2">
            <label className="input-label">Text</label>
            <textarea
              className="input-field textarea-field"
              value={comment.text}
              onChange={(e) => onUpdate(idx, { text: e.target.value })}
              placeholder="Inner voice comment text"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Skill Requirement</label>
            <input
              type="number"
              className="input-field"
              value={comment.skill_requirement}
              onChange={(e) =>
                onUpdate(idx, {
                  skill_requirement: parseInt(e.target.value) || 0,
                })
              }
              min="0"
              max="20"
            />
            <p className="text-xs text-light mt-1">
              Player needs this skill level to see this inner voice comment.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InnerVoiceEditor;
