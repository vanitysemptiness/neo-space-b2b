
class MouseTracker {
    constructor(lastx = 0.0, lasty = 0.0, currentx = 0.0, currenty = 0.0) {
        this.lastx = lastx;
        this.lasty = lasty;
        this.currentx = currentx;
        this.currenty = currenty;
    }

    updatePosition(newX, newY) {
        this.lastx = this.currentx;
        this.lasty = this.currenty;
        this.currentx = newX;
        this.currenty = newY;
    }

    getLastPosition() {
        return { x: this.lastx, y: this.lasty };
    }

    getCurrentPosition() {
        return { x: this.currentx, y: this.currenty };
    }

    setLastPostision(x, y) {
        this.lastx = x;
        this.lasty = y;
    }

    setCurrentPostition(x, y) {
        this.currentx = x;
        this.currenty = y;
    }
}

export default MouseTracker;