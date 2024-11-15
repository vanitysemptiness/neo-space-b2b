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
    panStartY: 0,
    nodes: new Map(), // Track node data
    edges: []  // Track edges
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

export function updateNodePosition(nodeId, screenX, screenY) {
    const node = state.nodes.get(nodeId);
    if (node) {
        node.screenX = screenX;
        node.screenY = screenY;
        node.canvasX = (screenX - state.panOffsetX) / state.scale;
        node.canvasY = (screenY - state.panOffsetY) / state.scale;
        state.nodes.set(nodeId, node);
    }
}

export function updateNodeContent(nodeId, title, content) {
    const node = state.nodes.get(nodeId);
    if (node) {
        node.title = title;
        node.content = content;
        state.nodes.set(nodeId, node);
    }
}

export function addNode(nodeId, screenX, screenY) {
    state.nodes.set(nodeId, {
        id: nodeId,
        screenX,
        screenY,
        canvasX: (screenX - state.panOffsetX) / state.scale,
        canvasY: (screenY - state.panOffsetY) / state.scale,
        title: 'New Node',
        content: '<p>Click to edit text</p>',
        type: 'text'
    });
}

export function getNodeCanvasPosition(nodeId) {
    return state.nodes.get(nodeId);
}