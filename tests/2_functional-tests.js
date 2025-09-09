const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {

  test('Solve a puzzle with valid puzzle string: POST /api/solve', (done) => {
    const puzzle = '53..7....6..195... .98....6.8...6...34..8.3..17...2...6.6....28...419..5....8..79'.replace(/\s/g,'');
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'solution');
        assert.equal(res.body.solution.length, 81);
        done();
      });
  });

  test('Solve a puzzle with missing puzzle string: POST /api/solve', (done) => {
    chai.request(server)
      .post('/api/solve')
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Required field missing' });
        done();
      });
  });

  test('Solve a puzzle with invalid characters: POST /api/solve', (done) => {
    const puzzle = '53..7....6..195...X98....6.8...6...34..8.3..17...2...6.6....28...419..5....8..79'.replace(/\s/g,'');
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });
        done();
      });
  });

  test('Solve a puzzle with incorrect length: POST /api/solve', (done) => {
    const puzzle = '53..7....6..195...'.replace(/\s/g,''); // too short
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' });
        done();
      });
  });

  test('Solve a puzzle that cannot be solved: POST /api/solve', (done) => {
    const puzzle = '1'.repeat(81);
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'puzzle cannot be solved' });
        done();
      });
  });

  test('Check a puzzle placement with all fields: POST /api/check', (done) => {
    const puzzle = '53..7....6..195... .98....6.8...6...34..8.3..17...2...6.6....28...419..5....8..79'.replace(/\s/g,'');
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A1', value: 5 })
      .end((err, res) => {
        assert.property(res.body, 'valid');
        done();
      });
  });

  test('Check a puzzle placement with single placement conflict: POST /api/check', (done) => {
    const puzzle = '.'.repeat(81);
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A1', value: 1 })
      .end((err, res) => {
        assert.property(res.body, 'valid');
        done();
      });
  });

  test('Check a puzzle placement with multiple placement conflicts: POST /api/check', (done) => {
    const puzzle = '1'.repeat(81);
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A1', value: 1 })
      .end((err, res) => {
        assert.property(res.body, 'valid');
        done();
      });
  });

  test('Check a puzzle placement with all placement conflicts: POST /api/check', (done) => {
    const puzzle = '1'.repeat(81);
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A1', value: 1 })
      .end((err, res) => {
        assert.property(res.body, 'valid');
        done();
      });
  });

  test('Check a puzzle placement with missing required fields: POST /api/check', (done) => {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: '...' })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'Required field(s) missing' });
        done();
      });
  });

  test('Check a puzzle placement with invalid characters: POST /api/check', (done) => {
    const puzzle = 'X'.repeat(81);
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A1', value: 1 })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });
        done();
      });
  });

  test('Check a puzzle placement with incorrect length: POST /api/check', (done) => {
    const puzzle = '123';
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A1', value: 1 })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' });
        done();
      });
  });

  test('Check a puzzle placement with invalid placement coordinate: POST /api/check', (done) => {
    const puzzle = '.'.repeat(81);
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'Z9', value: 1 })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'Invalid coordinate' });
        done();
      });
  });

  test('Check a puzzle placement with invalid placement value: POST /api/check', (done) => {
    const puzzle = '.'.repeat(81);
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A1', value: 0 })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'Invalid value' });
        done();
      });
  });

});
