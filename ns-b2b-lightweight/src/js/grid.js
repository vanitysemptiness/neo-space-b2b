import { state } from './state.js';

// Grid constants
export const GRID = {
    BASE_SIZE: 20,        // Base grid cell size in pixels
    SNAP_THRESHOLD: 10    // Distance in pixels to trigger snapping
};

// Grid state management
export const gridState = {
    isSnapping: true
};

// Grid coordinate calculations
export function snapToGrid(value) {
    if (!gridState.isSnapping) return value;
    const gridSize = GRID.BASE_SIZE * state.scale;
    return Math.round(value / gridSize) * gridSize;
}

export function pixelsToGridUnits(pixels) {
    return Math.round(pixels / (GRID.BASE_SIZE * state.scale));
}

export function gridUnitsToPixels(units) {
    return units * GRID.BASE_SIZE * state.scale;
}

// Node positioning and grid alignment
export function updateNodePosition(node) {
    if (!node) return null;
    
    const currentX = parseInt(node.style.left, 10);
    const currentY = parseInt(node.style.top, 10);
    
    const snappedX = snapToGrid(currentX);
    const snappedY = snapToGrid(currentY);
    
    node.style.left = `${snappedX}px`;
    node.style.top = `${snappedY}px`;
    
    return {
        x: snappedX,
        y: snappedY,
        gridX: pixelsToGridUnits(snappedX),
        gridY: pixelsToGridUnits(snappedY)
    };
}

// Grid controls
export function toggleGridSnapping() {
    gridState.isSnapping = !gridState.isSnapping;
    return gridState.isSnapping;
}