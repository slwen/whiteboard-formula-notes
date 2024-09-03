export const stickyNoteColors = [
  '#FFF7C0',  // Light yellow
  '#E0C1F4',  // Light purple
  '#BAFFC9',  // Light green
  '#BAE1FF',  // Light blue
  '#FFD3BA'   // Light orange
];

export const getRandomColor = () => {
  return stickyNoteColors[Math.floor(Math.random() * stickyNoteColors.length)];
};