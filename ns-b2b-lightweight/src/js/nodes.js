import { state, setDragging, setStartPosition, setSelectedElement } from './state.js';
import { updateCanvasData } from './index.js';
import { drawEdges } from './edges.js';
import { icons } from 'lucide';

const iconSvgs = {
    trash: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3-4h8"/></svg>',
    lock: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    copy: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    bold: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>',
    italic: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>',
    underline: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>',
    list: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    listOrdered: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>'
};

export class Node {
    constructor(x = window.innerWidth/2, y = window.innerHeight/2) {
        this.element = document.createElement('div');
        this.element.id = 'node' + Date.now();
        this.element.className = 'node';
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
        this.element.style.position = 'absolute';
        
        this.setupBasicStructure();
        this.setupDrag();
        this.setupToolbar();
    }

    setupBasicStructure() {
        // Create header with name/drag handle
        this.header = document.createElement('div');
        this.header.className = 'node-name';
        this.header.textContent = this.getDefaultName();
        this.element.appendChild(this.header);
    }

    setupDrag() {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        
        this.header.addEventListener('mousedown', (e) => {
            if (state.isSpacePressed) return;
            
            isDragging = true;
            setDragging(true);
            setSelectedElement(this.element);
            this.element.classList.add('is-dragging');
            
            // Get initial positions
            startX = e.clientX;
            startY = e.clientY;
            
            e.stopPropagation();
        });
        
        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            // Calculate the actual pixel movement, accounting for scale
            const dx = (e.clientX - startX) / state.scale;
            const dy = (e.clientY - startY) / state.scale;
            
            // Update position
            const currentLeft = parseInt(this.element.style.left) || 0;
            const currentTop = parseInt(this.element.style.top) || 0;
            
            this.element.style.left = `${currentLeft + dx}px`;
            this.element.style.top = `${currentTop + dy}px`;
            
            // Update start position for next movement
            startX = e.clientX;
            startY = e.clientY;
            
            drawEdges();
        });
        
        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                setDragging(false);
                setSelectedElement(null);
                this.element.classList.remove('is-dragging');
                updateCanvasData();
                drawEdges();
            }
        });
    }

    setupToolbar() {
        this.toolbar = document.createElement('div');
        this.toolbar.className = 'node-toolbar';
        this.toolbar.style.display = 'none';
        
        // Create toolbar container
        const toolsContainer = document.createElement('div');
        toolsContainer.className = 'toolbar-tools';
        
        // Add regular tools
        const tools = this.getToolbarButtons();
        tools.forEach(tool => {
            const button = document.createElement('button');
            button.innerHTML = tool.icon;
            button.title = tool.label;
            button.onclick = tool.action;
            button.className = 'toolbar-button';
            toolsContainer.appendChild(button);
        });

        // Add delete button with trash icon
        const deleteButton = document.createElement('button');
        deleteButton.className = 'toolbar-button delete-button';
        deleteButton.title = 'Delete';
        deleteButton.innerHTML = iconSvgs.trash;
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            this.element.remove();
            this.onDelete();
        };
        
        // Add containers to toolbar
        this.toolbar.appendChild(toolsContainer);
        this.toolbar.appendChild(deleteButton);
        this.element.appendChild(this.toolbar);
        
        // Show/hide toolbar on selection
        this.element.addEventListener('click', () => {
            // Hide any other visible toolbars
            document.querySelectorAll('.node-toolbar').forEach(toolbar => {
                if (toolbar !== this.toolbar) {
                    toolbar.style.display = 'none';
                }
            });
            this.toolbar.style.display = 'flex';
            this.element.classList.add('is-selected');
        });

        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.toolbar.style.display = 'none';
                this.element.classList.remove('is-selected');
            }
        });
    }

    getDefaultName() {
        return 'New Node';
    }

    getToolbarButtons() {
        return [
            {
                icon: iconSvgs.lock,
                label: 'Lock',
                action: () => this.toggleLock()
            },
            {
                icon: iconSvgs.copy,
                label: 'Duplicate',
                action: (e) => {
                    e.stopPropagation();
                    this.duplicate();
                }
            }
        ];
    }

    toggleLock() {
        const isLocked = this.element.classList.toggle('locked');
        this.header.style.cursor = isLocked ? 'default' : 'grab';
    }

    duplicate() {
        // Create a new node of the same type
        const rect = this.element.getBoundingClientRect();
        const newNode = new this.constructor(
            parseInt(this.element.style.left) + 20,
            parseInt(this.element.style.top) + 20
        );
        
        // Copy relevant properties
        if (this.content) {
            newNode.content.innerHTML = this.content.innerHTML;
        }
        
        // Add to canvas
        document.getElementById('canvas-nodes').appendChild(newNode.element);
        updateCanvasData();
    }

    onDelete() {
        updateCanvasData();
        drawEdges();
    }
}

// For backwards compatibility
export function createNode(x, y) {
    return new TextboxNode(x, y).element;
}

export class TextboxNode extends Node {
    constructor(x, y) {
        super(x, y);
        this.element.classList.add('node-text');
        this.element.setAttribute('data-node-type', 'text');
        this.element.style.width = '480px';
        
        this.setupContent();
        this.setupResize();
    }

    getDefaultName() {
        return 'New Textbox';
    }

    getToolbarButtons() {
        return [
            ...super.getToolbarButtons(),
            {
                icon: iconSvgs.bold,
                label: 'Bold',
                action: () => document.execCommand('bold')
            },
            {
                icon: iconSvgs.italic,
                label: 'Italic',
                action: () => document.execCommand('italic')
            },
            {
                icon: iconSvgs.underline,
                label: 'Underline',
                action: () => document.execCommand('underline')
            },
            {
                icon: iconSvgs.list,
                label: 'Bullet List',
                action: () => document.execCommand('insertUnorderedList')
            },
            {
                icon: iconSvgs.listOrdered,
                label: 'Numbered List',
                action: () => document.execCommand('insertOrderedList')
            }
        ];
    }

    setupContent() {
        this.content = document.createElement('div');
        this.content.className = 'node-text-content';
        this.content.contentEditable = true;
        this.content.innerHTML = '<p>Click to edit text</p>';
        
        this.content.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.stopPropagation();
            }
        });
        
        this.content.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });

        this.element.appendChild(this.content);
    }

    setupResize() {
        const directions = ['e', 'w'];
        this.resizeHandles = directions.map(direction => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-${direction}`;
            return handle;
        });
        
        let isResizing = false;
        let startWidth, startX;
        
        this.resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                isResizing = true;
                startWidth = this.element.offsetWidth;
                startX = e.clientX;
                e.stopPropagation();
                document.body.style.cursor = 'ew-resize';
            });
            
            this.element.appendChild(handle);
        });
        
        window.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const dx = (e.clientX - startX) / state.scale;
            const side = e.target.className.includes('resize-e') ? 1 : -1;
            const newWidth = startWidth + (dx * side);
            
            if (newWidth >= 200 && newWidth <= 800) {
                this.element.style.width = `${newWidth}px`;
                if (side === -1) {
                    this.element.style.left = `${parseInt(this.element.style.left) + (dx)}px`;
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
    }
}