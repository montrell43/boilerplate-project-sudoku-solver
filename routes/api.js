'use strict';

const express = require('express');
const router = express.Router();
const SudokuSolver = require('../controllers/sudoku-solver');
const solver = new SudokuSolver();

// ---------- POST /api/solve ----------
router.post('/solve', (req, res) => {
  const { puzzle } = req.body;
  if (puzzle === undefined) return res.json({ error: 'Required field missing' });

  const validation = solver.validate(puzzle);
  if (validation.error) return res.json({ error: validation.error });

  const result = solver.completeSudoku(puzzle);
  if (result.error) return res.json(result);

  return res.json({ solution: result });
});

// ---------- POST /api/check ----------
router.post('/check', (req, res) => {
  const { puzzle, coordinate, value } = req.body;
  if (puzzle === undefined || coordinate === undefined || value === undefined) {
    return res.json({ error: 'Required field(s) missing' });
  }

  const result = solver.checkPlacement(puzzle, coordinate, value);
  return res.json(result);
});

module.exports = router;
