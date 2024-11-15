// Edge state
export const edges = [];

// Get anchor point for edge connection
function getAnchorPoint(node, side) {
    const x = parseInt(node.style.left, 10);
    const y = parseInt(node.style.top, 10);
    const width = node.offsetWidth;
    const height = node.offsetHeight;

    switch (side) {
        case 'top':
            return { x: x + width / 2, y: y };
        case 'right':
            return { x: x + width, y: y + height / 2 };
        case 'bottom':
            return { x: x + width / 2, y: y + height };
        case 'left':
            return { x: x, y: y + height / 2 };
        default:
            return { x: x + width / 2, y: y + height / 2 };
    }
}

// Draw all edges
export function drawEdges() {
    const svgContainer = document.getElementById('edge-paths');
    if (!svgContainer) return;
    
    svgContainer.innerHTML = '';

    edges.forEach(edge => {
        const fromNode = document.getElementById(edge.fromNode);
        const toNode = document.getElementById(edge.toNode);

        if (fromNode && toNode) {
            const fromPoint = getAnchorPoint(fromNode, edge.fromSide);
            const toPoint = getAnchorPoint(toNode, edge.toSide);

            const curveTightness = 0.75;
            const controlPointX1 = fromPoint.x + (toPoint.x - fromPoint.x) * curveTightness;
            const controlPointX2 = fromPoint.x + (toPoint.x - fromPoint.x) * (1 - curveTightness);
            const controlPointY1 = fromPoint.y;
            const controlPointY2 = toPoint.y;

            const d = `M ${fromPoint.x} ${fromPoint.y} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${toPoint.x} ${toPoint.y}`;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            path.setAttribute('stroke', 'black');
            path.setAttribute('fill', 'none');
            if (edge.toEnd === 'arrow') {
                path.setAttribute('marker-end', 'url(#arrowhead)');
            }

            svgContainer.appendChild(path);
        }
    });
}

// Add a new edge
export function addEdge(fromNode, toNode, fromSide = 'right', toSide = 'left', toEnd = 'arrow') {
    edges.push({
        fromNode,
        toNode,
        fromSide,
        toSide,
        toEnd
    });
    drawEdges();
}