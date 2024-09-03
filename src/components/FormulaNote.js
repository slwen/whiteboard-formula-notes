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
      ref={noteRef}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: '200px',
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        opacity: isDragging ? 0.7 : 1,
        cursor: 'move',
      }}
      onMouseDown={handleMouseDown}
    >
      <select 
        value={formulaType} 
        onChange={handleFormulaTypeChange}
        style={{ width: '100%', marginBottom: '10px' }}
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
          style={{ marginTop: '10px', width: '100%', padding: '5px' }}
        />
      )}

      {formulaType === 'countColor' && (
        <div style={{ marginTop: '10px' }}>
          {availableColors.map(color => (
            <label key={color} style={{ display: 'block', marginBottom: '5px' }}>
              <input
                type="checkbox"
                checked={selectedColors.includes(color)}
                onChange={() => handleColorToggle(color)}
              />
              <span style={{ marginLeft: '5px', color: color }}>■</span>
            </label>
          ))}
        </div>
      )}

      <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px', textAlign: 'center' }}>
        Count: {count}
      </div>
    </div>
  );
};

export default React.memo(FormulaNote);