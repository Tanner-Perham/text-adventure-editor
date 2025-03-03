/**
 * historyManager.js
 * Utility for managing undo/redo functionality in the Dialogue Editor
 */

class HistoryManager {
  constructor(initialState) {
    // The stack of previous states
    this.undoStack = [];

    // The stack of states that were undone (for redo)
    this.redoStack = [];

    // The current state
    this.currentState = initialState;

    // Maximum number of states to keep in history
    this.maxHistorySize = 50;
  }

  /**
   * Get the current state
   * @returns {any} The current state
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * Push a new state to the history stack
   * @param {any} newState The new state to push
   */
  pushState(newState) {
    // Push the current state to the undo stack
    this.undoStack.push(this.currentState);

    // Clear the redo stack since we're creating a new history branch
    this.redoStack = [];

    // Update the current state
    this.currentState = newState;

    // Limit the size of the history
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
  }

  /**
   * Undo the last state change
   * @returns {any|null} The previous state, or null if there's nothing to undo
   */
  undo() {
    if (this.undoStack.length === 0) {
      return null;
    }

    // Move the current state to the redo stack
    this.redoStack.push(this.currentState);

    // Get the previous state from the undo stack
    const previousState = this.undoStack.pop();

    // Update the current state
    this.currentState = previousState;

    return previousState;
  }

  /**
   * Redo the last undone state change
   * @returns {any|null} The next state, or null if there's nothing to redo
   */
  redo() {
    if (this.redoStack.length === 0) {
      return null;
    }

    // Move the current state to the undo stack
    this.undoStack.push(this.currentState);

    // Get the next state from the redo stack
    const nextState = this.redoStack.pop();

    // Update the current state
    this.currentState = nextState;

    return nextState;
  }

  /**
   * Check if undo is available
   * @returns {boolean} True if undo is available
   */
  canUndo() {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   * @returns {boolean} True if redo is available
   */
  canRedo() {
    return this.redoStack.length > 0;
  }

  /**
   * Get the history status information
   * @returns {Object} Object containing history status
   */
  getHistoryStatus() {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
    };
  }

  /**
   * Reset the history manager with a new initial state
   * @param {any} initialState The new initial state
   */
  reset(initialState) {
    this.undoStack = [];
    this.redoStack = [];
    this.currentState = initialState;
  }
}

export default HistoryManager;
