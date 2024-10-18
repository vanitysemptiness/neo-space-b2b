import { fabric } from 'fabric';

class Square {
  static handleMouseDown(canvas, pointer, color) {
    const square = new fabric.Rect({
      left: pointer.x,
      top: pointer.y,
      width: 0,
      height: 0,
      fill: color,
      selectable: false,
      evented: false,
    });
    canvas.add(square);
    return square;
  }

  static handleMouseMove(canvas, square, pointer, startPoint) {
    if (!square) return;
    const width = Math.abs(startPoint.x - pointer.x);
    const height = Math.abs(startPoint.y - pointer.y);
    square.set({
      left: Math.min(startPoint.x, pointer.x),
      top: Math.min(startPoint.y, pointer.y),
      width: width,
      height: height
    });
    canvas.renderAll();
  }

  static handleMouseUp(canvas, square) {
    if (!square) return;
    square.set({
      selectable: true,
      evented: true,
    });
    canvas.setActiveObject(square);
    canvas.renderAll();
  }
}

export default Square;