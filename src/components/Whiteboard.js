import React, { useState, useCallback, useRef } from 'react';
import StickyNote from './StickyNote';
import GroupElement from './GroupElement';
import Toolbar from './Toolbar';
import { getRandomColor } from '../utils/colors';

const Whiteboard = () => {
  const [notes, setNotes] = useState([
    { id: 1, text: 'James', color: getRandomColor(), x: 100, y: 100 },
    { id: 2, text: 'Melissa', color: getRandomColor(), x: 300, y: 100 },
    { id: 3, text: 'Emma', color: getRandomColor(), x: 200, y: 250 },
    { id: 4, text: 'Liam', color: getRandomColor(), x: 450, y: 150 },
    { id: 5, text: 'Sophia', color: getRandomColor(), x: 150, y: 350 },
    { id: 6, text: 'Noah', color: getRandomColor(), x: 400, y: 300 },
    // ... other initial notes ...
  ]);
  const [groups, setGroups] = useState([]);
  const [nextId, setNextId] = useState(7); // Assuming 6 initial notes
  const [isDrawingGroup, setIsDrawingGroup] = useState(false);
  const [tempGroup, setTempGroup] = useState(null);
  const whiteboardRef = useRef(null);
  const [groupedNotes, setGroupedNotes] = useState({});

  const handleNoteChange = useCallback((id, newText) => {
    setNotes(prevNotes => prevNotes.map(note => 
      note.id === id ? { ...note, text: newText } : note
    ));
  }, []);

  const handleNoteDrag = useCallback((id, x, y) => {
    setNotes(prevNotes => prevNotes.map(note => 
      note.id === id ? { ...note, x, y } : note
    ));

    const draggedNote = { id, x, y, width: 150, height: 150 };

    setGroupedNotes(prevGroupedNotes => {
      const updatedGroupedNotes = { ...prevGroupedNotes };

      // Remove the note from its current group if it's no longer fully inside
      for (const [groupId, noteIds] of Object.entries(updatedGroupedNotes)) {
        if (noteIds.includes(id)) {
          const group = groups.find(g => g.id === groupId);
          if (!isNoteInGroup(draggedNote, group)) {
            updatedGroupedNotes[groupId] = noteIds.filter(noteId => noteId !== id);
          }
        }
      }

      // Check if the note has been dragged into a new group
      groups.forEach(group => {
        if (isNoteInGroup(draggedNote, group)) {
          if (!updatedGroupedNotes[group.id]) {
            updatedGroupedNotes[group.id] = [];
          }
          if (!updatedGroupedNotes[group.id].includes(id)) {
            updatedGroupedNotes[group.id] = [...updatedGroupedNotes[group.id], id];
          }
        }
      });

      return updatedGroupedNotes;
    });
  }, [groups]);

  const addNewNote = useCallback(() => {
    const newNote = {
      id: nextId,
      text: '',
      color: getRandomColor(),
      x: Math.random() * (window.innerWidth - 150),
      y: Math.random() * (window.innerHeight - 150),
      isNew: true
    };

    setNotes(prevNotes => [...prevNotes, newNote]);
    setNextId(prevId => prevId + 1);
  }, [nextId]);

  const handleAddGroup = () => {
    setIsDrawingGroup(true);
    document.body.style.cursor = 'crosshair';
  };

  const handleMouseDown = (e) => {
    if (!isDrawingGroup) return;
    const rect = whiteboardRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    setTempGroup({ startX, startY, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawingGroup || !tempGroup) return;
    const rect = whiteboardRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    setTempGroup(prev => ({
      ...prev,
      width: currentX - prev.startX,
      height: currentY - prev.startY
    }));
  };

  const handleMouseUp = () => {
    if (!isDrawingGroup || !tempGroup) return;
    setIsDrawingGroup(false);
    document.body.style.cursor = 'default';
    const newGroup = {
      id: `group-${nextId}`,
      x: tempGroup.startX,
      y: tempGroup.startY,
      width: Math.abs(tempGroup.width),
      height: Math.abs(tempGroup.height)
    };
    setGroups(prev => [...prev, newGroup]);
    
    // Determine which notes are fully in the new group
    const notesInNewGroup = notes.filter(note => isNoteInGroup(note, newGroup));
    setGroupedNotes(prev => ({
      ...prev,
      [newGroup.id]: notesInNewGroup.map(note => note.id)
    }));

    setTempGroup(null);
    setNextId(prev => prev + 1);
  };

  const handleGroupDrag = useCallback((id, newX, newY) => {
    setGroups(prevGroups => {
      const updatedGroups = prevGroups.map(group => 
        group.id === id ? { ...group, x: newX, y: newY } : group
      );
      
      // Move the notes that are in the group
      const groupNoteIds = groupedNotes[id] || [];
      const group = prevGroups.find(g => g.id === id);
      if (group) {
        const dx = newX - group.x;
        const dy = newY - group.y;
        setNotes(prevNotes => prevNotes.map(note => {
          if (groupNoteIds.includes(note.id)) {
            return { ...note, x: note.x + dx, y: note.y + dy };
          }
          return note;
        }));
      }
      
      return updatedGroups;
    });
  }, [groupedNotes]);

  const isNoteInGroup = (note, group) => {
    const noteRight = note.x + 150; // Assuming note width is 150px
    const noteBottom = note.y + 150; // Assuming note height is 150px
    const groupRight = group.x + group.width;
    const groupBottom = group.y + group.height;

    return note.x >= group.x &&
           noteRight <= groupRight &&
           note.y >= group.y &&
           noteBottom <= groupBottom;
  };

  return (
    <div 
      ref={whiteboardRef}
      className="whiteboard"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Toolbar onAddNote={addNewNote} onAddGroup={handleAddGroup} />
      {groups.map(group => (
        <GroupElement
          key={group.id}
          {...group}
          onDrag={handleGroupDrag}
          groupedNotes={notes.filter(note => (groupedNotes[group.id] || []).includes(note.id))}
        />
      ))}
      {notes.map(note => (
        <StickyNote
          key={note.id}
          {...note}
          onChange={(id, text) => handleNoteChange(id, text)}
          onDrag={(id, x, y) => handleNoteDrag(id, x, y)}
        />
      ))}
      {tempGroup && (
        <div
          style={{
            position: 'absolute',
            left: `${tempGroup.startX}px`,
            top: `${tempGroup.startY}px`,
            width: `${tempGroup.width}px`,
            height: `${tempGroup.height}px`,
            border: '2px dotted rgba(150, 150, 150, 0.5)',
            backgroundColor: 'rgba(200, 200, 200, 0.2)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

export default React.memo(Whiteboard);