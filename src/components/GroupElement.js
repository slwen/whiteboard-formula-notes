import React, { useState, useRef, useEffect, useCallback } from 'react';

const GroupElement = ({ id, x, y, width, height, onDrag, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const groupRef = useRef(null);
  const dragRef = useRef({ x, y });
  const frameRef = useRef();

  useEffect(() => {
    dragRef.current = { x, y };
    groupRef.current.style.transform = `translate(${x}px, ${y}px)`;
  }, [x, y]);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    const rect = groupRef.current.getBoundingClientRect();
    dragRef.current.offsetX = e.clientX - rect.left;
    dragRef.current.offsetY = e.clientY - rect.top;
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const newX = e.clientX - dragRef.current.offsetX;
        const newY = e.clientY - dragRef.current.offsetY;
        dragRef.current.x = newX;
        dragRef.current.y = newY;
        groupRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
      });
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDrag(id, dragRef.current.x, dragRef.current.y);
    }
  }, [isDragging, id, onDrag]);

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
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={groupRef}
      style={{
        position: 'absolute',
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: 'rgba(200, 200, 200, 0.15)',
        border: '2px dotted rgba(150, 150, 150, 0.45)',
        zIndex: 0,
        transform: `translate(${x}px, ${y}px)`,
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
};

export default React.memo(GroupElement);