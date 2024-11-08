import React, { useState, useEffect, useCallback } from 'react';
import PopupToolbar from './PopupToolbar';
import { useColor } from './ColorContext';
import { saveToLocalStorage } from './CanvasPersistence';

const Selection = ({ fabricCanvas, currentTool }) => {
    const { currentColor } = useColor();
    const [showPopupToolbar, setShowPopupToolbar] = useState(false);
    const [popupToolbarPosition, setPopupToolbarPosition] = useState({ top: 0, left: 0 });
    const [isMoving, setIsMoving] = useState(false);

    const updatePopupPosition = useCallback(() => {
        if (!fabricCanvas) return;

        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            const boundingRect = activeObject.getBoundingRect(true);
            const zoom = fabricCanvas.getZoom();
            const vpt = fabricCanvas.viewportTransform;
            setPopupToolbarPosition({
                top: (boundingRect.top * zoom + vpt[5]) + boundingRect.height * zoom + 10,
                left: (boundingRect.left * zoom + vpt[4]) + (boundingRect.width * zoom / 2) - 50
            });
        }
    }, [fabricCanvas]);

    const updateObjectColor = useCallback((obj, color) => {
        if (obj.type === 'path') {
            obj.set('stroke', color);
        } else {
            if (obj.stroke) obj.set('stroke', color);
            if (obj.fill) obj.set('fill', color);
        }
    }, []);

    const updateSelectedObjectsColor = useCallback(() => {
        if (!fabricCanvas) return;
        
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            if (activeObject.type === 'activeSelection') {
                activeObject.forEachObject((obj) => {
                    updateObjectColor(obj, currentColor);
                });
            } else {
                updateObjectColor(activeObject, currentColor);
            }
            fabricCanvas.renderAll();
            saveToLocalStorage(fabricCanvas);
        }
    }, [fabricCanvas, currentColor, updateObjectColor]);

    const handleSelectionCreated = useCallback(() => {
        updatePopupPosition();
        setShowPopupToolbar(true);
    }, [updatePopupPosition]);

    const handleSelectionUpdated = useCallback(() => {
        updatePopupPosition();
        setShowPopupToolbar(true);
    }, [updatePopupPosition]);

    const handleSelectionCleared = useCallback(() => {
        setShowPopupToolbar(false);
    }, []);

    const handleMoving = useCallback(() => {
        setIsMoving(true);
        setShowPopupToolbar(false);
    }, []);

    const handleModified = useCallback(() => {
        if (isMoving) {
            setIsMoving(false);
            updatePopupPosition();
            setShowPopupToolbar(true);
        }
    }, [isMoving, updatePopupPosition]);

    const handleDelete = useCallback(() => {
        if (!fabricCanvas) return;
        
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
    }, [fabricCanvas]);

    // Set up canvas event listeners
    useEffect(() => {
        if (!fabricCanvas) return;

        fabricCanvas.on('selection:created', handleSelectionCreated);
        fabricCanvas.on('selection:updated', handleSelectionUpdated);
        fabricCanvas.on('selection:cleared', handleSelectionCleared);
        fabricCanvas.on('object:moving', handleMoving);
        fabricCanvas.on('object:modified', handleModified);

        // Selection mode based on current tool
        fabricCanvas.selection = currentTool === 'select';
        
        return () => {
            fabricCanvas.off('selection:created', handleSelectionCreated);
            fabricCanvas.off('selection:updated', handleSelectionUpdated);
            fabricCanvas.off('selection:cleared', handleSelectionCleared);
            fabricCanvas.off('object:moving', handleMoving);
            fabricCanvas.off('object:modified', handleModified);
        };
    }, [
        fabricCanvas, 
        currentTool,
        handleSelectionCreated, 
        handleSelectionUpdated, 
        handleSelectionCleared,
        handleMoving,
        handleModified
    ]);

    // Update colors of selected objects when color changes
    useEffect(() => {
        updateSelectedObjectsColor();
    }, [currentColor, updateSelectedObjectsColor]);

    return (
        <>
            {showPopupToolbar && (
                <div 
                    style={{
                        position: 'absolute',
                        top: `${popupToolbarPosition.top}px`,
                        left: `${popupToolbarPosition.left}px`,
                        zIndex: 1000,
                    }}
                >
                    <PopupToolbar onDelete={handleDelete} />
                </div>
            )}
        </>
    );
};

export default Selection;