import React from 'react';

const Toolbar = ({ onAddNote }) => {
  return (
    <div className="toolbar">
      <button onClick={onAddNote}>Add Note</button>
    </div>
  );
};

export default Toolbar;