import { fabric } from 'fabric';

class Textbox {
  static activeTextbox = null;

  static handleMouseDown(canvas, pointer, color) {
    this.activeTextbox = new fabric.Textbox('', {
      left: pointer.x,
      top: pointer.y,
      fontSize: 20,
      fill: color,
      width: 150,
      selectable: false,
      evented: false,
    });
    canvas.add(this.activeTextbox);
  }

  static handleMouseUp(canvas) {
    if (!this.activeTextbox) return;
    this.activeTextbox.set({
      selectable: true,
      evented: true,
    });
    canvas.setActiveObject(this.activeTextbox);
    this.activeTextbox.enterEditing();
    canvas.renderAll();
    this.activeTextbox = null;
  }
}

export default Textbox;