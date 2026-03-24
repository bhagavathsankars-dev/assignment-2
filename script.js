const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSizeInput = document.getElementById('brushSize');


let currentTool = 'brush';
let isDrawing = false;
let startX = 0, startY = 0;
let snapshot = null;

function resizeCanvas()
 {
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
  });
});


function getPos(e)
 {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

canvas.addEventListener('mousedown', e =>
     {
  isDrawing = true;
  const pos = getPos(e);
  startX = pos.x;
  startY = pos.y;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
});

canvas.addEventListener('mousemove', e =>
     {
  if (!isDrawing) return;
 const { x, y } = getPos(e);
  const color = colorPicker.value;
  const size = brushSizeInput.value;

  ctx.strokeStyle = currentTool === 'eraser'
    ? (document.body.dataset.theme === 'dark' ? '#111' : 'white')
    : color;
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

    case 'square':
         {
      ctx.putImageData(snapshot, 0, 0);
      const side = Math.min(Math.abs(x - startX), Math.abs(y - startY));
      const signX = x > startX ? 1 : -1;
      const signY = y > startY ? 1 : -1;
      ctx.strokeRect(startX, startY, side * signX, side * signY);
      break;
    }


    case 'circle':
         {
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

canvas.addEventListener('mouseup', () =>
     {
  isDrawing = false;
  localStorage.setItem('canvas', canvas.toDataURL());
});

canvas.addEventListener('mouseleave', () =>
     {
  isDrawing = false;
});

document.getElementById('addImage').addEventListener('click', () =>
     {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = 'https://picsum.photos/200/200?random=' + Math.random();
  img.onload = () => {
    ctx.drawImage(img, 50, 50);
    localStorage.setItem('canvas', canvas.toDataURL());
  };
});

document.getElementById('clearCanvas').addEventListener('click', () =>
     {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  localStorage.removeItem('canvas');
});


document.getElementById('darkToggle').addEventListener('click', () =>
     {
  document.body.dataset.theme = document.body.dataset.theme === 'dark' ? '' : 'dark';
}).

window.addEventListener('load', () =>
     {
  const saved = localStorage.getItem('canvas');
  if (saved) {
    const img = new Image();
    img.src = saved;
    img.onload = () => ctx.drawImage(img, 0, 0);
  }

});