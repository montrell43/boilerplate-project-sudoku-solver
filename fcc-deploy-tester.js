const axios = require('axios');

// Replace with your deployed URL
const BASE_URL = 'https://boilerplate-project-sudoku-solver-wu4o.onrender.com';

// Example puzzle (incomplete, valid)
//const examplePuzzle = '82..4..6..1..3..9..5..7..3..6..8..4..1..2..9..7..5..3..6..9..2..8..7..4..5..1..';

const { puzzlesAndSolutions } = require('./puzzles'); // adjust path if needed

const examplePuzzle = puzzlesAndSolutions[0][0]; // first puzzle, 81 chars
const exampleSolution = puzzlesAndSolutions[0][1]; // its solution

// Example coordinate/value for check
const exampleCheck = {
  coordinate: 'A2',
  value: '3',
};

// async function testSolve() {
//   try {
//     const res = await axios.post(`${BASE_URL}/api/solve`, {
//       puzzle: examplePuzzle,
//     });
//     console.log('--- /api/solve response ---');
//     console.log(res.data);
//   } catch (err) {
//     console.error(err.response ? err.response.data : err.message);
//   }
// }

// async function testCheck() {
//   try {
//     const res = await axios.post(`${BASE_URL}/api/check`, {
//       puzzle: examplePuzzle,
//       coordinate: exampleCheck.coordinate,
//       value: exampleCheck.value,
//     });
//     console.log('--- /api/check response ---');
//     console.log(res.data);
//   } catch (err) {
//     console.error(err.response ? err.response.data : err.message);
//   }
// }

// async function runTests() {
//   await testSolve();
//   await testCheck();
// }

async function testPuzzle(puzzle, solution) {
  try {
    // 1️⃣ Test /api/solve
    const solveRes = await axios.post(`${BASE_URL}/api/solve`, { puzzle });
    if (solveRes.data.solution === solution) {
      console.log('✅ /api/solve passed');
    } else {
      console.log('❌ /api/solve failed');
      console.log('Expected:', solution);
      console.log('Received:', solveRes.data.solution);
    }

    // 2️⃣ Test /api/check for all empty cells
    for (let i = 0; i < puzzle.length; i++) {
      if (puzzle[i] === '.') {
        const row = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i / 9));
        const col = (i % 9) + 1;
        const coordinate = `${row}${col}`;
        const value = solution[i];

        const checkRes = await axios.post(`${BASE_URL}/api/check`, {
          puzzle,
          coordinate,
          value,
        });

        if (checkRes.data.valid === true) {
          console.log(`✅ /api/check passed for ${coordinate}=${value}`);
        } else {
          console.log(`❌ /api/check failed for ${coordinate}=${value}`);
          console.log('Received:', checkRes.data);
        }
      }
    }

  } catch (err) {
    console.error('Error testing puzzle:', err.response ? err.response.data : err.message);
  }
}

async function runAllTests() {
  for (const [puzzle, solution] of puzzlesAndSolutions) {
    console.log('\n=== Testing new puzzle ===');
    await testPuzzle(puzzle, solution);
  }
}

runAllTests();
