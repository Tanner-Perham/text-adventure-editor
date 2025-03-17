import React from "react";
import { useQuest } from "../context/QuestContext";

/**
 * Generic component for editing different types of events
 */
const EventEditor = ({ event, onUpdate }) => {
  const { availableSkills, availableItems, availableLocations, getAllNPCs } =
    useQuest();

  // Get all available NPCs
  const npcs = getAllNPCs();

  // Handle different event types and their specific editors
  switch (event.event_type) {
    case "AddClue":
      return <ClueEventEditor event={event} onUpdate={onUpdate} />;

    case "AddItem":
      return (
        <ItemEventEditor
          event={event}
          onUpdate={onUpdate}
          availableItems={availableItems}
        />
      );

    case "ModifySkill":
      return (
        <SkillEventEditor
          event={event}
          onUpdate={onUpdate}
          availableSkills={availableSkills}
        />
      );

    case "ModifyRelationship":
      return (
        <RelationshipEventEditor
          event={event}
          onUpdate={onUpdate}
          npcs={npcs}
        />
      );

    case "ChangeLocation":
    case "UnlockLocation":
      return (
        <LocationEventEditor
          event={event}
          onUpdate={onUpdate}
          availableLocations={availableLocations}
        />
      );

    default:
      return <GenericEventEditor event={event} onUpdate={onUpdate} />;
  }
};

// Clue event editor
const ClueEventEditor = ({ event, onUpdate }) => {
  return (
    <div className="event-editor">
      <div className="input-group">
        <label className="input-label">Clue ID</label>
        <input
          type="text"
          className="input-field"
          value={event.data.id || ""}
          onChange={(e) =>
            onUpdate({
              ...event,
              data: { ...event.data, id: e.target.value },
            })
          }
          placeholder="Unique clue identifier"
        />
      </div>
      <div className="input-group">
        <label className="input-label">Description</label>
        <textarea
          className="input-field textarea-field"
          value={event.data.description || ""}
          onChange={(e) =>
            onUpdate({
              ...event,
              data: { ...event.data, description: e.target.value },
            })
          }
          placeholder="Clue description"
          rows={2}
        />
      </div>
      <div className="input-group">
        <label className="input-label">Related Quest</label>
        <input
          type="text"
          className="input-field"
          value={event.data.related_quest || ""}
          onChange={(e) =>
            onUpdate({
              ...event,
              data: { ...event.data, related_quest: e.target.value },
            })
          }
          placeholder="Quest ID this clue relates to"
        />
      </div>
      <div className="checkbox-group">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={event.data.discovered || false}
            onChange={(e) =>
              onUpdate({
                ...event,
                data: { ...event.data, discovered: e.target.checked },
              })
            }
            className="mr-2"
          />
          <span>Already Discovered</span>
        </label>
      </div>
    </div>
  );
};

// Item event editor
const ItemEventEditor = ({ event, onUpdate, availableItems }) => {
  return (
    <div className="event-editor">
      <div className="input-group">
        <label className="input-label">Item ID</label>
        <select
          className="select-field"
          value={event.data.id || ""}
          onChange={(e) =>
            onUpdate({
              ...event,
              data: {
                ...event.data,
                id: e.target.value,
                name: e.target.value, // For simplicity, use ID as name
              },
            })
          }
        >
          <option value="">-- Select Item --</option>
          {availableItems &&
            availableItems.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
        </select>
      </div>
      <div className="input-group">
        <label className="input-label">Item Name</label>
        <input
          type="text"
          className="input-field"
          value={event.data.name || ""}
          onChange={(e) =>
            onUpdate({
              ...event,
              data: { ...event.data, name: e.target.value },
            })
          }
          placeholder="Display name for the item"
        />
      </div>
      <div className="input-group">
        <label className="input-label">Description</label>
        <textarea
          className="input-field textarea-field"
          value={event.data.description || ""}
          onChange={(e) =>
            onUpdate({
              ...event,
              data: { ...event.data, description: e.target.value },
            })
          }
          placeholder="Item description"
          rows={2}
        />
      </div>
    </div>
  );
};

// Skill event editor
const SkillEventEditor = ({ event, onUpdate, availableSkills }) => {
  return (
    <div className="event-editor">
      <div className="input-group">
        <label className="input-label">Skill</label>
        <select
          className="select-field"
          value={event.data[0] || ""}
          onChange={(e) =>
            onUpdate({
              ...event,
              data: [e.target.value, event.data[1] || 0],
            })
          }
        >
          <option value="">-- Select Skill --</option>
          {availableSkills &&
            availableSkills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
        </select>
      </div>
      <div className="input-group">
        <label className="input-label">Value Change</label>
        <input
          type="number"
          className="input-field"
          value={event.data[1] || 0}
          onChange={(e) =>
            onUpdate({
              ...event,
              data: [event.data[0] || "", parseInt(e.target.value) || 0],
            })
          }
          placeholder="Amount to change skill by"
        />
      </div>
    </div>
  );
};

// Relationship event editor
const RelationshipEventEditor = ({ event, onUpdate, npcs }) => {
  return (
    <div className="event-editor">
      <div className="input-group">
        <label className="input-label">NPC</label>
        <select
          className="select-field"
          value={event.data[0] || ""}
          onChange={(e) =>
            onUpdate({
              ...event,
              data: [e.target.value, event.data[1] || 0],
            })
          }
        >
          <option value="">-- Select NPC --</option>
          {npcs &&
            npcs.map((npc) => (
              <option key={npc} value={npc}>
                {npc}
              </option>
            ))}
        </select>
      </div>
      <div className="input-group">
        <label className="input-label">Relationship Change</label>
        <input
          type="number"
          className="input-field"
          value={event.data[1] || 0}
          onChange={(e) =>
            onUpdate({
              ...event,
              data: [event.data[0] || "", parseInt(e.target.value) || 0],
            })
          }
          placeholder="Amount to change relationship by"
        />
      </div>
    </div>
  );
};

// Location event editor
const LocationEventEditor = ({ event, onUpdate, availableLocations }) => {
  return (
    <div className="event-editor">
      <div className="input-group">
        <label className="input-label">Location</label>
        <select
          className="select-field"
          value={event.data || ""}
          onChange={(e) =>
            onUpdate({
              ...event,
              data: e.target.value,
            })
          }
        >
          <option value="">-- Select Location --</option>
          {availableLocations &&
            availableLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

// Generic event editor for other types
const GenericEventEditor = ({ event, onUpdate }) => {
  return (
    <div className="event-editor">
      <div className="input-group">
        <label className="input-label">Event Data</label>
        <input
          type="text"
          className="input-field"
          value={
            typeof event.data === "string"
              ? event.data
              : JSON.stringify(event.data)
          }
          onChange={(e) =>
            onUpdate({
              ...event,
              data: e.target.value,
            })
          }
          placeholder="Event data"
        />
        <p className="text-xs text-light mt-1">
          Enter data appropriate for this event type
        </p>
      </div>
    </div>
  );
};

export default EventEditor;
