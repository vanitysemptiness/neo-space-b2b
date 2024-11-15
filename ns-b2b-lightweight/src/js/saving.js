import { addNodeToCanvas } from './canvas.js';
import { createNode } from './nodes.js';
import { state, setScale, setPanOffset } from './state.js';
import { addEdge } from './edges.js';

// Canvas coordinate system
export const canvasCoordinates = {  // Note the 'export' here
    // Convert screen coordinates to canvas coordinates
    toCanvas(x, y) {
        return {
            x: (x - state.panOffsetX) / state.scale,
            y: (y - state.panOffsetY) / state.scale
        };
    },

    // Convert canvas coordinates to screen coordinates
    toScreen(x, y) {
        return {
            x: (x * state.scale) + state.panOffsetX,
            y: (y * state.scale) + state.panOffsetY
        };
    }
};

// Save canvas state to JSON
export function saveCanvasState() {
    const nodes = Array.from(state.nodes.values()).map(node => {
        const domNode = document.getElementById(node.id);
        return {
            id: node.id,
            type: node.type,
            position: {
                x: Math.round(node.canvasX),
                y: Math.round(node.canvasY)
            },
            dimensions: {
                width: domNode?.offsetWidth || node.width,
                height: domNode?.offsetHeight || node.height
            },
            content: {
                title: node.content.title,
                text: node.content.text,
                lastEdited: node.content.lastEdited
            },
            metadata: node.metadata
        };
    });

    return {
        version: "1.0",
        timestamp: new Date().toISOString(),
        viewport: {
            scale: state.scale,
            panOffset: {
                x: state.panOffsetX,
                y: state.panOffsetY
            }
        },
        nodes,
        edges: state.edges
    };
}

// Load canvas state from JSON
export function loadCanvasState(jsonData) {
    try {
        const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        
        // Clear existing canvas
        const canvasNodes = document.getElementById('canvas-nodes');
        if (canvasNodes) {
            canvasNodes.innerHTML = '';
        }
        
        // Clear existing state
        state.nodes.clear();
        state.edges = [];  // Reset edges array in state instead of window.edges

        // Restore viewport state
        if (data.viewport) {
            setScale(data.viewport.scale);
            setPanOffset(data.viewport.panOffset.x, data.viewport.panOffset.y);
        }

        // Recreate nodes
        data.nodes.forEach(nodeData => {
            const screenPos = {
                x: nodeData.position.x * state.scale + state.panOffsetX,
                y: nodeData.position.y * state.scale + state.panOffsetY
            };

            const node = createNode(screenPos.x, screenPos.y);
            node.id = nodeData.id;
            node.setAttribute('data-node-type', nodeData.type);
            
            if (nodeData.dimensions) {
                node.style.width = `${nodeData.dimensions.width}px`;
                if (nodeData.dimensions.height) {
                    node.style.height = `${nodeData.dimensions.height}px`;
                }
            }

            const nameElement = node.querySelector('.node-name');
            if (nameElement && nodeData.content.title) {
                nameElement.textContent = nodeData.content.title;
            }

            const contentElement = node.querySelector('.node-text-content');
            if (contentElement && nodeData.content.text) {
                contentElement.innerHTML = nodeData.content.text;
            }

            addNodeToCanvas(node);
        });

        // Recreate edges
        data.edges.forEach(edge => {
            addEdge(edge.fromNode, edge.toNode, edge.fromSide, edge.toSide, edge.toEnd);
        });

        return true;
    } catch (error) {
        console.error('Error loading canvas state:', error);
        return false;
    }
}

// Handle file upload
export function setupFileHandlers() {
    // Save button handler
    document.getElementById('save-canvas')?.addEventListener('click', () => {
        const state = saveCanvasState();
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const a = document.createElement('a');
        a.href = url;
        a.download = `neospace_canvas_${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Load button handler
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    document.getElementById('load-canvas')?.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result;
            if (typeof content === 'string') {
                loadCanvasState(content);
            }
        };
        reader.readAsText(file);
    });

    // Handle drag and drop
    const container = document.getElementById('canvas-container');
    if (container) {
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            container.classList.add('drag-over');
        });

        container.addEventListener('dragleave', () => {
            container.classList.remove('drag-over');
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            container.classList.remove('drag-over');

            const file = e.dataTransfer?.files[0];
            if (file && file.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target?.result;
                    if (typeof content === 'string') {
                        loadCanvasState(content);
                    }
                };
                reader.readAsText(file);
            }
        });
    }
}