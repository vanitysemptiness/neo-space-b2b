import { fabric } from 'fabric';
import DrawTool from './Tools/DrawTool';
import SelectTool from './Tools/SelectTool';
import SquareTool from './Tools/SquareTool';
import HandTool from './Tools/HandTool';
import { CameraController } from './Camera';

class CanvasState {
  constructor(fabricCanvas) {
    this.fabricCanvas = fabricCanvas;
    this.currentTool = null;
    this.tools = {
      draw: new DrawTool(),
      select: new SelectTool(),
      square: new SquareTool(),
      hand: new HandTool(),
    };
    this.cameraController = new CameraController(this);
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.fabricCanvas.on('mouse:down', this.handleMouseDown.bind(this));
    this.fabricCanvas.on('mouse:move', this.handleMouseMove.bind(this));
    this.fabricCanvas.on('mouse:up', this.handleMouseUp.bind(this));
    this.fabricCanvas.on('mouse:wheel', this.handleWheel.bind(this));
  }

  setCurrentTool(toolName) {
    if (this.currentTool) {
      this.currentTool.deactivate(this.fabricCanvas);
    }
    this.currentTool = this.tools[toolName];
    this.currentTool.activate(this.fabricCanvas);
    this.fabricCanvas.isDrawingMode = toolName === 'draw';
    this.fabricCanvas.selection = toolName === 'select';
  }

  setColor(color) {
    if (this.fabricCanvas.freeDrawingBrush) {
      this.fabricCanvas.freeDrawingBrush.color = color;
    }
  }

  handleMouseDown(event) {
    if (this.currentTool) {
      this.currentTool.handleMouseDown(event, this.fabricCanvas);
    }
  }

  handleMouseMove(event) {
    if (this.currentTool) {
      this.currentTool.handleMouseMove(event, this.fabricCanvas);
    }
  }

  handleMouseUp(event) {
    if (this.currentTool) {
      this.currentTool.handleMouseUp(event, this.fabricCanvas);
    }
  }

  handleWheel(event) {
    this.cameraController.handleWheel(event);
  }

  saveToLocalStorage() {
    const json = this.fabricCanvas.toJSON();
    localStorage.setItem('myDrawingAppCanvas', JSON.stringify(json));
  }

  loadFromLocalStorage() {
    const saved = localStorage.getItem('myDrawingAppCanvas');
    if (saved) {
      this.fabricCanvas.loadFromJSON(JSON.parse(saved), this.fabricCanvas.renderAll.bind(this.fabricCanvas));
    }
  }

  clearCanvas() {
    this.fabricCanvas.clear();
    this.saveToLocalStorage();
  }

  addFileToCanvas(file) {
    if (file.type.includes('image')) {
      fabric.Image.fromURL(URL.createObjectURL(file), (img) => {
        img.scaleToWidth(100);
        this.fabricCanvas.add(img);
        this.fabricCanvas.renderAll();
        this.saveToLocalStorage();
      });
    } else {
      const text = new fabric.Text(file.name, {
        left: 100,
        top: 100,
        fill: '#000000'
      });
      this.fabricCanvas.add(text);
      this.fabricCanvas.renderAll();
      this.saveToLocalStorage();
    }
  }

  isObjectSelected() {
    return !!this.fabricCanvas.getActiveObject();
  }
}

export default CanvasState;