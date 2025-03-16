import React from "react";
import EventEditor from "./EventEditor";

/**
 * Component for managing completion events for an objective
 */
const ObjectiveCompletionEvents = ({ events, onUpdate }) => {
  // Event type options for dropdown
  const eventTypes = [
    { value: "AddClue", label: "Add Clue" },
    { value: "AddItem", label: "Add Item" },
    { value: "ModifySkill", label: "Modify Skill" },
    { value: "ModifyRelationship", label: "Modify Relationship" },
    { value: "TriggerEvent", label: "Trigger Event" },
  ];

  // Add a new event
  const addEvent = (eventType) => {
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

    onUpdate([...events, newEvent]);
  };

  // Update an event
  const updateEvent = (index, updatedEvent) => {
    const newEvents = [...events];
    newEvents[index] = updatedEvent;
    onUpdate(newEvents);
  };

  // Delete an event
  const deleteEvent = (index) => {
    const newEvents = [...events];
    newEvents.splice(index, 1);
    onUpdate(newEvents);
  };

  return (
    <div className="completion-events-list mt-2">
      {/* Event type dropdown */}
      <div className="mb-2">
        <div className="dropdown">
          <button className="button button-sm button-primary dropdown-toggle">
            + Add Event
          </button>
          <div className="dropdown-menu">
            {eventTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => addEvent(type.value)}
                className="dropdown-item"
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List of events */}
      {events.length > 0 ? (
        events.map((event, eventIndex) => (
          <div key={eventIndex} className="objective-event-card mb-2">
            <div className="objective-event-header">
              <h6>{event.event_type}</h6>
              <button
                onClick={() => deleteEvent(eventIndex)}
                className="button button-xs button-danger"
              >
                Delete
              </button>
            </div>
            <div className="objective-event-details">
              <EventEditor
                event={event}
                onUpdate={(updatedEvent) =>
                  updateEvent(eventIndex, updatedEvent)
                }
              />
            </div>
          </div>
        ))
      ) : (
        <p className="text-xs text-light italic">
          No completion events. These trigger when this objective is completed.
        </p>
      )}
    </div>
  );
};

export default ObjectiveCompletionEvents;
