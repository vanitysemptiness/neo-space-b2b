import React, { useEffect, useCallback } from 'react';
import PopupToolbar from './PopupToolbar';

const Selection = ({ fabricCanvas, showPopupToolbar, setShowPopupToolbar, popupToolbarPosition, setPopupToolbarPosition, currentColor, handleColorChange, handleDelete }) => {
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

    useEffect(() => {
        if (fabricCanvas) {
            fabricCanvas.on('selection:created', handleSelection);
            fabricCanvas.on('selection:updated', handleSelection);
            fabricCanvas.on('selection:cleared', () => setShowPopupToolbar(false));
            fabricCanvas.on('object:moving', handleSelection);

            return () => {
                fabricCanvas.off('selection:created', handleSelection);
                fabricCanvas.off('selection:updated', handleSelection);
                fabricCanvas.off('selection:cleared');
                fabricCanvas.off('object:moving', handleSelection);
            };
        }
    }, [fabricCanvas, handleSelection, setShowPopupToolbar]);

    return (
        <>
            {showPopupToolbar && (
                <div style={{
                    position: 'absolute',
                    top: `${popupToolbarPosition.top}px`,
                    left: `${popupToolbarPosition.left}px`,
                    zIndex: 1000,
                }}>
                    <PopupToolbar
                        onDelete={handleDelete}
                        onChangeColor={handleColorChange}
                        currentColor={currentColor}
                    />
                </div>
            )}
        </>
    );
};

export default Selection;