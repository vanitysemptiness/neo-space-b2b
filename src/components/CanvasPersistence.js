import { fabric } from 'fabric';
import { fabricGif } from './fabricGif';

const STORAGE_KEY = 'myDrawingAppCanvas';

export const saveToLocalStorage = (canvas) => {
  const json = canvas.toJSON(['gifSrc', 'isGif']);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
};

export const loadFromLocalStorage = async (canvas) => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    await new Promise((resolve) => {
      canvas.loadFromJSON(JSON.parse(saved), async () => {
        const objects = canvas.getObjects();
        for (let i = 0; i < objects.length; i++) {
          const obj = objects[i];
          if (obj.isGif) {
            const gifObj = await fabricGif(obj.gifSrc);
            canvas.remove(obj);
            canvas.add(gifObj);
            gifObj.set({
              left: obj.left,
              top: obj.top,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
              angle: obj.angle,
            });
          }
        }
        canvas.renderAll();
        resolve();
      });
    });
  }
};

export const clearCanvas = (canvas) => {
  canvas.clear();
  saveToLocalStorage(canvas);
};

export const setupCanvasPersistence = (canvas) => {
  canvas.on('object:modified', () => saveToLocalStorage(canvas));
  canvas.on('object:added', () => saveToLocalStorage(canvas));
  canvas.on('object:removed', () => saveToLocalStorage(canvas));
};

export const addFileToCanvasWithPersistence = async (file, canvas) => {
  if (file.type === 'image/gif') {
    const gif = await fabricGif(file);
    if (!gif.error) {
      canvas.add(gif);
      canvas.renderAll();
      saveToLocalStorage(canvas);
    } else {
      console.error('Error loading GIF:', gif.error);
    }
  } else if (file.type.includes('image')) {
    fabric.Image.fromURL(URL.createObjectURL(file), (img) => {
      img.scaleToWidth(100);
      canvas.add(img);
      canvas.renderAll();
      saveToLocalStorage(canvas);
    });
  } else {
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