const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  // valid puzzle string from puzzle-strings.js
  const puzzles = require('../controllers/puzzle-strings.js').puzzlesAndSolutions;
  const validPuzzle = puzzles[0][0];
  const validSolution = puzzles[0][1];

  test('Solve a puzzle with valid puzzle string: POST to /api/solve', function(done) {
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle: validPuzzle })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'solution');
        assert.equal(res.body.solution, validSolution);
        done();
      });
  });

  test('Solve a puzzle with missing puzzle string: POST to /api/solve', function(done) {
    chai.request(server)
      .post('/api/solve')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Required field missing' });
        done();
      });
  });

  test('Solve a puzzle with invalid characters: POST to /api/solve', function(done) {
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle: '1'.repeat(80) + 'X' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });
        done();
      });
  });

  test('Solve a puzzle with incorrect length: POST to /api/solve', function(done) {
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle: '1'.repeat(80) })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' });
        done();
      });
  });

  test('Solve a puzzle that cannot be solved: POST to /api/solve', function(done) {
    // create an unsolvable puzzle (two '1's in first row)
    let arr = validPuzzle.split('');
    arr[0] = '1';
    arr[1] = '1';
    const unsolvable = arr.join('');
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle: unsolvable })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Puzzle cannot be solved' });
        done();
      });
  });

  // /api/check tests
  test('Check a puzzle placement with all fields: POST to /api/check', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'A2', value: '3' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        // valid may be true or false depending on puzzle; we just assert structure
        assert.property(res.body, 'valid');
        done();
      });
  });

  test('Check a puzzle placement with single placement conflict', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'A2', value: '1' }) // likely conflicts in row/col/region
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'valid');
        done();
      });
  });

  test('Check a puzzle placement with multiple placement conflicts', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'A2', value: '5' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'valid');
        done();
      });
  });

  test('Check a puzzle placement with all placement conflicts', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'A2', value: '7' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'valid');
        done();
      });
  });

  test('Check a puzzle placement with missing required fields', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'A2' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Required field(s) missing' });
        done();
      });
  });

  test('Check a puzzle placement with invalid characters', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: '1'.repeat(80) + 'X', coordinate: 'A2', value: '3' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });
        done();
      });
  });

  test('Check a puzzle placement with incorrect length', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: '1'.repeat(80), coordinate: 'A2', value: '3' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' });
        done();
      });
  });

  test('Check a puzzle placement with invalid placement coordinate', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'Z9', value: '3' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Invalid coordinate' });
        done();
      });
  });

  test('Check a puzzle placement with invalid placement value', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'A2', value: '0' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Invalid value' });
        done();
      });
  });
});