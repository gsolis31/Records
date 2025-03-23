const rose = document.getElementById('rose');
const colorButton = document.getElementById('colorButton');

const colors = [
    'hue-rotate(0deg)',    // Original
    'hue-rotate(60deg)',   // Yellow
    'hue-rotate(120deg)',  // Green
    'hue-rotate(180deg)',  // Cyan
    'hue-rotate(240deg)',  // Blue
    'hue-rotate(300deg)',  // Purple
    'hue-rotate(360deg)',  // Back to original
];

let currentColorIndex = 0;

colorButton.addEventListener('click', () => {
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    rose.style.filter = colors[currentColorIndex];
}); 