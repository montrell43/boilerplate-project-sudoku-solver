'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  const solver = new SudokuSolver();

  // POST /api/solve
  // POST /api/solve
app.route('/api/solve')
  .post((req, res) => {
    const puzzle = req.body.puzzle;

    if (puzzle === undefined) {
      return res.json({ error: 'Required field missing' });
    }

    // Validate puzzle
    const validation = solver.validate(puzzle);
    if (validation.error) {
      // FCC expects **these exact messages**
      if (validation.error === 'Expected puzzle to be 81 characters long') {
        return res.json({ error: 'Expected puzzle to be 81 characters long' });
      }
      if (validation.error === 'Invalid characters in puzzle') {
        return res.json({ error: 'Invalid characters in puzzle' });
      }
      if (validation.error === 'Required field missing') {
        return res.json({ error: 'Required field missing' });
      }
      // fallback just in case
      return res.json({ error: validation.error });
    }

    // Solve puzzle
    const solution = solver.solve(puzzle);

    if (solution && solution.error === 'Puzzle cannot be solved') {
      // FCC expects this exact message
      return res.json({ error: 'Puzzle cannot be solved' });
    }

    return res.json({ solution });
  });

  // POST /api/check
  // POST /api/check
app.route('/api/check')
  .post((req, res) => {
    const { puzzle, coordinate, value } = req.body;

    // Check required fields
    if (!puzzle || !coordinate || !value) {
      return res.json({ error: 'Required field(s) missing' });
    }

    // Validate puzzle string
    const validation = solver.validate(puzzle);
    if (validation.error) {
      if (validation.error === 'Expected puzzle to be 81 characters long') {
        return res.json({ error: 'Expected puzzle to be 81 characters long' });
      }
      if (validation.error === 'Invalid characters in puzzle') {
        return res.json({ error: 'Invalid characters in puzzle' });
      }
      return res.json({ error: validation.error });
    }

    // Validate coordinate: letter A-I + number 1-9
    if (!/^[A-Ia-i][1-9]$/.test(coordinate)) {
      return res.json({ error: 'Invalid coordinate' });
    }

    // Validate value: 1-9
    if (!/^[1-9]$/.test(String(value))) {
      return res.json({ error: 'Invalid value' });
    }

    // Map coordinate to row/col indices
    const row = coordinate[0].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    const col = parseInt(coordinate[1], 10) - 1;

    // Check placement conflicts
    const conflicts = [];
    if (!solver.checkRowPlacement(puzzle, row, col, value)) conflicts.push('row');
    if (!solver.checkColPlacement(puzzle, row, col, value)) conflicts.push('column');
    if (!solver.checkRegionPlacement(puzzle, row, col, value)) conflicts.push('region');

    // Return result in FCC format
    if (conflicts.length === 0) {
      return res.json({ valid: true });
    } else {
      return res.json({ valid: false, conflict: conflicts });
    }
  });

};