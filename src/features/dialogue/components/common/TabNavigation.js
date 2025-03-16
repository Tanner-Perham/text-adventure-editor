import React from "react";

/**
 * Tab navigation component to switch between different views
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab
 * @param {Array} props.tabs - Array of tab objects with id and label props
 * @param {Function} props.onTabChange - Function called when tab is changed
 * @param {Object} props.tabCallbacks - Optional callbacks for specific tabs
 */
const TabNavigation = ({ activeTab, tabs, onTabChange, tabCallbacks = {} }) => {
  return (
    <div className="tabs-container">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => {
            // If there's a specific callback for this tab, call it first
            if (tabCallbacks[tab.id]) {
              tabCallbacks[tab.id]();
            }
            // Then change the tab
            onTabChange(tab.id);
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
