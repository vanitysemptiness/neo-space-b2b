import { fabric } from 'fabric';

export const initializeCanvas = (canvasElement, handleSelection) => {
  const canvas = new fabric.Canvas(canvasElement, {
    isDrawingMode: false,
    width: window.innerWidth,
    height: window.innerHeight,
    selection: true,
  });

  canvas.on('selection:created', handleSelection);
  canvas.on('selection:updated', handleSelection);
  canvas.on('selection:cleared', handleSelection);

  return canvas;
};

export const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

export const handleDrop = (e, fabricCanvas) => {
  e.preventDefault();
  e.stopPropagation();
  const file = e.dataTransfer.files[0];
  if (file) {
    addFileToCanvas(file, fabricCanvas);
  }
};

export const addFileToCanvas = (file, fabricCanvas) => {
  if (file && fabricCanvas) {
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    
    if (['png', 'jpg', 'jpeg', 'gif'].includes(fileExtension)) {
      renderImage(file, fabricCanvas);
    } else {
      renderGenericFileIcon(file, fabricCanvas);
    }
  }
};

const renderImage = (file, fabricCanvas) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    fabric.Image.fromURL(e.target.result, (img) => {
      img.scaleToWidth(100);
      fabricCanvas.add(img);
      fabricCanvas.renderAll();
    });
  };
  reader.readAsDataURL(file);
};

const renderGenericFileIcon = (file, fabricCanvas) => {
  const iconSvg = getGenericFileIconSvg();
  fabric.loadSVGFromString(iconSvg, (objects, options) => {
    const icon = fabric.util.groupSVGElements(objects, options);
    icon.scaleToWidth(50);

    const text = new fabric.Text(file.name, {
      fontSize: 14,
      originX: 'center',
      originY: 'top',
      top: icon.height + 10,
      width: 100,
      textAlign: 'center'
    });

    const group = new fabric.Group([icon, text], {
      left: 100,
      top: 100,
      originX: 'center',
      originY: 'center'
    });

    icon.set({
      originY: 'bottom',
      top: -text.height / 2
    });
    text.set({
      originY: 'top',
      top: icon.height / 2
    });

    fabricCanvas.add(group);
    fabricCanvas.renderAll();
  });
};

const getGenericFileIconSvg = () => {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8L14,2z M16,18H8v-2h8V18z M16,14H8v-2h8V14z M13,9V3.5L18.5,9H13z" fill="#000000"/>
    </svg>
  `;
};