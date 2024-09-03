import React, { useState, useRef, useEffect } from 'react';

const StickyNote = ({ id, text, color, x, y, onChange, onDrag, isNew }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x, y });
  const noteRef = useRef(null);
  const textareaRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isNew && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isNew]);

  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  const handleMouseDown = (e) => {
    const rect = noteRef.current.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - offsetRef.current.x;
    const newY = e.clientY - offsetRef.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position.x, position.y]);

  return (
    <div
      ref={noteRef}
      className="sticky-note"
      style={{
        backgroundColor: color,
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '150px',
        height: '150px',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        style={{ 
          backgroundColor: 'transparent', 
          border: 'none', 
          resize: 'none',
          width: '100%',
          height: '100%',
          cursor: 'text'
        }}
      />
    </div>
  );
};

export default StickyNote;