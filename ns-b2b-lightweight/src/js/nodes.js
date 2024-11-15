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
    
    const nodeName = document.createElement('div');
    nodeName.className = 'node-name';
    nodeName.textContent = 'New Node';
    
    const nodeContent = document.createElement('div');
    nodeContent.className = 'node-text-content';
    nodeContent.contentEditable = true;
    nodeContent.innerHTML = '<p>Click to edit text</p>';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '×';
    deleteBtn.style.position = 'absolute';
    deleteBtn.style.right = '5px';
    deleteBtn.style.top = '5px';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        node.remove();
        updateCanvasData();
        drawEdges();
    };
    
    setupNodeDrag(nodeName, node);
    
    node.appendChild(nodeName);
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