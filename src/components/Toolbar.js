import React from 'react';

const Toolbar = ({ onAddNote, onAddGroup }) => {
  return (
    <div className="toolbar">
      <button onClick={onAddNote}>Add Note</button>
      <button onClick={onAddGroup}>Add Group</button>
    </div>
  );
};

export default Toolbar;