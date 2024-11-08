import { fabric } from 'fabric';
import { CanvasReferenceError } from './CanvasError';

export class LLMCanvasInterface {
  constructor(fabricCanvas) {
    if (!fabricCanvas) {
      throw new CanvasReferenceError();
    }
    this.fabricCanvas = fabricCanvas;
    this.currentResponse = '';
  }

  executeCommand(command) {
    console.log('Executing command:', command);
    
    switch (command.name) {
      case 'drawSquare': {
        const { x, y, size, color } = command.parameters;
        const square = new fabric.Rect({
          left: x,
          top: y,
          width: size,
          height: size,
          fill: color || '#000000',
          originX: 'center',
          originY: 'center'
        });
        this.fabricCanvas.add(square);
        this.fabricCanvas.renderAll();
        return { success: true, message: 'Square drawn successfully' };
      }
      default:
        throw new Error(`Unknown command: ${command.name}`);
    }
  }

  executeLLMResponse(response) {
    try {
      // Try to parse as JSON
      const command = JSON.parse(response);
      
      if (!command.name || !command.parameters) {
        return { success: false, error: 'Invalid command structure' };
      }

      return this.executeCommand(command);
    } catch (error) {
      // If it's not valid JSON, it's probably a conversational response
      return { success: false, error: error.message, isConversational: true };
    }
  }
}