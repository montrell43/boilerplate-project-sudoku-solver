'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const SudokuSolver = require('./controllers/sudoku-solver.js');
const cors        = require('cors');
const fcctesting = require('./routes/fcctesting.js');
const apiRoutes = require('./routes/api.js')
const app = express();
const solver = new SudokuSolver();
const PORT = process.env.PORT || 3000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({origin: '*'})); //For FCC testing purposes only
app.use(express.static('public'));

fcctesting(app);

apiRoutes(app);

// POST /api/solve
app.post('/api/solve', (req, res) => {
  const puzzle = req.body.puzzle;

  // Required field check
  if (!puzzle) return res.json({ error: 'Required field missing' });

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

  // Solve puzzle
  const solution = solver.solve(puzzle);
  if (typeof solution === 'object' && solution.error) {
    return res.json({ error: solution.error });
  }

  return res.json({ solution });
});

// POST /api/check
app.post('/api/check', (req, res) => {
  const { puzzle, coordinate, value } = req.body;

  // Required fields
  if (!puzzle || !coordinate || !value) {
    return res.json({ error: 'Required field(s) missing' });
  }

  // Validate puzzle
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

  // Validate coordinate
  if (!/^[A-Ia-i][1-9]$/.test(coordinate)) {
    return res.json({ error: 'Invalid coordinate' });
  }

  // Validate value
  if (!/^[1-9]$/.test(String(value))) {
    return res.json({ error: 'Invalid value' });
  }

  // Map coordinate to row/col indices
  const row = coordinate[0].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
  const col = parseInt(coordinate[1], 10) - 1;
  const index = row * 9 + col;
if (puzzle[index] === value) {
  return res.json({ valid: true });
}

  // Check for conflicts
  const conflicts = [];
  
  if (!solver.checkRowPlacement(puzzle, row, col, value)) conflicts.push('row');
  if (!solver.checkColPlacement(puzzle, row, col, value)) conflicts.push('column');
  if (!solver.checkRegionPlacement(puzzle, row, col, value)) conflicts.push('region');

  if (conflicts.length === 0) {
    return res.json({ valid: true });
  } else {
    return res.json({ valid: false, conflict: conflicts });
  }
});

app.get('/_api/get-tests', (req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    return res.json({ status: 'unavailable' });
  }
  next(); // let fcctesting routes handle the test array
});


// Start server
//const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sudoku Solver API listening on port ${PORT}`);
});

module.exports = app;
