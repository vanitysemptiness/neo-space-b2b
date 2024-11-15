// Canvas state
export const state = {
    scale: 1,
    panOffsetX: 0,
    panOffsetY: 0,
    isDragging: false,
    isSpacePressed: false,
    isPanning: false,
    selectedElement: null,
    startX: 0,
    startY: 0,
    panStartX: 0,
    panStartY: 0
};

// Constants
export const ZOOM_SPEED = 0.1;
export const minScale = 0.35;
export const maxScale = 1.25;

// State update functions
export function setDragging(value) {
    state.isDragging = value;
}

export function setSpacePressed(value) {
    state.isSpacePressed = value;
}

export function setPanning(value) {
    state.isPanning = value;
}

export function setScale(value) {
    state.scale = Math.min(Math.max(value, minScale), maxScale);
}

export function setPanOffset(x, y) {
    state.panOffsetX = x;
    state.panOffsetY = y;
}

export function setStartPosition(x, y) {
    state.startX = x;
    state.startY = y;
}

export function setPanStartPosition(x, y) {
    state.panStartX = x;
    state.panStartY = y;
}

export function setSelectedElement(element) {
    state.selectedElement = element;
}