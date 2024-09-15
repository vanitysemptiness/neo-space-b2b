import Konva from 'konva';
import MouseTracker from './mouse';

export class Renderer {
    constructor(containerId) {
        this.stage = new Konva.Stage({
            container: containerId,
            width: window.innerWidth,
            height: window.innerHeight,
        });

        this.layer = new Konva.Layer();
        this.stage.add(this.layer);
        // this is how to edit things or groups of things
        this.transformer = new Konva.Transformer();
        this.layer.add(this.transformer);
        // lets add ability to draw selection rectangle
        this.selectionRectangle = new Konva.Rect({
            fill: 'rgba(173, 216, 230, 0.5)',
            visible: false,
            // disable events to not interrupt with events
            listening: false,
        });
        this.layer.add(this.selectionRectangle);

        this.isDrawing = false;
        this.drawingShape = null;
        this.isSelecting = false;
        this.setupResizeHandler();
        this.mouse = new MouseTracker();
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.stage.width(window.innerWidth);
            this.stage.height(window.innerHeight);
            this.layer.draw();
        });
    }

    createShape(type, config) {
        let shape;
        switch (type) {
            case 'rectangle':
                shape = new Konva.Rect({
                    ...config,
                    fill: 'pink',
                    stroke: 'pink',
                    strokeWidth: 2,
                    shadowBlur: 10,
                    cornerRadius: 10,
                });
                break;
            default:
                console.error('Unsupported shape type');
                return null;
        }

        this.layer.add(shape);
        this.layer.draw();
        return shape;
    }

    /**
     * Konva uses a 0 based drawing system where the 0 is the top left corner
     * That means we have to constantly be transforming grid coordinate system
     *  that has nexative numbers on it to one that doesnt, which is done in
     *  continueDrawing.
     * @param { mouse position} pos 
     */
    startDrawing() {
        const pos = this.stage.getPointerPosition();
        this.isDrawing = true;
        this.drawingStartPos = pos;
        this.drawingShape = this.createShape('rectangle', {
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
            cornerRadius: 0,
        });
    }

    continueDrawing() {
        if (!this.isDrawing) return;
        const pos = this.stage.getPointerPosition();
        const rect = this.drawingShape;
        const startPos = this.drawingStartPos;

        const x = Math.min(startPos.x, pos.x);
        const y = Math.min(startPos.y, pos.y);
        const width = Math.abs(pos.x - startPos.x);
        const height = Math.abs(pos.y - startPos.y);
        //TODO: make the rectangle draggable only when selected
        rect.setAttrs({
            x: x,
            y: y,
            name: 'rect',
            width: width,
            height: height,
            draggable: true
        });

        this.layer.batchDraw();
    }

    endDrawing() {
        this.isDrawing = false;
        this.drawingShape = null;
        this.drawingStartPos = null;
    }

    /**
     * here we will do the selection logic
     */

    startSelecting() {
        const pos = this.stage.getPointerPosition();
        this.mouse = new MouseTracker(pos.x, pos.y, pos.x, pos.y);
        this.selectionRectangle.width(0);
        this.selectionRectangle.height(0);
        this.selecting = true;
    }

    continueSelecting() {
        //TODO: add prevent default for touch devices
        //TODO: https://konvajs.org/docs/select_and_transform/Basic_demo.html
        if (!this.selecting) return;
        this.mouse.setCurrentPostition(this.stage.getPointerPosition().x,
            this.stage.getPointerPosition().y);
        // last position is really where they clicked
        this.selectionRectangle.setAttrs({
            visible: true,
            x: Math.min(this.mouse.lastx, this.mouse.currentx),
            y: Math.min(this.mouse.lasty, this.mouse.currenty),
            width: Math.abs(this.mouse.currentx - this.mouse.lastx),
            height: Math.abs(this.mouse.currenty - this.mouse.lasty),
        });
    }

    endSelecting() {
        this.selecting = false;
        if (!this.selectionRectangle.visible()) {
            return;
        }
        //TODO: prevent default behavior
        this.selectionRectangle.visible(false);
        var shapes = this.stage.find('.rect');
        var box = this.selectionRectangle.getClientRect();
        var selected = shapes.filter((shape) =>
            Konva.Util.haveIntersection(box, shape.getClientRect())
        );
        // these are references so removing from original or from here deletes
        this.transformer.nodes(selected);
    }

    deleteSelected() {
        const selectedNodes = this.transformer.nodes();
        if (selectedNodes.length > 0) {
            // Remove each selected node from the stage
            selectedNodes.forEach(node => {
                node.destroy();
            });

            // Clear the transformer's nodes
            this.transformer.nodes([]);

            this.transformer.forceUpdate();

            // Redraw the layer to reflect the changes
            this.layer.batchDraw();
        }
    }
}