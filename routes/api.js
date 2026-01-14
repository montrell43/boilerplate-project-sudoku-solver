'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function(app) {
  const solver = new SudokuSolver();

  // POST /api/solve
  app.post('/api/solve', (req, res) => {
    const puzzle = req.body.puzzle;
    if (!puzzle) return res.json({ error: 'Required field missing' });

    const validation = solver.validate(puzzle);
    if (validation.error) return res.json({ error: validation.error });

    const solution = solver.solve(puzzle);
    if (!solution || solution.error) return res.json({ error: 'Puzzle cannot be solved' });

    res.json({ solution });
  });

  // POST /api/check
  app.post('/api/check', (req, res) => {
    const { puzzle, coordinate, value } = req.body;
    if (!puzzle || !coordinate || !value) return res.json({ error: 'Required field(s) missing' });

    const validation = solver.validate(puzzle);
    if (validation.error) return res.json({ error: validation.error });

    if (!/^[A-Ia-i][1-9]$/.test(coordinate)) return res.json({ error: 'Invalid coordinate' });
    if (!/^[1-9]$/.test(String(value))) return res.json({ error: 'Invalid value' });

    const row = coordinate[0].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    const col = parseInt(coordinate[1], 10) - 1;
    const index = row * 9 + col;

    if (puzzle[index] === value) return res.json({ valid: true });

    const conflicts = [];
    if (!solver.checkRowPlacement(puzzle, row, col, value)) conflicts.push('row');
    if (!solver.checkColPlacement(puzzle, row, col, value)) conflicts.push('column');
    if (!solver.checkRegionPlacement(puzzle, row, col, value)) conflicts.push('region');

    res.json(conflicts.length ? { valid: false, conflict: conflicts } : { valid: true });
  });
};
