import React from "react";

const ExportPanel = ({ format, content }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    alert(`${format.toUpperCase()} copied to clipboard!`);
  };

  return (
    <div className="bg-white p-4 border rounded">
      <h2 className="text-lg font-semibold mb-4">
        {format.toUpperCase()} Export
      </h2>
      <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto whitespace-pre-wrap max-h-96">
        {content}
      </pre>
      <div className="mt-4">
        <button
          onClick={copyToClipboard}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
};

export default ExportPanel;
