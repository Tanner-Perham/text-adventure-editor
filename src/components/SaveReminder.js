import React, { useState, useEffect } from "react";

const SaveReminder = ({ hasUnsavedChanges, onExport }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show reminder when there are unsaved changes and after a period of inactivity
  useEffect(() => {
    let remindTimer;

    if (hasUnsavedChanges) {
      // Show reminder after 5 minutes of having unsaved changes
      remindTimer = setTimeout(
        () => {
          setIsVisible(true);
        },
        5 * 60 * 1000,
      ); // 5 minutes
    }

    return () => {
      clearTimeout(remindTimer);
    };
  }, [hasUnsavedChanges]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded shadow-lg border border-orange-300 max-w-md z-50">
      <div className="flex items-start">
        <div className="mr-2 text-orange-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-sm">
            Don't forget to save your work!
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            You have unsaved changes that will be lost if you leave the page or
            refresh.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={onExport}
              className="bg-primary-color text-white px-3 py-1 rounded text-xs font-medium"
            >
              Export Now
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveReminder;
