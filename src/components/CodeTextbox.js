import { fabric } from 'fabric';

class CodeTextbox extends fabric.Group {
  static type = 'codeTextbox';

  constructor(options = {}) {
    // Create the background rectangle
    const background = new fabric.Rect({
      width: options.width || 200,
      height: options.height || 100,
      fill: '#ffffff',
      stroke: '#8b8bf4',
      strokeWidth: 2,
      strokeUniform: true
    });

    // Create the line number background
    const lineNumBackground = new fabric.Rect({
      left: 0,
      top: 0,
      width: 30,
      height: 24, // Fixed height for text area
      fill: '#f0f0f0',
    });

    // Create the line number text
    const lineNumber = new fabric.Text('1', {
      left: 20,
      top: 4,
      fontSize: 14,
      fontFamily: 'Consolas, Monaco, monospace',
      fill: '#666666',
      textAlign: 'right',
      selectable: false,
      evented: false
    });

    // Create the editable textbox
    const textbox = new fabric.Textbox('', {
      left: 35, // Offset from line numbers
      top: 4,
      width: (options.width || 200) - 40, // Account for line number area
      fontSize: 14,
      fontFamily: 'Consolas, Monaco, monospace',
      fill: '#000000',
      backgroundColor: 'transparent',
      fixedWidth: true,
      height: 24,
      lineHeight: 1,
      splitByGrapheme: false,
      selectable: true,
      evented: true
    });

    // Initialize the group with all elements
    const objects = [background, lineNumBackground, lineNumber, textbox];
    super(objects, {
      ...options,
      selectable: false,
      evented: false
    });

    this.background = background;
    this.lineNumBackground = lineNumBackground;
    this.lineNumber = lineNumber;
    this.textbox = textbox;

    this._initializeEventListeners();
  }

  _initializeEventListeners() {
    this.textbox.on('changed', () => {
      const lines = this.textbox.text.split('\n').length;
      const lineNumbers = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
      this.lineNumber.set('text', lineNumbers);
      this.canvas?.renderAll();
    });
  }

  _updateTextboxWidth() {
    this.textbox.set({
      width: this.background.width - 40,
    });
  }

  setDimensions({ width, height }) {
    this.background.set({ width, height });
    this._updateTextboxWidth();
    this.canvas?.renderAll();
  }
}

// Register the new type with Fabric
fabric.CodeTextbox = CodeTextbox;
fabric.CodeTextbox.fromObject = function(object, callback) {
  return callback(new fabric.CodeTextbox(object));
};

export default CodeTextbox;