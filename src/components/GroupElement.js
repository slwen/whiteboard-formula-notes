import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDrag } from 'react-dnd';

const GroupElement = ({ id, x, y, width, height, onDrag, onResize }) => {
  const groupRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'GROUP',
    item: { id, type: 'GROUP' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleMouseDown = useCallback((e) => {
    if (isResizing) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startGroupX = x;
    const startGroupY = y;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const newX = startGroupX + deltaX;
      const newY = startGroupY + deltaY;
      onDrag(id, newX, newY);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [id, x, y, onDrag, isResizing]);

  const handleResize = useCallback((e, corner) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;
    const startGroupX = x;
    const startGroupY = y;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newX = startGroupX;
      let newY = startGroupY;
      let newWidth = startWidth;
      let newHeight = startHeight;

      switch (corner) {
        case 'top-left':
          newX = startGroupX + deltaX;
          newY = startGroupY + deltaY;
          newWidth = startWidth - deltaX;
          newHeight = startHeight - deltaY;
          break;
        case 'top-right':
          newY = startGroupY + deltaY;
          newWidth = startWidth + deltaX;
          newHeight = startHeight - deltaY;
          break;
        case 'bottom-left':
          newX = startGroupX + deltaX;
          newWidth = startWidth - deltaX;
          newHeight = startHeight + deltaY;
          break;
        case 'bottom-right':
          newWidth = startWidth + deltaX;
          newHeight = startHeight + deltaY;
          break;
      }

      // Ensure minimum size
      if (newWidth < 50) {
        newWidth = 50;
        if (corner === 'top-left' || corner === 'bottom-left') {
          newX = startGroupX + startWidth - 50;
        }
      }
      if (newHeight < 50) {
        newHeight = 50;
        if (corner === 'top-left' || corner === 'top-right') {
          newY = startGroupY + startHeight - 50;
        }
      }

      onResize(id, newX, newY, newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [id, x, y, width, height, onResize]);

  preview(groupRef);

  return (
    <div
      ref={groupRef}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: `${width}px`,
        height: `${height}px`,
        border: '2px solid #ccc',
        backgroundColor: 'rgba(204, 204, 204, 0.2)',
        opacity: isDragging ? 0.5 : 1,
        cursor: isResizing ? 'auto' : 'move',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Resize handles */}
      <div
        style={{
          position: 'absolute',
          top: '-5px',
          left: '-5px',
          width: '10px',
          height: '10px',
          backgroundColor: '#ccc',
          cursor: 'nwse-resize',
        }}
        onMouseDown={(e) => handleResize(e, 'top-left')}
      />
      <div
        style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          width: '10px',
          height: '10px',
          backgroundColor: '#ccc',
          cursor: 'nesw-resize',
        }}
        onMouseDown={(e) => handleResize(e, 'top-right')}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-5px',
          left: '-5px',
          width: '10px',
          height: '10px',
          backgroundColor: '#ccc',
          cursor: 'nesw-resize',
        }}
        onMouseDown={(e) => handleResize(e, 'bottom-left')}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-5px',
          right: '-5px',
          width: '10px',
          height: '10px',
          backgroundColor: '#ccc',
          cursor: 'nwse-resize',
        }}
        onMouseDown={(e) => handleResize(e, 'bottom-right')}
      />
    </div>
  );
};

export default React.memo(GroupElement);