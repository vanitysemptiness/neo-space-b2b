import { 
    state, 
    ZOOM_SPEED, 
    minScale, 
    maxScale,
    setScale,
    setPanning,
    setSpacePressed,
    setPanOffset,
    setPanStartPosition,
    setStartPosition
} from './state.js';

import { drawEdges } from './edges.js';

// Initialize canvas
export function initCanvas() {
    applyTransform();
    setupZoom();
    setupPan();
    setupTouch();
}

// Add a node to the canvas
export function addNodeToCanvas(node) {
    document.getElementById('canvas-nodes')?.appendChild(node);
    updateCanvasVisibility();
}

function applyTransform() {
    document.body.style.setProperty('--scale', state.scale);
    document.body.style.setProperty('--pan-x', `${state.panOffsetX}px`);
    document.body.style.setProperty('--pan-y', `${state.panOffsetY}px`);
}

function updateCanvasVisibility() {
    const canvasNodes = document.getElementById('canvas-nodes');
    const canvasEdges = document.getElementById('canvas-edges');
    if (canvasNodes) canvasNodes.style.opacity = '1';
    if (canvasEdges) canvasEdges.style.opacity = '1';
}

// Zoom setup and handlers
function setupZoom() {
    window.addEventListener('wheel', (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            
            // Calculate zoom center point
            const rect = document.getElementById('canvas-container').getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // More gradual zoom speed
            const zoomDelta = e.deltaY * -0.001;
            const newScale = Math.min(Math.max(state.scale * (1 + zoomDelta), minScale), maxScale);
            const scaleFactor = newScale / state.scale;
            
            // Adjust pan offset to zoom toward cursor
            const newPanX = state.panOffsetX + (x - state.panOffsetX) * (1 - scaleFactor);
            const newPanY = state.panOffsetY + (y - state.panOffsetY) * (1 - scaleFactor);
            
            setScale(newScale);
            setPanOffset(newPanX, newPanY);
            applyTransform();
            drawEdges();
        }
    }, { passive: false });

    document.getElementById('zoom-in')?.addEventListener('click', () => {
        setScale(state.scale * 1.2);
        applyTransform();
    });

    document.getElementById('zoom-out')?.addEventListener('click', () => {
        setScale(state.scale / 1.2);
        applyTransform();
    });

    document.getElementById('zoom-reset')?.addEventListener('click', () => {
        setScale(1);
        setPanOffset(0, 0);
        applyTransform();
    });
}

// Pan setup and handlers
function setupPan() {
    const container = document.getElementById('canvas-container');
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let initialPanX = 0;
    let initialPanY = 0;

    container.addEventListener('mousedown', (e) => {
        if (e.target === container) {
            isPanning = true;
            startX = e.clientX;
            startY = e.clientY;
            initialPanX = state.panOffsetX;
            initialPanY = state.panOffsetY;
            container.style.cursor = 'grabbing';
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (isPanning) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            setPanOffset(
                initialPanX + dx,
                initialPanY + dy
            );
            
            applyTransform();
        }
    });

    window.addEventListener('mouseup', () => {
        isPanning = false;
        container.style.cursor = '';
    });
}

// Touch support setup and handlers
function setupTouch() {
    let lastTouchX = 0;
    let lastTouchY = 0;
    let initialDistance = null;

    document.getElementById('canvas-container')?.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            lastTouchX = touch.pageX;
            lastTouchY = touch.pageY;
            setPanning(true);
            setPanStartPosition(
                touch.pageX - state.panOffsetX,
                touch.pageY - state.panOffsetY
            );
        } else if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            initialDistance = Math.hypot(
                touch2.pageX - touch1.pageX,
                touch2.pageY - touch1.pageY
            );
        }
    }, { passive: false });

    document.getElementById('canvas-container')?.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && state.isPanning) {
            const touch = e.touches[0];
            const dx = touch.pageX - lastTouchX;
            const dy = touch.pageY - lastTouchY;
            setPanOffset(
                state.panOffsetX + dx,
                state.panOffsetY + dy
            );
            lastTouchX = touch.pageX;
            lastTouchY = touch.pageY;
            applyTransform();
            drawEdges();
        } else if (e.touches.length === 2 && initialDistance !== null) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch2.pageX - touch1.pageX,
                touch2.pageY - touch1.pageY
            );
            const delta = distance - initialDistance;
            setScale(Math.min(Math.max(minScale, state.scale + delta * 0.01), maxScale));
            initialDistance = distance;
            applyTransform();
        }
    }, { passive: false });

    document.getElementById('canvas-container')?.addEventListener('touchend', (e) => {
        if (state.isPanning) {
            setPanning(false);
        }
        if (e.touches.length < 2) {
            initialDistance = null;
        }
    });

    // Prevent default gestures
    document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('gesturechange', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// Canvas viewport adjustment
export function adjustCanvasToViewport() {
    const nodes = document.querySelectorAll('.node');
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    nodes.forEach(node => {
        const x = parseInt(node.style.left, 10);
        const y = parseInt(node.style.top, 10);
        const width = node.offsetWidth;
        const height = node.offsetHeight;

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x + width);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y + height);
    });

    const boundingBoxWidth = maxX - minX;
    const boundingBoxHeight = maxY - minY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const scaleX = viewportWidth / (boundingBoxWidth + 80);
    const scaleY = viewportHeight / (boundingBoxHeight + 80);
    const newScale = Math.min(scaleX, scaleY, 1);

    setScale(newScale);
    setPanOffset(
        (viewportWidth - boundingBoxWidth * newScale) / 2 - minX * newScale,
        (viewportHeight - boundingBoxHeight * newScale) / 2 - minY * newScale
    );

    applyTransform();
}

// Initialize event listeners for output panel
function initializeOutputPanel() {
    document.querySelector('.close-output')?.addEventListener('click', () => {
        document.getElementById('output')?.classList.add('hidden');
    });

    document.querySelector('.button-copy')?.addEventListener('click', () => {
        const output = document.getElementById('positionsOutput')?.textContent;
        if (output) {
            navigator.clipboard.writeText(output);
        }
    });

    document.querySelector('.button-download')?.addEventListener('click', () => {
        const output = document.getElementById('positionsOutput')?.textContent;
        if (output) {
            const blob = new Blob([output], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'canvas.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });
}

// Initialize canvas when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initializeOutputPanel();
});