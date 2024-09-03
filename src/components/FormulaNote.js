import React, { useState, useEffect, useCallback, useRef } from 'react';

const FormulaNote = ({ id, x, y, notes, groups, groupedNotes, onChange, onMove }) => {
  const [formulaType, setFormulaType] = useState('countAll');
  const [searchText, setSearchText] = useState('');
  const [selectedColors, setSelectedColors] = useState([]);
  const [count, setCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const noteRef = useRef(null);

  const updateCount = useCallback(() => {
    let groupId = null;
    for (const [gId, noteIds] of Object.entries(groupedNotes)) {
      if (noteIds.includes(id)) {
        groupId = gId;
        break;
      }
    }

    let filteredNotes = groupId ? notes.filter(note => groupedNotes[groupId].includes(note.id)) : notes;

    switch (formulaType) {
      case 'countAll':
        setCount(filteredNotes.length);
        break;
      case 'countText':
        setCount(filteredNotes.filter(note => note.text.toLowerCase().includes(searchText.toLowerCase())).length);
        break;
      case 'countColor':
        setCount(filteredNotes.filter(note => selectedColors.includes(note.color)).length);
        break;
      default:
        setCount(0);
    }
  }, [id, notes, groups, groupedNotes, formulaType, searchText, selectedColors]);

  useEffect(() => {
    updateCount();
  }, [updateCount, notes, groups, groupedNotes]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsDragging(true);
    const rect = noteRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    onMove(id, newX, newY);
  }, [isDragging, dragOffset, id, onMove]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  const handleFormulaTypeChange = (e) => {
    setFormulaType(e.target.value);
    onChange(id, { formulaType: e.target.value });
  };

  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value);
    onChange(id, { searchText: e.target.value });
  };

  const handleColorToggle = (color) => {
    setSelectedColors(prev => {
      const newColors = prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color];
      onChange(id, { selectedColors: newColors });
      return newColors;
    });
  };

  const availableColors = [...new Set(notes.map(note => note.color))];

  return (
    <div
      className="formula-note"
      ref={noteRef}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: '240px',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1), 0 1px 1px rgba(0,0,0,0.05)',
        opacity: isDragging ? 0.65 : 1,
        cursor: 'move',
        boxSizing: 'border-box',
      }}
      onMouseDown={handleMouseDown}
    >
      <div style={{ fontSize: '32px', lineHeight:1, fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
        {count}
      </div>
      <select 
        value={formulaType} 
        onChange={handleFormulaTypeChange}
        style={{ width: '100%', marginBottom: '10px', padding: '5px', boxSizing: 'border-box' }}
      >
        <option value="countAll">Count all notes</option>
        <option value="countText">Count all notes containing text...</option>
        <option value="countColor">Count all notes with colour...</option>
      </select>

      {formulaType === 'countText' && (
        <input
          type="text"
          value={searchText}
          onChange={handleSearchTextChange}
          placeholder="Enter search text..."
          style={{ marginTop: '4px', width: '100%', padding: '5px', boxSizing: 'border-box' }}
        />
      )}

      {formulaType === 'countColor' && (
        <div style={{ marginTop: '4px', display: 'flex', gap: '4px' }}>
          {availableColors.map(color => (
            <label key={color} style={{ display: 'block', marginBottom: '4px' }}>
              <input
                type="checkbox"
                style={{ display: 'none' }}
                checked={selectedColors.includes(color)}
                onChange={() => handleColorToggle(color)}
              />
              <span style={{ 
                color: 'rgba(0,0,0,0.75)', 
                backgroundColor: color,
                fontSize: '16px', 
                border: selectedColors.includes(color) ? '2px solid rgba(0,0,0,0.75)' : '2px solid transparent',
                borderRadius: '4px',
                padding: '4px',
                display: 'flex',
                width: '16px',
                height: '16px',
                alignItems: 'center',
                justifyContent: 'center',
              }}>{selectedColors.includes(color) ? '✔' : ''}</span>
            </label>
          ))}
        </div>
      )}

      
    </div>
  );
};

export default React.memo(FormulaNote);