import React, { useState, useRef, useEffect, useCallback } from 'react';

const GroupElement = ({ id, x, y, width, height, onDrag, onResize, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const groupRef = useRef(null);
  const dragStartRef = useRef({ x, y });
  const resizeStartRef = useRef({ width, height });
  const mouseStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e) => {
    if (e.target.classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeHandle(e.target.dataset.handle);
      resizeStartRef.current = { width, height };
      mouseStartRef.current = { x: e.clientX, y: e.clientY };
    } else {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - x, y: e.clientY - y };
    }
  }, [x, y, width, height]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      onDrag(id, newX, newY);
    } else if (isResizing) {
      const dx = e.clientX - mouseStartRef.current.x;
      const dy = e.clientY - mouseStartRef.current.y;
      let newWidth = resizeStartRef.current.width;
      let newHeight = resizeStartRef.current.height;
      let newX = x;
      let newY = y;

      if (resizeHandle.includes('e')) newWidth += dx;
      if (resizeHandle.includes('s')) newHeight += dy;
      if (resizeHandle.includes('w')) {
        newWidth -= dx;
        newX += dx;
      }
      if (resizeHandle.includes('n')) {
        newHeight -= dy;
        newY += dy;
      }

      onResize(id, newX, newY, newWidth, newHeight);
    }
  }, [id, isDragging, isResizing, onDrag, onResize, resizeHandle, x, y]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
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
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={groupRef}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: 'rgba(200, 200, 200, 0.2)',
        border: '2px dotted rgba(150, 150, 150, 0.5)',
        zIndex: 0,
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
      <div className="resize-handle nw" data-handle="nw" style={{cursor: 'nwse-resize'}}></div>
      <div className="resize-handle ne" data-handle="ne" style={{cursor: 'nesw-resize'}}></div>
      <div className="resize-handle sw" data-handle="sw" style={{cursor: 'nesw-resize'}}></div>
      <div className="resize-handle se" data-handle="se" style={{cursor: 'nwse-resize'}}></div>
    </div>
  );
};

export default React.memo(GroupElement);