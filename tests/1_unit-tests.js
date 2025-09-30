const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
const puzzles = require('../controllers/puzzle-strings.js').puzzlesAndSolutions;

suite('Unit Tests', () => {
  const solver = new Solver();

  test('Logic handles a valid puzzle string of 81 characters', () => {
    const input = puzzles[0][0];
    const result = solver.validate(input);
    assert.propertyVal(result, 'valid', true);
  });

  test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', () => {
    const input = '1'.repeat(80) + 'X';
    const result = solver.validate(input);
    assert.propertyVal(result, 'error', 'Invalid characters in puzzle');
  });

  test('Logic handles a puzzle string that is not 81 characters in length', () => {
    const input = '1'.repeat(80);
    const result = solver.validate(input);
    assert.propertyVal(result, 'error', 'Expected puzzle to be 81 characters long');
  });

  test('Logic handles a valid row placement', () => {
    const puzzle = puzzles[0][0];
    // Row 0, Column 2, Value 3 should be valid
    assert.isTrue(solver.checkRowPlacement(puzzle, 0, 2, 3));
  });

  test('Logic handles an invalid row placement', () => {
    const puzzle = puzzles[0][0];
    // Row 0 already has '5' in it (from the puzzle string), placing another '5' should fail
    assert.isFalse(solver.checkRowPlacement(puzzle, 0, 2, 5));
  });

  test('Logic handles a valid column placement', () => {
    const puzzle = puzzles[0][0];
    // Column 1, Row 2, Value 3 should be valid
    assert.isTrue(solver.checkColPlacement(puzzle, 2, 1, 3));
  });

  test('Logic handles an invalid column placement', () => {
    const puzzle = puzzles[0][0];
    // Column 1 already has '6', placing another '6' should fail
    assert.isFalse(solver.checkColPlacement(puzzle, 2, 1, 6));
  });

  test('Logic handles a valid region (3x3 grid) placement', () => {
    const puzzle = puzzles[0][0];
    // Top-left 3x3 region, placing '4' at row 2, col 2 should be valid
    assert.isTrue(solver.checkRegionPlacement(puzzle, 2, 2, 4));
  });

  test('Logic handles an invalid region (3x3 grid) placement', () => {
    const puzzle = puzzles[0][0];
    // Top-left 3x3 region already has '1', placing another '1' at row 2, col 2 should fail
    assert.isFalse(solver.checkRegionPlacement(puzzle, 2, 2, 1));
  });

  test('Valid puzzle strings pass the solver', () => {
    const input = puzzles[0][0];
    const solution = solver.solve(input);
    assert.isString(solution);
    assert.equal(solution.length, 81);
  });

  test('Invalid puzzle strings fail the solver', () => {
    const input = '...invalid...' + '.'.repeat(68);
    const result = solver.validate(input);
    assert.propertyVal(result, 'error', 'Invalid characters in puzzle');
  });

  test('Solver returns the expected solution for an incomplete puzzle', () => {
    const input = puzzles[0][0];
    const expected = puzzles[0][1];
    const solution = solver.solve(input);
    assert.equal(solution, expected);
  });
});