import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import { initCanvas, addNodeToCanvas, adjustCanvasToViewport } from './canvas.js';
import { TextboxNode } from './nodes.js';
import { edges } from './edges.js';
import { state } from './state.js';


// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize canvas
    initCanvas();
    
    // Add node button handler
    document.getElementById('add-node')?.addEventListener('click', () => {
        const node = new TextboxNode().element;
        addNodeToCanvas(node);
    });

    // Double click to add node - ensure we're not creating duplicates
    document.getElementById('canvas-container')?.addEventListener('dblclick', (e) => {
        if (e.target === document.getElementById('canvas-container')) {
            e.preventDefault(); // Prevent any double-click selection
            const node = new TextboxNode(
                (e.clientX - state.panOffsetX) / state.scale,
                (e.clientY - state.panOffsetY) / state.scale
            ).element;
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

    // Hot key handlers
    window.addEventListener('keydown', (e) => {
        // Undo/Redo
        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
            if (e.shiftKey) {
                // Redo
                e.preventDefault();
                // Implement redo functionality
            } else {
                // Undo
                e.preventDefault();
                // Implement undo functionality
            }
        }

        // Delete/Backspace
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const selectedNode = document.querySelector('.node.is-selected');
            if (selectedNode && !e.target.isContentEditable) {
                e.preventDefault();
                selectedNode.remove();
                updateCanvasData();
            }
        }

        // Space for panning
        if (e.code === 'Space' && !e.repeat && !e.target.isContentEditable) {
            e.preventDefault();
            document.getElementById('canvas-container').style.cursor = 'grab';
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            document.getElementById('canvas-container').style.cursor = '';
        }
    });

    // Prevent space bar from scrolling
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
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

// Initialize key handlers for space bar
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat && !e.target.isContentEditable) {
        state.isSpacePressed = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        state.isSpacePressed = false;
    }
});

// Auto-adjust canvas on window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        adjustCanvasToViewport();
    }, 250);
});