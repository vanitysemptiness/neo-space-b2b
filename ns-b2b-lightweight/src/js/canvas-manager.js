// canvas-manager.js
export class CanvasManager {
    constructor() {
        this.viewport = {
            scale: 1,
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        this.grid = {
            size: 20,
            visible: true,
            color: '#a5d8ff'
        };
        
        this.nodes = new Map();
        this.isDragging = false;
        this.dragTarget = null;
        this.lastMousePosition = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        // Initialize canvas container
        this.container = document.getElementById('canvas-container');
        this.nodesContainer = document.getElementById('canvas-nodes');
        
        // Set up event listeners
        this.setupEventListeners();
        this.updateTransform();
    }
    
    setupEventListeners() {
        // Mouse events for dragging
        this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Touch events for mobile
        this.container.addEventListener('touchstart', this.handleTouchStart.bind(this));
        window.addEventListener('touchmove', this.handleTouchMove.bind(this));
        window.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Resize handling
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    handleMouseDown(e) {
        if (e.target.classList.contains('node-name')) {
            this.isDragging = true;
            this.dragTarget = e.target.parentElement;
            this.lastMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
            this.dragTarget.classList.add('is-dragging');
            
            // Store initial node position for precise dragging
            const rect = this.dragTarget.getBoundingClientRect();
            this.dragInitialPosition = {
                x: rect.left,
                y: rect.top
            };
        }
    }
    
    handleMouseMove(e) {
        if (!this.isDragging || !this.dragTarget) return;
        
        // Calculate the actual movement in canvas space
        const dx = (e.clientX - this.lastMousePosition.x) / this.viewport.scale;
        const dy = (e.clientY - this.lastMousePosition.y) / this.viewport.scale;
        
        // Update node position
        const currentLeft = parseInt(this.dragTarget.style.left) || 0;
        const currentTop = parseInt(this.dragTarget.style.top) || 0;
        
        this.dragTarget.style.left = `${currentLeft + dx}px`;
        this.dragTarget.style.top = `${currentTop + dy}px`;
        
        // Update last mouse position
        this.lastMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
        
        // Update any connected edges or other dependent elements
        this.updateConnections();
    }
    
    handleMouseUp() {
        if (this.isDragging && this.dragTarget) {
            this.dragTarget.classList.remove('is-dragging');
            this.isDragging = false;
            this.dragTarget = null;
            this.saveState();
        }
    }
    
    updateTransform() {
        const transform = `translate(${this.viewport.x}px, ${this.viewport.y}px) scale(${this.viewport.scale})`;
        this.nodesContainer.style.transform = transform;
        
        // Update grid
        this.updateGrid();
    }
    
    updateGrid() {
        const gridSize = this.grid.size * this.viewport.scale;
        const offsetX = this.viewport.x % gridSize;
        const offsetY = this.viewport.y % gridSize;
        
        this.container.style.backgroundSize = `${gridSize}px ${gridSize}px`;
        this.container.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
    }
    
    // Virtual scrolling helpers
    isNodeVisible(node) {
        const rect = node.getBoundingClientRect();
        return (
            rect.right >= 0 &&
            rect.bottom >= 0 &&
            rect.left <= this.viewport.width &&
            rect.top <= this.viewport.height
        );
    }
    
    updateVisibleNodes() {
        for (const [id, node] of this.nodes) {
            if (this.isNodeVisible(node)) {
                node.style.display = 'block';
            } else {
                node.style.display = 'none';
            }
        }
    }
}