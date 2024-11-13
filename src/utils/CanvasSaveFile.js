import { fabric } from 'fabric';

export const ElementType = {
  SQUARE: 'square',
  TEXTBOX: 'textbox',
  LINE: 'line',
  FILE: 'file',
  IMAGE: 'image',
  PATH: 'path'
};

export class CanvasSaveFile {
  static serializeCanvas(canvas) {
    if (!canvas) {
      throw new Error('Canvas is required for serialization');
    }

    const objects = canvas.getObjects() || [];
    const zoom = canvas.getZoom() || 1;
    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    const width = canvas.width || window.innerWidth;
    const height = canvas.height || window.innerHeight;
    
    const elements = objects.map((obj, index) => {
      if (!obj) return null;

      const center = obj.getCenterPoint();
      const canvasCenter = {
        x: width / 2,
        y: height / 2
      };

      const relativePosition = {
        x: (center.x - canvasCenter.x) / zoom,
        y: (center.y - canvasCenter.y) / zoom
      };

      const element = {
        id: obj.data?.id || `element-${index}`,
        type: obj.data?.type || this.determineElementType(obj),
        position: relativePosition,
        width: (obj.width || 0) / zoom,
        height: (obj.height || 0) / zoom,
        rotation: obj.angle || 0,
        color: obj.fill || obj.stroke || '#000000',
        zIndex: index
      };

      switch (element.type) {
        case ElementType.TEXTBOX:
          if (obj instanceof fabric.Textbox) {
            element.text = obj.text;
            element.fontSize = obj.fontSize;
            element.fontFamily = obj.fontFamily;
          }
          break;
        case ElementType.PATH:
          if (obj instanceof fabric.Path) {
            element.pathData = obj.path;
            element.strokeWidth = obj.strokeWidth;
          }
          break;
        case ElementType.FILE:
          element.fileType = obj.data?.fileType;
          element.fileName = obj.data?.fileName;
          element.content = obj.data?.content;
          break;
      }

      return element;
    }).filter(Boolean);

    return {
      version: "1.0",
      viewportState: {
        zoom,
        center: {
          x: -vpt[4] / zoom,
          y: -vpt[5] / zoom
        }
      },
      elements,
      metadata: {
        lastModified: new Date().toISOString(),
        creator: "user"
      }
    };
  }

  static async deserializeCanvas(canvas, state) {
    if (!canvas || !state) return;

    canvas.clear();

    canvas.setZoom(state.viewportState.zoom);
    canvas.absolutePan(new fabric.Point(
      -state.viewportState.center.x * state.viewportState.zoom,
      -state.viewportState.center.y * state.viewportState.zoom
    ));

    const canvasCenter = {
      x: canvas.width / 2,
      y: canvas.height / 2
    };

    for (const element of state.elements) {
      if (!element) continue;

      const absolutePosition = {
        x: canvasCenter.x + element.position.x * state.viewportState.zoom,
        y: canvasCenter.y + element.position.y * state.viewportState.zoom
      };

      let obj = null;

      switch (element.type) {
        case ElementType.SQUARE:
          obj = new fabric.Rect({
            width: element.width,
            height: element.height,
            fill: element.color
          });
          break;

        case ElementType.TEXTBOX:
          obj = new fabric.Textbox(element.text || '', {
            width: element.width,
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            fill: element.color
          });
          break;

        case ElementType.PATH:
          obj = new fabric.Path(element.pathData, {
            stroke: element.color,
            strokeWidth: element.strokeWidth,
            fill: null
          });
          break;
      }

      if (obj) {
        obj.set({
          left: absolutePosition.x - element.width / 2,
          top: absolutePosition.y - element.height / 2,
          angle: element.rotation || 0,
          data: { 
            id: element.id,
            type: element.type,
            ...element
          }
        });
        canvas.add(obj);
      }
    }

    canvas.renderAll();
  }

  static determineElementType(obj) {
    if (obj instanceof fabric.Rect) return ElementType.SQUARE;
    if (obj instanceof fabric.Textbox) return ElementType.TEXTBOX;
    if (obj instanceof fabric.Path) return ElementType.PATH;
    if (obj instanceof fabric.Image) return ElementType.IMAGE;
    return ElementType.SQUARE;
  }

  static downloadCanvas(canvas) {
    if (!canvas) {
      console.error('Canvas is required for download');
      return;
    }

    try {
      const state = this.serializeCanvas(canvas);
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `canvas-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading canvas:', error);
    }
  }

  static uploadCanvas(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const state = JSON.parse(e.target?.result);
          resolve(state);
        } catch (err) {
          reject(new Error('Invalid canvas file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }
}