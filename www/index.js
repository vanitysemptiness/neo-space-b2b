import { Renderer } from './renderer.js';
import { setupEventHandlers } from './eventHandlers.js';

// const renderer = new Renderer('canvas-container');
// // do all of the event handler setup here
// setupEventHandlers(renderer);

document.addEventListener('DOMContentLoaded', (event) => {
    const renderer = new Renderer('canvas-container');
    setupEventHandlers(renderer);
});