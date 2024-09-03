import React from 'react';

const Toolbar = ({ onAddNote, onAddGroup, onAddFormulaNote }) => {
  return (
    <div className="toolbar">
      <button onClick={onAddNote}>Add Note</button>
      <button onClick={onAddGroup}>Add Group</button>
      <button onClick={onAddFormulaNote}>Add Formula</button>
    </div>
  );
};

export default React.memo(Toolbar);