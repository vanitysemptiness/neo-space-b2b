
// this is serving as the state variable for now
const Mode = Object.freeze({
    SELECT: 'select',
    SQUARE: 'square'
});

// highlight the buttons blue so user knows what mode they are in
function updateButtonStyles() {
    squareBtn.classList.toggle('active', currentMode === Mode.SQUARE);
    selectBtn.classList.toggle('active', currentMode === Mode.SELECT);
}

export function setupEventHandlers(renderer) {
    const squareBtn = document.getElementById('squareBtn');
    const selectBtn = document.getElementById('selectBtn');
    // const dragBtn = document.getElementById('dragBtn');
    // const editBtn = document.getElementById('editBtn');

    // mode changes
    squareBtn.addEventListener('click', () => {
        console.log("shape mode")
        currentMode = Mode.SQUARE;
        document.body.style.cursor = 'default'
    });

    // the hand button
    selectBtn.addEventListener('click', () => {
        console.log("select mode");
        currentMode = Mode.SELECT;
        // change to the hand cursor called pointer
        document.body.style.cursor = 'pointer'
    });

    renderer.stage.on('mousedown touchstart', (e) => {
        if (currentMode === Mode.SQUARE) {
            renderer.startDrawing();
        } else if (currentMode === Mode.SELECT) {
            renderer.startSelecting();
        }
    });

    renderer.stage.on('mousemove touchmove', (e) => {
        if (currentMode === Mode.SQUARE) {
            renderer.continueDrawing();
        } else if (currentMode == Mode.SELECT) {
            renderer.continueSelecting();
        }
    });

    renderer.stage.on('mouseup touchend', (e) => {
        if (currentMode === Mode.SQUARE) {
            renderer.endDrawing();
        } else if (currentMode == Mode.SELECT) {
            renderer.endSelecting();
        }
    });

    // document is a universal variable that is above everything
    document.addEventListener('keydown', (e) => {
        console.log(e.key);
        if (e.key === 'Delete' || e.key === 'Backspace') {
            console.log('delete');
            if (currentMode === Mode.SELECT) {
                renderer.deleteSelected();
            }
        }
    });
}



// default to select mode until user chooses otherwise
let currentMode = Mode.SELECT;
// set initial button selection
updateButtonStyles();
