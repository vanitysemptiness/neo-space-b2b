import { fabric } from 'fabric';

class Textbox {
  static handleMouseDown(canvas, pointer, color) {
    const textbox = new fabric.Textbox('', {
      left: pointer.x,
      top: pointer.y,
      fontSize: 20,
      fill: color,
      width: 150,
      selectable: false,
      evented: false,
    });
    canvas.add(textbox);
    return textbox;
  }

  static handleMouseUp(canvas, textbox) {
    if (!textbox) return;
    textbox.set({
      selectable: true,
      evented: true,
    });
    canvas.setActiveObject(textbox);
    textbox.enterEditing();
    canvas.renderAll();
  }
}

export default Textbox;