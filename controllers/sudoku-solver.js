'use strict';

class SudokuSolver {
  constructor() {
    this.SIZE = 9;
    this.EMPTY = '.';
  }

  // Validate puzzle string
  validate(puzzleString) {
    if (!puzzleString) return { error: 'Required field missing' };
    if (puzzleString.length !== 81) return { error: 'Expected puzzle to be 81 characters long' };
    if (/[^1-9.]/.test(puzzleString)) return { error: 'Invalid characters in puzzle' };
    return { valid: true };
  }

  // Helpers: convert string to 2D grid
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

  _gridToString(grid) {
    return grid.flat().map(n => (n === 0 ? '.' : String(n))).join('');
  }

  // Row check
  checkRowPlacement(puzzleString, row, col, value) {
  const grid = this._toGrid(puzzleString);
  const val = Number(value);
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === val) return false; // check the whole row
  }
  return true;
}


  // Column check
 checkColPlacement(puzzleString, row, col, value) {
  const grid = this._toGrid(puzzleString);
  const val = Number(value);
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === val) return false; // check the whole column
  }
  return true;
}

checkRegionPlacement(puzzleString, row, col, value) {
  const grid = this._toGrid(puzzleString);
  const val = Number(value);
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if (grid[r][c] === val) return false; // check entire 3x3
    }
  }
  return true;
}

  // Solve with backtracking
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
      for (let i = 0; i < 9; i++) {
        if (grid[r][i] === val) return false;
        if (grid[i][c] === val) return false;
      }
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

  // --- FCC checkPlacement method ---
  checkPlacement(puzzleString, coordinate, value) {
    // Validate puzzle
    const v = this.validate(puzzleString);
    if (v.error) return v;

    // Validate coordinate
    const rowLetter = coordinate[0]?.toUpperCase();
    const colNum = parseInt(coordinate[1], 10);
    if (!/[A-I]/.test(rowLetter) || colNum < 1 || colNum > 9) {
      return { error: 'Invalid coordinate' };
    }

    // Validate value
    if (!/^[1-9]$/.test(String(value))) {
      return { error: 'Invalid value' };
    }

    const row = rowLetter.charCodeAt(0) - 'A'.charCodeAt(0);
    const col = colNum - 1;

    const conflicts = [];
    if (!this.checkRowPlacement(puzzleString, row, col, value)) conflicts.push('row');
    if (!this.checkColPlacement(puzzleString, row, col, value)) conflicts.push('column');
    if (!this.checkRegionPlacement(puzzleString, row, col, value)) conflicts.push('region');

    return conflicts.length ? { valid: false, conflict: conflicts } : { valid: true };
  }
}

module.exports = SudokuSolver;
