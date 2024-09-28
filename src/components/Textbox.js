import { fabric } from 'fabric';

let textboxRef = null;

const startDrawing = (canvas, pointer, color) => {
  textboxRef = new fabric.Textbox('', {
    left: pointer.x,
    top: pointer.y,
    width: 0,
    height: 0,
    fontSize: 20,
    fill: '#000000',
    backgroundColor: color,
    selectable: false,
    evented: false,
  });
  canvas.add(textboxRef);
};

const drawTextbox = (canvas, startPoint, pointer) => {
  if (!textboxRef) return;

  const left = Math.min(startPoint.x, pointer.x);
  const top = Math.min(startPoint.y, pointer.y);
  const width = Math.abs(startPoint.x - pointer.x);
  const height = Math.abs(startPoint.y - pointer.y);

  textboxRef.set({
    left: left,
    top: top,
    width: width,
    height: height
  });
  canvas.renderAll();
};

const finishDrawing = (canvas) => {
  if (!textboxRef) return;

  textboxRef.set({
    selectable: true,
    evented: true,
  });
  canvas.setActiveObject(textboxRef);
  canvas.renderAll();
  textboxRef = null;
};

export const handleTextboxMode = {
  mousedown: startDrawing,
  mousemove: drawTextbox,
  mouseup: finishDrawing,
};