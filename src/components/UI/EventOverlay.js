import React from "react";
import "./EventOverlay.css";

const EventOverlay = ({ activeEvent }) => {
  if (!activeEvent) return null;

  return (
    <div className="event-overlay">
      <div className="event-content" style={{ color: activeEvent.color || "#FFF" }}>
        <h1 className="event-title">{activeEvent.title}</h1>
        {activeEvent.description && (
          <h2 className="event-description">{activeEvent.description}</h2>
        )}
      </div>
    </div>
  );
};

export default EventOverlay;
