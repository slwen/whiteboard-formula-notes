import React, { useState, useCallback } from 'react';
import StickyNote from './StickyNote';
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
  const [nextId, setNextId] = useState(7); // Assuming 6 initial notes

  const handleNoteChange = useCallback((id, newText) => {
    setNotes(prevNotes => prevNotes.map(note => 
      note.id === id ? { ...note, text: newText } : note
    ));
  }, []);

  const handleNoteDrag = useCallback((id, x, y) => {
    setNotes(prevNotes => prevNotes.map(note => 
      note.id === id ? { ...note, x, y } : note
    ));
  }, []);

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

  return (
    <div className="whiteboard">
      <Toolbar onAddNote={addNewNote} />
      {notes.map(note => (
        <StickyNote
          key={note.id}
          {...note}
          onChange={(text) => handleNoteChange(note.id, text)}
          onDrag={(x, y) => handleNoteDrag(note.id, x, y)}
        />
      ))}
    </div>
  );
};

export default Whiteboard;