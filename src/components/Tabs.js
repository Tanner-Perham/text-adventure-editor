import React from "react";

const Tabs = ({
  currentTab,
  onChange,
  onPreviewStart,
  onExportYAML,
  onExportJSON,
}) => {
  const tabs = [
    { id: "editor", label: "Editor" },
    { id: "visualisation", label: "Visualisation" },
    { id: "preview", label: "Preview", onClick: onPreviewStart },
    { id: "yaml", label: "YAML", onClick: onExportYAML },
    { id: "json", label: "JSON", onClick: onExportJSON },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="tab-container">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            if (tab.onClick) {
              tab.onClick();
            } else {
              onChange(tab.id);
            }
          }}
          className={`tab-button ${currentTab === tab.id ? "active" : ""}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
