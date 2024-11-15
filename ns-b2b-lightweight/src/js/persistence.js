import { state, setScale, setPanOffset } from './state.js';
import { edges, addEdge } from './edges.js';
import { createNode } from './nodes.js';
import { gridState, GRID } from './grid.js';
import { drawEdges } from './edges.js';

export function saveCanvasState() {
    const nodes = Array.from(document.querySelectorAll('.node')).map(node => ({
        id: node.id,
        type: node.getAttribute('data-node-type'),
        x: parseInt(node.style.left, 10),
        y: parseInt(node.style.top, 10),
        width: node.offsetWidth,
        height: node.offsetHeight,
        content: node.querySelector('.node-text-content')?.innerHTML
    }));

    return JSON.stringify({
        nodes,
        edges,
        viewState: {
            scale: state.scale,
            panX: state.panOffsetX,
            panY: state.panOffsetY,
            gridSize: gridState.currentSize
        }
    }, null, 2);
}

export function loadCanvasState(jsonState) {
    const canvasState = JSON.parse(jsonState);
    
    // Clear current state
    document.getElementById('canvas-nodes').innerHTML = '';
    edges.length = 0;
    
    // Restore view state
    setScale(canvasState.viewState.scale);
    setPanOffset(canvasState.viewState.panX, canvasState.viewState.panY);
    
    // Restore nodes and edges
    canvasState.nodes.forEach(nodeData => {
        const node = createNode(nodeData.x, nodeData.y);
        node.id = nodeData.id;
        if (nodeData.content) {
            node.querySelector('.node-text-content').innerHTML = nodeData.content;
        }
        document.getElementById('canvas-nodes').appendChild(node);
    });
    
    canvasState.edges.forEach(edge => addEdge(edge.fromNode, edge.toNode, edge.fromSide, edge.toSide));
    
    drawEdges();
}