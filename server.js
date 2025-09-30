'use strict';

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('<h1>Sudoku Solver API</h1><p>Use the FCC tester to run tests.</p>');
});

// FCC test runner (optional)
if (process.env.NODE_ENV === 'test') {
  try {
    const runner = require('./_fcc/test-runner');
    if (runner && runner.report) {
      app.get('/_api/get-tests', (req, res) => res.json(runner.report));
    }
  } catch {
    console.warn('FCC test runner not found, skipping...');
  }
}

const PORT = process.env.PORT || 3000;
if (!module.parent) {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  });
}

module.exports = app;
