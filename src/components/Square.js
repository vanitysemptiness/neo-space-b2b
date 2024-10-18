import { fabric } from 'fabric';

class Square {
  static activeSquare = null;

  static handleMouseDown(canvas, pointer, color) {
    this.activeSquare = new fabric.Rect({
      left: pointer.x,
      top: pointer.y,
      width: 0,
      height: 0,
      fill: color,
      selectable: false,
      evented: false,
    });
    canvas.add(this.activeSquare);
  }

  static handleMouseMove(canvas, pointer) {
    if (!this.activeSquare) return;
    this.activeSquare.set({
      width: Math.abs(pointer.x - this.activeSquare.left),
      height: Math.abs(pointer.y - this.activeSquare.top),
      left: Math.min(pointer.x, this.activeSquare.left),
      top: Math.min(pointer.y, this.activeSquare.top)
    });
    canvas.renderAll();
  }

  static handleMouseUp(canvas) {
    if (!this.activeSquare) return;
    this.activeSquare.set({
      selectable: true,
      evented: true,
    });
    canvas.setActiveObject(this.activeSquare);
    canvas.renderAll();
    this.activeSquare = null;
  }
}

export default Square;