import { fabric } from 'fabric';
import { fabricGif } from './fabricGif';
import { saveToLocalStorage } from './CanvasPersistence';

export const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

export const handleDrop = async (e, fabricCanvas) => {
  e.preventDefault();
  e.stopPropagation();
  const file = e.dataTransfer.files[0];
  if (file) {
    await addFileToCanvas(file, fabricCanvas);
  }
};

const getCenterPoint = (fabricCanvas) => {
  const viewportTransform = fabricCanvas.viewportTransform;
  const zoom = fabricCanvas.getZoom();
  const center = fabricCanvas.getCenter();
  return {
    x: (center.left - viewportTransform[4]) / zoom,
    y: (center.top - viewportTransform[5]) / zoom
  };
};

export const addFileToCanvas = async (file, fabricCanvas) => {
  if (file && fabricCanvas) {
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const centerPoint = getCenterPoint(fabricCanvas);
    
    if (fileExtension === 'gif') {
      const gif = await fabricGif(file, 200, 200);
      if (!gif.error) {
        gif.set({
          left: centerPoint.x,
          top: centerPoint.y,
          originX: 'center',
          originY: 'center'
        });
        fabricCanvas.add(gif);
        fabricCanvas.renderAll();
        saveToLocalStorage(fabricCanvas);
      } else {
        console.error('Error loading GIF:', gif.error);
      }
    } else if (fileExtension === 'csv') {
      renderCSVIcon(file, fabricCanvas, centerPoint);
    } else if (['png', 'jpg', 'jpeg'].includes(fileExtension)) {
      renderImage(file, fabricCanvas, centerPoint);
    } else {
      renderGenericFileIcon(file, fabricCanvas, centerPoint);
    }
  }
};

const renderImage = (file, fabricCanvas, centerPoint) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    fabric.Image.fromURL(e.target.result, (img) => {
      img.scaleToWidth(100);
      img.set({
        left: centerPoint.x,
        top: centerPoint.y,
        originX: 'center',
        originY: 'center'
      });
      fabricCanvas.add(img);
      fabricCanvas.renderAll();
      saveToLocalStorage(fabricCanvas);
    });
  };
  reader.readAsDataURL(file);
};

const renderCSVIcon = (file, fabricCanvas, centerPoint) => {
  fabric.Image.fromURL('/icons/csv.png', (img) => {
    img.scaleToWidth(50);

    const text = new fabric.Text(file.name, {
      fontSize: 14,
      originX: 'center',
      originY: 'top',
      top: img.height * img.scaleY + 10,
      width: 100,
      textAlign: 'center'
    });

    const group = new fabric.Group([img, text], {
      left: centerPoint.x,
      top: centerPoint.y,
      originX: 'center',
      originY: 'center'
    });

    fabricCanvas.add(group);
    fabricCanvas.renderAll();
    saveToLocalStorage(fabricCanvas);
  });
};

const renderGenericFileIcon = (file, fabricCanvas, centerPoint) => {
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
      left: centerPoint.x,
      top: centerPoint.y,
      originX: 'center',
      originY: 'center'
    });

    fabricCanvas.add(group);
    fabricCanvas.renderAll();
    saveToLocalStorage(fabricCanvas);
  });
};

const getGenericFileIconSvg = () => {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8L14,2z M16,18H8v-2h8V18z M16,14H8v-2h8V14z M13,9V3.5L18.5,9H13z" fill="#000000"/>
    </svg>
  `;
};

export const setupAnimationLoop = (canvas) => {
  fabric.util.requestAnimFrame(function render() {
    canvas.renderAll();
    fabric.util.requestAnimFrame(render);
  });
};