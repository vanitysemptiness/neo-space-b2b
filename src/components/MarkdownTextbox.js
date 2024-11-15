import React, { useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';

class MarkdownNode extends fabric.Group {
  static type = 'markdownNode';

  constructor(options = {}) {
    const containerDiv = document.createElement('div');
    containerDiv.className = 'node node-text';
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'node-name';
    nameDiv.textContent = 'Text';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'node-text-content';
    contentDiv.contentEditable = 'true';
    contentDiv.innerHTML = options.text || 'Enter text here...';
    
    containerDiv.appendChild(nameDiv);
    containerDiv.appendChild(contentDiv);
    
    // Convert the HTML element to a Fabric image
    const fabricImage = new fabric.Image(containerDiv, {
      left: options.left || 0,
      top: options.top || 0,
      width: options.width || 300,
      height: options.height || 200,
      originX: 'left',
      originY: 'top'
    });

    // Initialize as a group with the image
    super([fabricImage], {
      ...options,
      subTargetCheck: true
    });

    this.containerElement = containerDiv;
    this.contentElement = contentDiv;
    
    // Set up event handlers
    this._initializeEventListeners();
  }

  _initializeEventListeners() {
    if (!this.contentElement) return;

    this.contentElement.addEventListener('input', () => {
      this._updateSize();
      if (this.canvas) {
        this.canvas.renderAll();
      }
    });

    this.contentElement.addEventListener('blur', () => {
      if (this.canvas) {
        this.canvas.renderAll();
      }
    });
  }

  _updateSize() {
    const padding = 40; // Account for padding and borders
    this.set({
      width: Math.max(300, this.contentElement.scrollWidth + padding),
      height: Math.max(100, this.contentElement.scrollHeight + padding)
    });
  }

  toObject() {
    return {
      ...super.toObject(),
      text: this.contentElement.innerHTML
    };
  }

  static fromObject(object, callback) {
    const newInstance = new MarkdownNode({
      ...object,
      text: object.text
    });
    callback(newInstance);
  }
}

// Register the custom class with Fabric
fabric.MarkdownNode = MarkdownNode;
fabric.MarkdownNode.fromObject = MarkdownNode.fromObject;

const MarkdownTextbox = ({ fabricCanvas, currentTool, setCurrentTool }) => {
  const activeNodeRef = useRef(null);
  const startPointRef = useRef(null);

  const finishDrawing = useCallback((node) => {
    if (!fabricCanvas || !node) return;
    
    if (node.width > 50 && node.height > 50) {
      node.set({
        selectable: true,
        evented: true,
      });
      fabricCanvas.setActiveObject(node);
      node.contentElement.focus();
    } else {
      fabricCanvas.remove(node);
    }
    
    fabricCanvas.renderAll();
    setCurrentTool('select');
  }, [fabricCanvas, setCurrentTool]);

  useEffect(() => {
    if (!fabricCanvas) return;
    
    const handleMouseDown = (e) => {
      if (currentTool !== 'markdown') return;
      
      const pointer = fabricCanvas.getPointer(e.e);
      startPointRef.current = pointer;
      
      activeNodeRef.current = new MarkdownNode({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        selectable: false,
        evented: false,
      });
      
      fabricCanvas.add(activeNodeRef.current);
      fabricCanvas.renderAll();
    };

    const handleMouseMove = (e) => {
      if (!activeNodeRef.current || currentTool !== 'markdown') return;
      
      const pointer = fabricCanvas.getPointer(e.e);
      const width = Math.abs(pointer.x - startPointRef.current.x);
      const height = Math.abs(pointer.y - startPointRef.current.y);
      
      activeNodeRef.current.set({
        width: Math.max(width, 300),
        height: Math.max(height, 100)
      });
      
      fabricCanvas.renderAll();
    };

    const handleMouseUp = () => {
      if (!activeNodeRef.current || currentTool !== 'markdown') return;
      
      finishDrawing(activeNodeRef.current);
      activeNodeRef.current = null;
      startPointRef.current = null;
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);
    
    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
    };
  }, [fabricCanvas, currentTool, finishDrawing]);

  return null;
};

export default MarkdownTextbox;