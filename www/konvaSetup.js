import Konva from 'konva';

export function setupKonva() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const canvasElement = document.getElementById('canvas');
    canvasElement.width = width;
    canvasElement.height = height;

    const stage = new Konva.Stage({
        container: 'canvas',
        width: width,
        height: height,
    });

    const layer = new Konva.Layer();
    stage.add(layer); // everything is currently on the same layer

    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        stage.width(newWidth);
        stage.height(newHeight);
        canvasElement.width = newWidth;
        canvasElement.height = newHeight;
    });

    return { stage, layer };
}