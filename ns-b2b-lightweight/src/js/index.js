import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import { initCanvas, addNodeToCanvas } from './canvas.js';
import { createNode } from './nodes.js';
import { edges } from './edges.js';

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize canvas
    initCanvas();
    
    // Add sample node
    const node = createNode(100, 100);
    addNodeToCanvas(node);
    
    // Add node button handler
    document.getElementById('add-node')?.addEventListener('click', () => {
        const node = createNode();
        addNodeToCanvas(node);
    });

    // Double click to add node
    document.getElementById('canvas-container')?.addEventListener('dblclick', (e) => {
        if (e.target === document.getElementById('canvas-container')) {
            const node = createNode();
            addNodeToCanvas(node);
        }
    });

    // Output handlers
    document.getElementById('toggle-output')?.addEventListener('click', () => {
        const output = document.getElementById('output');
        output?.classList.toggle('hidden');
    });

    document.querySelector('.button-copy')?.addEventListener('click', () => {
        const positionsOutput = document.getElementById('positionsOutput')?.textContent;
        if (positionsOutput) {
            navigator.clipboard.writeText(positionsOutput);
        }
    });

    document.querySelector('.button-download')?.addEventListener('click', () => {
        const positionsOutput = document.getElementById('positionsOutput')?.textContent;
        if (positionsOutput) {
            const blob = new Blob([positionsOutput], { type: 'text/plain' });
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
});

// Export the update function for other modules
export function updateCanvasData() {
    const canvasData = {
        nodes: Array.from(document.querySelectorAll('.node')).map(node => ({
            id: node.id,
            type: node.getAttribute('data-node-type'),
            x: parseInt(node.style.left, 10),
            y: parseInt(node.style.top, 10),
            width: node.offsetWidth,
            height: node.offsetHeight,
            text: node.querySelector('.node-text-content')?.innerHTML
        })),
        edges: edges
    };

    const positionsOutput = document.getElementById('positionsOutput');
    if (positionsOutput) {
        positionsOutput.textContent = JSON.stringify(canvasData, null, 2);
        Prism.highlightElement(positionsOutput);
    }
}