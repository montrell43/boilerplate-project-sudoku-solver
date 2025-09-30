'use strict';

class SudokuSolver {
  constructor() {
    this.EMPTY = '.';
  }

  // Validate puzzle string
  validate(puzzleString) {
    if (!puzzleString) return { error: 'Required field missing' };
    if (puzzleString.length !== 81) return { error: 'Expected puzzle to be 81 characters long' };
    if (/[^1-9.]/.test(puzzleString)) return { error: 'Invalid characters in puzzle' };
    return { valid: true };
  }

  // Convert puzzle string to 2D grid
  _toGrid(puzzleString) {
    const grid = [];
    for (let r = 0; r < 9; r++) {
      const row = [];
      for (let c = 0; c < 9; c++) {
        const ch = puzzleString[r * 9 + c];
        row.push(ch === '.' ? 0 : parseInt(ch, 10));
      }
      grid.push(row);
    }
    return grid;
  }

  // Convert 2D grid back to puzzle string
  _gridToString(grid) {
    return grid.flat().map(n => (n === 0 ? '.' : String(n))).join('');
  }

  // Check row placement (ignore target if ignoreTarget = true)
  checkRowPlacement(puzzleString, row, col, value, ignoreTarget = false) {
    const grid = this._toGrid(puzzleString);
    const val = Number(value);
    for (let c = 0; c < 9; c++) {
      if (ignoreTarget && c === col) continue;
      if (grid[row][c] === val) return false;
    }
    return true;
  }

  // Check column placement
  checkColPlacement(puzzleString, row, col, value, ignoreTarget = false) {
    const grid = this._toGrid(puzzleString);
    const val = Number(value);
    for (let r = 0; r < 9; r++) {
      if (ignoreTarget && r === row) continue;
      if (grid[r][col] === val) return false;
    }
    return true;
  }

  // Check 3x3 region placement
  checkRegionPlacement(puzzleString, row, col, value, ignoreTarget = false) {
    const grid = this._toGrid(puzzleString);
    const val = Number(value);
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (ignoreTarget && r === row && c === col) continue;
        if (grid[r][c] === val) return false;
      }
    }
    return true;
  }

  // Solve puzzle using backtracking
  solve(puzzleString) {
    const valid = this.validate(puzzleString);
    if (valid.error) return { error: valid.error };

    const grid = this._toGrid(puzzleString);

    const findEmpty = () => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (grid[r][c] === 0) return [r, c];
        }
      }
      return null;
    };

    const isValidPlacement = (r, c, val) => {
      // row
      for (let col = 0; col < 9; col++) if (grid[r][col] === val) return false;
      // col
      for (let rowI = 0; rowI < 9; rowI++) if (grid[rowI][c] === val) return false;
      // region
      const startRow = Math.floor(r / 3) * 3;
      const startCol = Math.floor(c / 3) * 3;
      for (let rr = startRow; rr < startRow + 3; rr++) {
        for (let cc = startCol; cc < startCol + 3; cc++) {
          if (grid[rr][cc] === val) return false;
        }
      }
      return true;
    };

    const backtrack = () => {
      const empty = findEmpty();
      if (!empty) return true;
      const [r, c] = empty;

      for (let val = 1; val <= 9; val++) {
        if (isValidPlacement(r, c, val)) {
          grid[r][c] = val;
          if (backtrack()) return true;
          grid[r][c] = 0;
        }
      }
      return false;
    };

    if (!backtrack()) return { error: 'Puzzle cannot be solved' };
    return this._gridToString(grid);
  }

  // inside SudokuSolver class

/**
 * Flexible checkPlacement:
 * Accepts either (puzzleString, coordinate, value)
 * Or (puzzleString, rowIndex, colIndex, value)
 * Returns FCC test shapes:
 *  - { error: '...' } on invalid input
 *  - { valid: true } or { valid: false, conflict: [...] }
 */
checkPlacement(puzzleString, rowOrCoord, colOrValue, maybeValue) {
  // Validate puzzle string first
  const validation = this.validate(puzzleString);
  if (validation.error) return { error: validation.error };

  let row, col, value;

  if (maybeValue === undefined) {
    // called as (puzzleString, coordinate, value)
    const coordinate = rowOrCoord;
    row = coordinate[0].toUpperCase();
    col = parseInt(coordinate[1], 10);
    value = String(colOrValue);
  } else {
    // called as (puzzleString, rowIndex, colIndex, value)
    row = rowOrCoord;
    col = colOrValue;
    value = String(maybeValue);
  }

  // Validate row/col/value
  if (!row || !/[A-I]/.test(row) || !Number.isInteger(col) || col < 1 || col > 9) {
    return { error: 'Invalid coordinate' };
  }
  if (!/^[1-9]$/.test(value)) {
    return { error: 'Invalid value' };
  }

  // Convert row letter to index and column to 0-based
  const rowIndex = row.charCodeAt(0) - 'A'.charCodeAt(0);
  const colIndex = col - 1;

  const conflicts = [];

  if (!this.checkRowPlacement(puzzleString, rowIndex, colIndex, value)) conflicts.push('row');
  if (!this.checkColPlacement(puzzleString, rowIndex, colIndex, value)) conflicts.push('column');
  if (!this.checkRegionPlacement(puzzleString, rowIndex, colIndex, value)) conflicts.push('region');

  return conflicts.length ? { valid: false, conflict: conflicts } : { valid: true };
}

}

module.exports = SudokuSolver;
