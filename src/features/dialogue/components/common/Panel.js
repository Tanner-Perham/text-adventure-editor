import React from "react";

/**
 * A reusable panel component with a header and content area
 * @param {Object} props - Component props
 * @param {string} props.title - Panel title
 * @param {React.ReactNode} props.children - Panel content
 * @param {React.ReactNode} props.headerActions - Optional actions to display in the header
 * @param {string} props.className - Optional additional CSS classes
 * @param {boolean} props.large - Whether to use the larger panel style
 */
const Panel = ({
  title,
  children,
  headerActions,
  className = "",
  large = false,
}) => {
  const panelClass = large ? "panel-large" : "panel";

  return (
    <div className={`${panelClass} ${className}`}>
      <div className="panel-header">
        <h2 className="panel-title">{title}</h2>
        {headerActions && <div className="panel-actions">{headerActions}</div>}
      </div>
      <div className="panel-content">{children}</div>
    </div>
  );
};

export default Panel;
