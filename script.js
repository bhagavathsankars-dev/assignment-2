const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSizeInput = document.getElementById('brushSize');
 
let currentTool = 'brush';
let isDrawing = false;
let startX = 0, startY = 0;
let snapshot = null;
const eraserCursor = document.createElement('div');
eraserCursor.id = 'eraserCursor';
document.body.appendChild(eraserCursor);
 
function resizeCanvas() {
  const container = document.querySelector('.canvas-container');
  const padding = 40;
  const w = container.clientWidth - padding * 2;
  const h = container.clientHeight - padding * 2;
 
  const imgData = canvas.toDataURL();
  canvas.width = w;
  canvas.height = h;
 
  const img = new Image();
  img.src = imgData;
  img.onload = () => ctx.drawImage(img, 0, 0);
}
 
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
 
const toolButtons = document.querySelectorAll('.tool');
toolButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    toolButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = btn.id;
    eraserCursor.style.display = currentTool === 'eraser' ? 'block' : 'none';
    canvas.style.cursor = currentTool === 'eraser' ? 'none' : 'crosshair';
  });
});
 
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}
 
canvas.addEventListener('mousemove', e => {
  if (currentTool === 'eraser') {
    const size = parseInt(brushSizeInput.value);
    eraserCursor.style.width = size + 'px';
    eraserCursor.style.height = size + 'px';
    eraserCursor.style.left = (e.clientX - size / 2) + 'px';
    eraserCursor.style.top = (e.clientY - size / 2) + 'px';
  }
});
canvas.addEventListener('mouseleave', () => {
  eraserCursor.style.display = 'none';
});
canvas.addEventListener('mouseenter', () => {
  if (currentTool === 'eraser') eraserCursor.style.display = 'block';
});
 

let imageRectMode = false;
let imageSnapshot = null;
 
document.getElementById('addImage').addEventListener('click', () => {
  imageRectMode = true;
  canvas.style.cursor = 'crosshair';
  canvas.title = 'Draw a rectangle to place the image';
});
 
function drawImagePreviewRect(x1, y1, x2, y2) {
  ctx.putImageData(imageSnapshot, 0, 0);
  ctx.save();
  ctx.strokeStyle = '#4285f4';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 3]);
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  ctx.restore();
}
 
canvas.addEventListener('mousedown', e => {
  const pos = getPos(e);
  startX = pos.x;
  startY = pos.y;
 
  if (imageRectMode) {
    imageSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    isDrawing = true;
    return;
  }
 
  isDrawing = true;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
});
 
canvas.addEventListener('mousemove', e => {
  if (!isDrawing) return;
  const { x, y } = getPos(e);
  const color = colorPicker.value;
  const size = parseInt(brushSizeInput.value);
 
  if (imageRectMode) {
    drawImagePreviewRect(startX, startY, x, y);
    return;
  }

  if (currentTool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = color;
  }
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
 
  switch (currentTool) {
    case 'brush':
    case 'eraser':
      ctx.lineTo(x, y);
      ctx.stroke();
      break;
 
    case 'rectangle':
      ctx.putImageData(snapshot, 0, 0);
      ctx.strokeRect(startX, startY, x - startX, y - startY);
      break;
 
    case 'square': {
      ctx.putImageData(snapshot, 0, 0);
      const side = Math.min(Math.abs(x - startX), Math.abs(y - startY));
      const signX = x > startX ? 1 : -1;
      const signY = y > startY ? 1 : -1;
      ctx.strokeRect(startX, startY, side * signX, side * signY);
      break;
    }
 
    case 'circle': {
      ctx.putImageData(snapshot, 0, 0);
      const radius = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
 
    case 'triangle':
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      ctx.moveTo(startX + (x - startX) / 2, startY);
      ctx.lineTo(startX, y);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.stroke();
      break;
 
    case 'line':
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.stroke();
      break;
  }
 
});
 
canvas.addEventListener('mouseup', e => {
  if (imageRectMode && isDrawing) {
    const { x, y } = getPos(e);
    const w = Math.abs(x - startX);
    const h = Math.abs(y - startY);
    const left = Math.min(startX, x);
    const top = Math.min(startY, y);
 
    if (w > 10 && h > 10) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `https://picsum.photos/${Math.round(w)}/${Math.round(h)}?random=${Math.random()}`;
      img.onload = () => {
        ctx.putImageData(imageSnapshot, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img, left, top, w, h);
        localStorage.setItem('canvas', canvas.toDataURL());
      };
    } else {
      ctx.putImageData(imageSnapshot, 0, 0);
    }
 
    imageRectMode = false;
    isDrawing = false;
    canvas.style.cursor = 'crosshair';
    canvas.title = '';
    return;
  }
 
  isDrawing = false;
  ctx.globalCompositeOperation = 'source-over';
  localStorage.setItem('canvas', canvas.toDataURL());
});
 
canvas.addEventListener('mouseleave', () => {
  isDrawing = false;
});
 
document.getElementById('clearCanvas').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  localStorage.removeItem('canvas');
});
 
document.getElementById('darkToggle').addEventListener('click', () => {
  document.body.dataset.theme = document.body.dataset.theme === 'dark' ? '' : 'dark';
});
 
window.addEventListener('load', () => {
  const saved = localStorage.getItem('canvas');
  if (saved) {
    const img = new Image();
    img.src = saved;
    img.onload = () => ctx.drawImage(img, 0, 0);
  }
});
