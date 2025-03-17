import React from "react";
import EventEditor from "./EventEditor";

/**
 * Component for editing completion events of a quest stage
 */
const QuestCompletionEventsEditor = ({ completionEvents, onUpdate }) => {
  // Event type options for dropdown
  const eventTypes = [
    { value: "AddClue", label: "Add Clue" },
    { value: "AddItem", label: "Add Item" },
    { value: "ModifySkill", label: "Modify Skill" },
    { value: "ModifyRelationship", label: "Modify Relationship" },
    { value: "ChangeLocation", label: "Change Location" },
    { value: "UnlockLocation", label: "Unlock Location" },
    { value: "TriggerEvent", label: "Trigger Event" },
  ];

  // Add a new completion event
  const handleAddCompletionEvent = (eventType) => {
    let newEvent;

    switch (eventType) {
      case "AddClue":
        newEvent = {
          event_type: "AddClue",
          data: {
            id: `clue_${Date.now()}`,
            description: "New clue",
            related_quest: "",
            discovered: false,
          },
        };
        break;
      case "AddItem":
        newEvent = {
          event_type: "AddItem",
          data: {
            id: "",
            name: "",
            description: "",
            effects: {},
          },
        };
        break;
      case "ModifySkill":
        newEvent = {
          event_type: "ModifySkill",
          data: ["", 0],
        };
        break;
      case "ModifyRelationship":
        newEvent = {
          event_type: "ModifyRelationship",
          data: ["", 0],
        };
        break;
      case "ChangeLocation":
        newEvent = {
          event_type: "ChangeLocation",
          data: "",
        };
        break;
      case "UnlockLocation":
        newEvent = {
          event_type: "UnlockLocation",
          data: "",
        };
        break;
      case "TriggerEvent":
        newEvent = {
          event_type: "TriggerEvent",
          data: "",
        };
        break;
      default:
        newEvent = {
          event_type: eventType,
          data: "",
        };
    }

    onUpdate([...completionEvents, newEvent]);
  };

  // Update an event
  const handleUpdateCompletionEvent = (index, updatedEvent) => {
    const newEvents = [...completionEvents];
    newEvents[index] = updatedEvent;
    onUpdate(newEvents);
  };

  // Delete an event
  const handleDeleteCompletionEvent = (index) => {
    const newEvents = [...completionEvents];
    newEvents.splice(index, 1);
    onUpdate(newEvents);
  };

  return (
    <div className="stage-completion-events">
      <div className="section-header">
        <h3 className="section-title">Completion Events</h3>
        <div className="dropdown">
          <button className="button button-sm button-primary dropdown-toggle">
            + Add Event
          </button>
          <div className="dropdown-menu">
            {eventTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleAddCompletionEvent(type.value)}
                className="dropdown-item"
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="completion-events-list">
        {completionEvents.length > 0 ? (
          completionEvents.map((event, index) => (
            <div key={index} className="completion-event-card">
              <div className="completion-event-header">
                <h4>Event: {event.event_type}</h4>
                <button
                  onClick={() => handleDeleteCompletionEvent(index)}
                  className="button button-sm button-danger"
                >
                  Delete
                </button>
              </div>
              <EventEditor
                event={event}
                onUpdate={(updatedEvent) =>
                  handleUpdateCompletionEvent(index, updatedEvent)
                }
              />
            </div>
          ))
        ) : (
          <div className="empty-message">
            No completion events added. These events trigger when all required
            objectives are completed.
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestCompletionEventsEditor;
