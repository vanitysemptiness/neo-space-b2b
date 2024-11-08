export class CanvasError extends Error {
    constructor(message) {
      super(message);
      this.name = 'CanvasError';
    }
  }
  
  export class CanvasReferenceError extends CanvasError {
    constructor() {
      super('Canvas reference is null. Ensure fabricCanvas is properly initialized and passed down.');
      this.name = 'CanvasReferenceError';
    }
  }