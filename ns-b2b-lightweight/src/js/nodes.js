import { state, setDragging, setStartPosition, setSelectedElement } from './state.js';
import { updateCanvasData } from './index.js';
import { drawEdges } from './edges.js';

// Create a new node
export function createNode(x = window.innerWidth/2, y = window.innerHeight/2) {
    const node = document.createElement('div');
    node.id = 'node' + Date.now();
    node.className = 'node node-text';
    node.setAttribute('data-node-type', 'text');
    node.style.left = x + 'px';
    node.style.top = y + 'px';
    node.style.width = '480px'; // Set default width
    node.style.position = 'absolute';
    
    const nodeName = document.createElement('div');
    nodeName.className = 'node-name';
    nodeName.textContent = 'New Node';
    
    const nodeContent = document.createElement('div');
    nodeContent.className = 'node-text-content';
    nodeContent.contentEditable = true;
    nodeContent.innerHTML = '<p>Click to edit text</p>';
    
    // Prevent space bar from triggering canvas panning while editing
    nodeContent.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.stopPropagation();
        }
    });

    // Handle paste to strip formatting
    nodeContent.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    });

    // Add resize handles
    const resizeHandles = ['e', 'w'].map(direction => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-${direction}`;
        return handle;
    });

    // Setup resize functionality
    let isResizing = false;
    let startWidth, startX;

    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startWidth = node.offsetWidth;
            startX = e.clientX;
            e.stopPropagation();
            document.body.style.cursor = 'ew-resize';
        });

        node.appendChild(handle);
    });

    window.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const dx = (e.clientX - startX) / state.scale;
        const side = e.target.className.includes('resize-e') ? 1 : -1;
        const newWidth = startWidth + (dx * side);
        
        if (newWidth >= 200 && newWidth <= 800) {
            node.style.width = `${newWidth}px`;
            if (side === -1) {
                node.style.left = `${parseInt(node.style.left) + (dx)}px`;
            }
            drawEdges();
        }
    });

    window.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            updateCanvasData();
        }
    });

    const toolbar = document.createElement('div');
    toolbar.className = 'node-toolbar';
    toolbar.style.display = 'none';
    toolbar.innerHTML = `
        <button onclick="document.execCommand('bold')">B</button>
        <button onclick="document.execCommand('italic')">I</button>
        <button onclick="document.execCommand('underline')">U</button>
        <button onclick="document.execCommand('insertUnorderedList')">•</button>
        <button onclick="document.execCommand('insertOrderedList')">1.</button>
    `;

    nodeContent.addEventListener('focus', () => {
        toolbar.style.display = 'flex';
    });

    nodeContent.addEventListener('blur', (e) => {
        if (!e.relatedTarget?.closest('.node-toolbar')) {
            toolbar.style.display = 'none';
        }
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '×';
    deleteBtn.className = 'node-delete';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        node.remove();
        updateCanvasData();
        drawEdges();
    };
    
    setupNodeDrag(nodeName, node);
    
    node.appendChild(nodeName);
    node.appendChild(toolbar);
    node.appendChild(nodeContent);
    node.appendChild(deleteBtn);
    
    return node;
}

function setupNodeDrag(handle, node) {
    handle.addEventListener('mousedown', function(e) {
        if (state.isSpacePressed) return;
        
        setDragging(true);
        setStartPosition(e.clientX, e.clientY);
        setSelectedElement(node);
        node.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', function(e) {
        if (!state.isDragging || !state.selectedElement) return;
        
        const dx = (e.clientX - state.startX) / state.scale;
        const dy = (e.clientY - state.startY) / state.scale;

        state.selectedElement.style.left = `${parseInt(state.selectedElement.style.left, 10) + dx}px`;
        state.selectedElement.style.top = `${parseInt(state.selectedElement.style.top, 10) + dy}px`;

        setStartPosition(e.clientX, e.clientY);
        drawEdges();
    });

    window.addEventListener('mouseup', function() {
        if (state.isDragging && state.selectedElement) {
            state.selectedElement.classList.remove('is-dragging');
            setDragging(false);
            setSelectedElement(null);
            updateCanvasData();
            drawEdges();
        }
    });
}