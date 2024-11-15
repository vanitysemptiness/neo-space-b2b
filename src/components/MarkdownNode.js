import { fabric } from 'fabric';

class MarkdownNode extends fabric.Group {
  static type = 'markdownNode';

  constructor(options = {}) {
    // Create the container and content divs
    const containerDiv = document.createElement('div');
    containerDiv.className = 'node node-text';
    containerDiv.style.position = 'absolute';
    containerDiv.style.visibility = 'hidden';
    document.body.appendChild(containerDiv);
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'node-name';
    nameDiv.textContent = 'Text';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'node-text-content';
    contentDiv.contentEditable = 'true';
    contentDiv.innerHTML = options.text || 'Enter text here...';
    
    containerDiv.appendChild(nameDiv);
    containerDiv.appendChild(contentDiv);

    // Convert div to image using html2canvas
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${options.width || 300}" height="${options.height || 200}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${containerDiv.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `;

    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      if (this.canvas) {
        this.canvas.renderAll();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;

    // Initialize as group with the image
    super([new fabric.Image(img, {
      left: 0,
      top: 0,
      width: options.width || 300,
      height: options.height || 200,
    })], {
      left: options.left || 0,
      top: options.top || 0,
      ...options,
    });

    // Store references
    this.containerElement = containerDiv;
    this.contentElement = contentDiv;
    this.imageElement = img;
    
    // Set up event handlers
    this._initializeEventListeners();

    // Clean up the temporary div
    document.body.removeChild(containerDiv);
  }

  _initializeEventListeners() {
    if (!this.contentElement) return;

    const updateImage = () => {
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${this.containerElement.outerHTML}
            </div>
          </foreignObject>
        </svg>
      `;

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      this.imageElement.onload = () => {
        if (this.canvas) {
          this.canvas.renderAll();
        }
        URL.revokeObjectURL(url);
      };
      this.imageElement.src = url;
    };

    this.contentElement.addEventListener('input', () => {
      this._updateSize();
      updateImage();
    });

    this.contentElement.addEventListener('blur', () => {
      updateImage();
    });
  }

  _updateSize() {
    const padding = 40;
    const newWidth = Math.max(300, this.contentElement.scrollWidth + padding);
    const newHeight = Math.max(100, this.contentElement.scrollHeight + padding);
    
    this.set({
      width: newWidth,
      height: newHeight
    });

    this.getObjects()[0].set({
      width: newWidth,
      height: newHeight
    });
  }

  toObject() {
    return {
      ...super.toObject(),
      text: this.contentElement.innerHTML,
    };
  }

  static fromObject(object, callback) {
    return callback(new MarkdownNode({
      ...object,
      text: object.text
    }));
  }
}

// Register the custom class with Fabric
fabric.MarkdownNode = MarkdownNode;
fabric.MarkdownNode.fromObject = MarkdownNode.fromObject;

export default MarkdownNode;