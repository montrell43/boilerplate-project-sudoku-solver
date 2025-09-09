'use strict';

const express = require('express');
const router = express.Router();
const SudokuSolver = require('../controllers/sudoku-solver');
const solver = new SudokuSolver();

// POST /api/solve  (router mounted at '/api')
router.post('/solve', (req, res) => {
  try {
    const { puzzle } = req.body;

    // Must check for undefined specifically (empty string should go to validation)
    if (puzzle === undefined) {
      return res.json({ error: 'Required field missing' });
    }

    // Validate puzzle
    const validation = solver.validate(puzzle);
    if (validation.error) return res.json({ error: validation.error });

    // Attempt solve
    const solution = solver.completeSudoku(puzzle);

    // If completeSudoku returned an error object, forward it
    if (solution && typeof solution === 'object' && solution.error) {
      return res.json(solution);
    }

    // Otherwise solution should be the solved string
    return res.json({ solution });

  } catch (err) {
    console.error(err);
    return res.json({ error: 'Server error' });
  }
});

// POST /api/check
router.post('/check', (req, res) => {
  try {
    const { puzzle, coordinate, value } = req.body;

    // Router-level missing-fields message must match FCC spec
    if (puzzle === undefined || coordinate === undefined || value === undefined) {
      return res.json({ error: 'Required field(s) missing' });
    }

    // Validate puzzle
    const validation = solver.validate(puzzle);
    if (validation.error) return res.json({ error: validation.error });

    // Validate coordinate (router-level)
    const row = coordinate[0]?.toUpperCase();
    const col = parseInt(coordinate.slice(1));
    if (!/[A-I]/.test(row) || col < 1 || col > 9) {
      return res.json({ error: 'Invalid coordinate' });
    }

    // Validate value (router-level)
    if (!/^[1-9]$/.test(String(value))) {
      return res.json({ error: 'Invalid value' });
    }

    // We will call the flexible checkPlacement (it accepts row & col or coordinate)
    const result = solver.checkPlacement(puzzle, row, col, String(value));

    return res.json(result);

  } catch (err) {
    console.error(err);
    return res.json({ error: 'Server error' });
  }
});

module.exports = router;
