import React, { useEffect, useCallback } from 'react';
import PopupToolbar from './PopupToolbar';
import { useColor } from './ColorContext';
import { saveToLocalStorage } from './CanvasPersistence';

class SelectionTool {
    constructor(updatePopupPosition, setShowPopupToolbar, handleSelection) {
        this.isMoving = false;
        this.updatePopupPosition = updatePopupPosition;
        this.setShowPopupToolbar = setShowPopupToolbar;
        this.handleSelection = handleSelection;
        
        // Bind methods to preserve context
        this.handleMoving = this.handleMoving.bind(this);
        this.handleModified = this.handleModified.bind(this);
        this.handleCleared = this.handleCleared.bind(this);
    }

    handleMoving() {
        this.isMoving = true;
        this.setShowPopupToolbar(false);
    }

    handleModified() {
        if (this.isMoving) {
            this.isMoving = false;
            this.handleSelection();
        }
    }

    handleCleared() {
        this.setShowPopupToolbar(false);
    }

    attach(canvas) {
        if (!canvas) return;
        
        this.canvas = canvas;
        
        // Attach all listeners
        canvas.on('selection:created', this.handleSelection);
        canvas.on('selection:updated', this.handleSelection);
        canvas.on('selection:cleared', this.handleCleared);
        canvas.on('object:moving', this.handleMoving);
        canvas.on('object:modified', this.handleModified);
        canvas.on('object:scaling', this.handleCleared);
        canvas.on('object:rotating', this.handleCleared);
    }

    detach() {
        if (!this.canvas) return;
        
        // Remove all listeners
        this.canvas.off('selection:created', this.handleSelection);
        this.canvas.off('selection:updated', this.handleSelection);
        this.canvas.off('selection:cleared', this.handleCleared);
        this.canvas.off('object:moving', this.handleMoving);
        this.canvas.off('object:modified', this.handleModified);
        this.canvas.off('object:scaling', this.handleCleared);
        this.canvas.off('object:rotating', this.handleCleared);
        
        this.canvas = null;
    }
}

const Selection = ({ fabricCanvas, showPopupToolbar, setShowPopupToolbar, popupToolbarPosition, setPopupToolbarPosition }) => {
    const { currentColor } = useColor();

    const updateObjectColor = useCallback((obj, color) => {
        if (obj.type === 'path') {
            obj.set('stroke', color);
        } else {
            if (obj.stroke) obj.set('stroke', color);
            if (obj.fill) obj.set('fill', color);
        }
    }, []);

    const updateSelectedObjectsColor = useCallback((color) => {
        if (fabricCanvas) {
            const activeObject = fabricCanvas.getActiveObject();
            if (activeObject) {
                if (activeObject.type === 'activeSelection') {
                    activeObject.forEachObject((obj) => {
                        updateObjectColor(obj, color);
                    });
                } else {
                    updateObjectColor(activeObject, color);
                }
                fabricCanvas.renderAll();
                saveToLocalStorage(fabricCanvas);
            }
        }
    }, [fabricCanvas, updateObjectColor]);

    const updatePopupPosition = useCallback(() => {
        if (!fabricCanvas) return;

        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            const boundingRect = activeObject.getBoundingRect(true);
            const zoom = fabricCanvas.getZoom();
            const vpt = fabricCanvas.viewportTransform;
            setPopupToolbarPosition({
                top: (boundingRect.top * zoom + vpt[5]) - 50,
                left: (boundingRect.left * zoom + vpt[4]) + (boundingRect.width * zoom / 2) - 50
            });
        }
    }, [fabricCanvas, setPopupToolbarPosition]);

    const handleSelection = useCallback(() => {
        if (!fabricCanvas) return;

        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            updatePopupPosition();
            setShowPopupToolbar(true);
        } else {
            setShowPopupToolbar(false);
        }
    }, [fabricCanvas, setShowPopupToolbar, updatePopupPosition]);

    const handleDelete = useCallback(() => {
        if (fabricCanvas) {
            const activeObject = fabricCanvas.getActiveObject();
            if (activeObject) {
                if (activeObject.type === 'activeSelection') {
                    activeObject.forEachObject((obj) => fabricCanvas.remove(obj));
                } else {
                    fabricCanvas.remove(activeObject);
                }
                fabricCanvas.discardActiveObject().renderAll();
                setShowPopupToolbar(false);
                saveToLocalStorage(fabricCanvas);
            }
        }
    }, [fabricCanvas, setShowPopupToolbar]);

    // Color effect
    useEffect(() => {
        updateSelectedObjectsColor(currentColor);
    }, [currentColor, updateSelectedObjectsColor]);

    // Selection tool effect
    useEffect(() => {
        if (!fabricCanvas) return;

        const selectionTool = new SelectionTool(
            updatePopupPosition,
            setShowPopupToolbar,
            handleSelection
        );

        selectionTool.attach(fabricCanvas);

        // Cleanup function
        return () => {
            selectionTool.detach();
        };
    }, [fabricCanvas, updatePopupPosition, setShowPopupToolbar, handleSelection]);

    return (
        <>
            {showPopupToolbar && (
                <div style={{
                    position: 'absolute',
                    top: `${popupToolbarPosition.top}px`,
                    left: `${popupToolbarPosition.left}px`,
                    zIndex: 1000,
                }}>
                    <PopupToolbar onDelete={handleDelete} />
                </div>
            )}
        </>
    );
};

export default Selection;
