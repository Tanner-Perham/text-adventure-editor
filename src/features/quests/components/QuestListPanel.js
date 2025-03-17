import React from "react";
import { useQuest } from "../context/QuestContext";

/**
 * Component for displaying the list of quests
 */
const QuestListPanel = () => {
  const {
    filteredQuests,
    currentQuestId,
    searchTerm,
    setSearchTerm,
    handleQuestSelect,
    handleAddQuest,
    handleDeleteQuest,
  } = useQuest();

  // Sort quests by main quest status and then alphabetically
  const sortedQuests = [...filteredQuests].sort(
    ([idA, questA], [idB, questB]) => {
      // Sort main quests before side quests
      if (questA.is_main_quest && !questB.is_main_quest) return -1;
      if (!questA.is_main_quest && questB.is_main_quest) return 1;

      // Then sort by title alphabetically
      return questA.title.localeCompare(questB.title);
    },
  );

  return (
    <div>
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
          placeholder="Search quests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <button
        onClick={handleAddQuest}
        className="button button-primary w-full mb-4"
      >
        + Add New Quest
      </button>

      <div className="quest-list">
        {sortedQuests.length === 0 ? (
          <p className="text-center text-light">No quests found</p>
        ) : (
          sortedQuests.map(([id, quest]) => (
            <QuestListItem
              key={id}
              id={id}
              quest={quest}
              isSelected={id === currentQuestId}
              onSelect={handleQuestSelect}
              onDelete={handleDeleteQuest}
            />
          ))
        )}
      </div>
    </div>
  );
};

/**
 * Individual quest item in the list
 */
const QuestListItem = ({ id, quest, isSelected, onSelect, onDelete }) => {
  return (
    <div
      className={`quest-card ${isSelected ? "active" : ""} ${
        quest.is_main_quest ? "main-quest" : "side-quest"
      }`}
      onClick={() => onSelect(id)}
    >
      <div className="quest-card-header">
        <div className="quest-id">{id}</div>
        <button
          className="delete-button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          title="Delete quest"
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
      <div className="quest-type">
        {quest.is_main_quest ? "Main Quest" : "Side Quest"}
      </div>
      <div className="quest-title">{quest.title || "Untitled Quest"}</div>
      <div className="quest-info">
        <span className="quest-stages">
          {quest.stages ? quest.stages.length : 0} stages
        </span>
        {quest.is_hidden && <span className="quest-hidden">Hidden</span>}
      </div>
    </div>
  );
};

export default QuestListPanel;
