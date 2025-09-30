'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  const solver = new SudokuSolver();

  // POST /api/solve
  app.route('/api/solve')
    .post((req, res) => {
      const puzzle = req.body.puzzle;

      if (puzzle === undefined) {
        return res.json({ error: 'Required field missing' });
      }

      // validate characters and length using solver.validate
      const v = solver.validate(puzzle);
      if (v.error) {
        // map validation errors to required messages
        if (v.error === 'Expected puzzle to be 81 characters long') return res.json({ error: v.error });
        if (v.error === 'Invalid characters in puzzle') return res.json({ error: v.error });
        // fallback
        return res.json({ error: v.error });
      }

      const solution = solver.solve(puzzle);
      if (typeof solution === 'object' && solution.error) {
        return res.json({ error: solution.error });
      }
      return res.json({ solution });
    });

  // POST /api/check
  app.route('/api/check')
    .post((req, res) => {
      const puzzle = req.body.puzzle;
      const coordinate = req.body.coordinate;
      const value = req.body.value;

      if (puzzle === undefined || coordinate === undefined || value === undefined) {
        return res.json({ error: 'Required field(s) missing' });
      }

      // puzzle validation
      const v = solver.validate(puzzle);
      if (v.error) {
        if (v.error === 'Expected puzzle to be 81 characters long') return res.json({ error: v.error });
        if (v.error === 'Invalid characters in puzzle') return res.json({ error: v.error });
        return res.json({ error: v.error });
      }

      // coordinate validation: letter A-I (case-insensitive) + number 1-9
      if (!/^[A-Ia-i][1-9]$/.test(coordinate)) {
        return res.json({ error: 'Invalid coordinate' });
      }

      // value must be 1-9
      if (!/^[1-9]$/.test(String(value))) {
        return res.json({ error: 'Invalid value' });
      }

      // map coordinate to row/col indices
      const rowLetter = coordinate[0].toUpperCase();
      const colNum = parseInt(coordinate[1], 10);
      const rowIndex = rowLetter.charCodeAt(0) - 'A'.charCodeAt(0);
      const colIndex = colNum - 1;

      // If the value is already placed on that coordinate and is not conflicting, return valid:true
      // Use solver check functions
      const conflicts = [];

      if (!solver.checkRowPlacement(puzzle, rowIndex, colIndex, value)) conflicts.push('row');
      if (!solver.checkColPlacement(puzzle, rowIndex, colIndex, value)) conflicts.push('column');
      if (!solver.checkRegionPlacement(puzzle, rowIndex, colIndex, value)) conflicts.push('region');

      if (conflicts.length === 0) {
        return res.json({ valid: true });
      } else {
        return res.json({ valid: false, conflict: conflicts });
      }
    });
};