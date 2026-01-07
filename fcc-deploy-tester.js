const axios = require('axios');
const { puzzlesAndSolutions } = require('./puzzles');

// 🔁 CHANGE THIS if needed
const BASE_URL = 'http://localhost:3000';
// const BASE_URL = 'https://your-render-url.onrender.com';

async function testPuzzle(puzzle, solution) {
  try {
    // ---------- /api/solve ----------
    const solveRes = await axios.post(`${BASE_URL}/api/solve`, { puzzle });

    if (!solveRes.data.solution) {
      console.error('❌ /api/solve missing solution');
      console.error(solveRes.data);
      return;
    }

    if (solveRes.data.solution !== solution) {
      console.error('❌ /api/solve incorrect solution');
      console.error('Expected:', solution);
      console.error('Received:', solveRes.data.solution);
      return;
    }

    console.log('✅ /api/solve passed');

    // ---------- /api/check ----------
    for (let i = 0; i < puzzle.length; i++) {
      if (puzzle[i] === '.') {
        const row = String.fromCharCode(65 + Math.floor(i / 9));
        const col = (i % 9) + 1;
        const coordinate = `${row}${col}`;
        const value = solution[i];

        const checkRes = await axios.post(`${BASE_URL}/api/check`, {
          puzzle,
          coordinate,
          value
        });

        if (checkRes.data.valid !== true) {
          console.error(`❌ /api/check failed at ${coordinate}=${value}`);
          console.error('Response:', checkRes.data);
          return;
        }

        console.log(`✅ /api/check passed for ${coordinate}=${value}`);
      }
    }

  } catch (err) {
    console.error('🔥 REQUEST FAILED');

    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else if (err.request) {
      console.error('No response received');
    } else {
      console.error('Error:', err.message);
    }
  }
}

async function runAllTests() {
  for (const [puzzle, solution] of puzzlesAndSolutions) {
    console.log('\n=== Testing new puzzle ===');
    await testPuzzle(puzzle, solution);
  }
}

runAllTests();
