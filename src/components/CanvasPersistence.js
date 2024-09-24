import { fabric } from 'fabric';

const STORAGE_KEY = 'myDrawingAppCanvas';

export const saveToLocalStorage = (canvas) => {
  const json = canvas.toJSON();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
};

export const loadFromLocalStorage = (canvas) => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    canvas.loadFromJSON(JSON.parse(saved), canvas.renderAll.bind(canvas));
  }
};

export const clearCanvas = (canvas) => {
  canvas.clear();
  saveToLocalStorage(canvas);
};

export const setupCanvasPersistence = (canvas) => {
  canvas.on('object:modified', () => saveToLocalStorage(canvas));
  canvas.on('path:created', () => saveToLocalStorage(canvas));
};

export const addFileToCanvasWithPersistence = (file, canvas) => {
  if (file.type.includes('image')) {
    fabric.Image.fromURL(URL.createObjectURL(file), (img) => {
      img.scaleToWidth(100);
      canvas.add(img);
      canvas.renderAll();
      saveToLocalStorage(canvas);
    });
  } else {
    // Handle non-image files (you can expand this part as needed)
    const text = new fabric.Text(file.name, {
      left: 100,
      top: 100,
      fill: '#000000'
    });
    canvas.add(text);
    canvas.renderAll();
    saveToLocalStorage(canvas);
  }
};