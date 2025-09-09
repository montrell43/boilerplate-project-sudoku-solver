const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
let solver = new Solver();

suite('Unit Tests', () => {
  test('Logic handles a valid puzzle string of 81 characters', () => {
    const valid = '.'.repeat(81);
    assert.deepEqual(solver.validate(valid), { ok: true });
  });

  test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', () => {
    const bad = '1'.repeat(80) + 'X';
    assert.deepEqual(solver.validate(bad), { error: 'Invalid characters in puzzle' });
  });

  test('Logic handles a puzzle string that is not 81 characters in length', () => {
    const short = '1'.repeat(80);
    assert.deepEqual(solver.validate(short), { error: 'Expected puzzle to be 81 characters long' });
  });

  test('Logic handles a valid row placement', () => {
    const puzzle = '53..7....' +
                   '6..195...' +
                   '.98....6.' +
                   '8...6...3' +
                   '4..8.3..1' +
                   '7...2...6' +
                   '.6....28.' +
                   '...419..5' +
                   '....8..79';
    assert.isTrue(solver.checkRowPlacement(puzzle, 'A', 3, 4)); // row A, col 3
  });

  test('Logic handles an invalid row placement', () => {
    const puzzle = '.'.repeat(81);
    assert.isFalse(solver.checkRowPlacement(puzzle, 'A', 1, 1)); // row already has 1
  });

  test('Logic handles a valid column placement', () => {
    const puzzle = '.'.repeat(81);
    assert.isTrue(solver.checkColPlacement(puzzle, 'A', 1, 1));
  });

  test('Logic handles an invalid column placement', () => {
    let puzzle = '.'.repeat(9) +
                 '1........' + // put a 1 in column 1
                 '.'.repeat(71);
    assert.isFalse(solver.checkColPlacement(puzzle, 'A', 1, 1));
  });

  test('Logic handles a valid region (3x3 grid) placement', () => {
    const puzzle = '.'.repeat(81);
    assert.isTrue(solver.checkRegionPlacement(puzzle, 'A', 1, 1));
  });

  test('Logic handles an invalid region (3x3 grid) placement', () => {
    let puzzle = '1........' +
                 '.'.repeat(72);
    assert.isFalse(solver.checkRegionPlacement(puzzle, 'B', 2, 1));
  });

  test('Valid puzzle strings pass the solver', () => {
    const puzzle = '53..7....' +
                   '6..195...' +
                   '.98....6.' +
                   '8...6...3' +
                   '4..8.3..1' +
                   '7...2...6' +
                   '.6....28.' +
                   '...419..5' +
                   '....8..79';
    const result = solver.solve(puzzle);
    assert.property(result, 'solution');
    assert.equal(result.solution.length, 81);
  });

  test('Invalid puzzle strings fail the solver', () => {
    const puzzle = '1'.repeat(81); // clearly invalid
    const result = solver.solve(puzzle);
    assert.deepEqual(result, { error: 'Puzzle cannot be solved' });
  });

  test('Solver returns the expected solution for an incomplete puzzle', () => {
    const puzzle = '53..7....' +
                   '6..195...' +
                   '.98....6.' +
                   '8...6...3' +
                   '4..8.3..1' +
                   '7...2...6' +
                   '.6....28.' +
                   '...419..5' +
                   '....8..79';
    const solution = solver.solve(puzzle).solution;
    assert.equal(solution, '534678912672195348198342567859761423426853791713924856961537284287419635345286179');
  });
});
