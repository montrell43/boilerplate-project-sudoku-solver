'use strict';

class SudokuSolver {
  constructor() {
    this.SIZE = 9;
    this.EMPTY = '.';
    this.ROWS = 'ABCDEFGHI';
  }

  // Convert letter row (A-I) to index (0-8)
  letterToRow(rowChar) {
    return this.ROWS.indexOf(rowChar?.toUpperCase());
  }

  // Validate puzzle string
  validate(puzzleString) {
    if (puzzleString === undefined) return { error: 'Required field missing' };
    if (/[^1-9.]/.test(puzzleString)) return { error: 'Invalid characters in puzzle' };
    if (puzzleString.length !== 81) return { error: 'Expected puzzle to be 81 characters long' };
    return { ok: true };
  }

  // Convert puzzle string -> 2D array board
  stringToBoard(puzzleString) {
    if (puzzleString.length !== 81) throw new Error('Puzzle string must be exactly 81 characters long');

    const board = [];
    for (let i = 0; i < 81; i += 9) board.push(puzzleString.slice(i, i + 9).split(''));
    return board;
  }

  // Check row placement (ignores the target cell itself)
  checkRowPlacement(puzzleString, row, col, value) {
  const r = typeof row === 'string' ? this.letterToRow(row) : row;
  const c = col - 1;
  for (let i = 0; i < 9; i++) {
    if (i === c) continue; // skip the target cell
    if (puzzleString[r * 9 + i] === String(value)) return false;
  }
  return true;
}


  // Check column placement (ignores the target cell itself)
  checkColPlacement(puzzleString, row, col, value) {
    const r = typeof row === 'string' ? this.letterToRow(row) : row;
    const c = col - 1;
    for (let i = 0; i < 9; i++) {
      if (i === r) continue; // ignore target cell
      if (puzzleString[i * 9 + c] === String(value)) return false;
    }
    return true;
  }

  // Check 3x3 region placement (ignores the target cell itself)
  checkRegionPlacement(puzzleString, row, col, value) {
    const r = typeof row === 'string' ? this.letterToRow(row) : row;
    const c = col - 1;
    const startRow = Math.floor(r / 3) * 3;
    const startCol = Math.floor(c / 3) * 3;
    
    for (let rr = 0; rr < 3; rr++) {
      for (let cc = 0; cc < 3; cc++) {
        const curRow = startRow + rr;
        const curCol = startCol + cc;
        if (curRow === r && curCol === c) continue; // ignore target
        if (puzzleString[curRow * 9 + curCol] === String(value)) return false;
      }
    }
    return true;
  }

  // Solve board (backtracking). Returns true if solved, false if unsolvable.
  solve(input) {
  let board = Array.isArray(input) ? input : this.stringToBoard(input);

for (let r = 0; r < board.length; r++) {
      if (typeof board[r] === 'string') board[r] = board[r].split('');
    }

    const isValid = (board, row, col, num) => {
      const s = String(num);
      // row
      for (let c = 0; c < 9; c++) if (board[row][c] === s) return false;
      // col
      for (let r = 0; r < 9; r++) if (board[r][col] === s) return false;
      // box
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (board[boxRow + r][boxCol + c] === s) return false;
        }
      }
      return true;
    };

    const backtrack = () => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c] === this.EMPTY) {
            for (let n = 1; n <= 9; n++) {
              if (isValid(board, r, c, n)) {
                board[r][c] = String(n);
                if (backtrack()) return true;
                board[r][c] = this.EMPTY;
              }
            }
            return false; // no number fits
          }
        }
      }
      return true; // filled successfully
    };

    return backtrack();
  }

  // completeSudoku: returns { error: ... } if invalid or unsolvable, otherwise returns solved string
  // completeSudoku: returns { error: ... } if invalid or unsolvable,
// otherwise returns solved puzzle string
completeSudoku(puzzleStr) {
  // Step 1: validate
  const v = this.validate(puzzleStr);
  if (v.error) return v; // keep exact error shape

  // Step 2: convert to 2D board
  let board;
  try {
    board = this.stringToBoard(puzzleStr);
  } catch (err) {
    return { error: 'Expected puzzle to be 81 characters long' };
  }

  // Step 3: attempt to solve
  const solvable = this.solve(board);
  if (!solvable) return resizeBy.json({ error: 'Puzzle cannot be solved' });

  // Step 4: flatten back to solved string
  return board.flat().join('');
}


  /*
    Flexible checkPlacement:
      - Accepts either (puzzleString, coordinate, value)
      - Or (puzzleString, rowLetter, colNumber, value)
    Returns exact shapes used by FCC tests:
      - { error: '...' } on invalid input
      - { valid: true } or { valid: false, conflict: [...] }
  */
  checkPlacement(puzzleString, coordOrRow, colOrValue, maybeValue) {
    // Validate puzzle first
    const v = this.validate(puzzleString);
    if (v.error) return v;

    let row, col, value;
    if (maybeValue === undefined) {
      // called as (puzzleString, coordinate, value)
      const coordinate = coordOrRow;
      row = coordinate?.[0]?.toUpperCase();
      col = parseInt(coordinate?.slice(1));
      value = String(colOrValue);
    } else {
      // called as (puzzleString, row, col, value)
      row = coordOrRow;
      col = Number(colOrValue);
      value = String(maybeValue);
    }

    // validate coordinate and value exact messages
    if (!row || !/[A-I]/.test(row) || !Number.isInteger(col) || col < 1 || col > 9) {
      return { error: 'Invalid coordinate' };
    }
    if (!/^[1-9]$/.test(String(value))) {
      return { error: 'Invalid value' };
    }

    const conflicts = [];
    if (!this.checkRowPlacement(puzzleString, row, col, value)) conflicts.push('row');
    if (!this.checkColPlacement(puzzleString, row, col, value)) conflicts.push('column');
    if (!this.checkRegionPlacement(puzzleString, row, col, value)) conflicts.push('region');

    return conflicts.length ? { valid: false, conflict: conflicts } : { valid: true };
  }
}

module.exports = SudokuSolver;
