import { fabric } from 'fabric';
import { CanvasReferenceError } from './CanvasError';
import { SquareDrawer } from './Square';

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
        SquareDrawer.drawSquareLLM(this.fabricCanvas, command.parameters);
        return { success: true, message: 'Square drawn successfully' };
      }
      default:
        throw new Error(`Unknown command: ${command.name}`);
    }
  }

  executeLLMResponse(response) {
    try {
      const command = JSON.parse(response);
      
      if (!command.name || !command.parameters) {
        return { success: false, error: 'Invalid command structure' };
      }

      return this.executeCommand(command);
    } catch (error) {
      return { success: false, error: error.message, isConversational: true };
    }
  }
}