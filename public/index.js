const textArea = document.getElementById("text-input");
const coordInput = document.getElementById("coord");
const valInput = document.getElementById("val");
const errorMsg = document.getElementById("error");

// ✅ Set backend URL: auto-switch between localhost and deployed Render URL
const BASE_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:3000"
  : "https://your-render-url.onrender.com"; // <-- replace with your Render URL

// Fill initial puzzle on page load
document.addEventListener("DOMContentLoaded", () => {
  const initialPuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
  textArea.value = initialPuzzle;
  fillPuzzle(initialPuzzle);
});

// Update puzzle display when text area changes
textArea.addEventListener("input", () => fillPuzzle(textArea.value));

// Fill puzzle grid
function fillPuzzle(puzzle) {
  for (let i = 0; i < 81; i++) {
    const rowLetter = String.fromCharCode("A".charCodeAt(0) + Math.floor(i / 9));
    const col = (i % 9) + 1;
    const cell = document.getElementsByClassName(`${rowLetter}${col}`)[0];
    if (!cell) continue;

    cell.innerText = puzzle[i] && puzzle[i] !== "." ? puzzle[i] : " ";
  }
}

// Solve puzzle
async function getSolved() {
  try {
    const res = await fetch(`${BASE_URL}/api/solve`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ puzzle: textArea.value }),
    });

    const data = await res.json();

    if (data.error) {
      errorMsg.innerHTML = `<code>${data.error}</code>`;
      return;
    }

    fillPuzzle(data.solution);
    errorMsg.innerHTML = ""; // clear any previous errors
  } catch (err) {
    errorMsg.innerHTML = `<code>Server error: ${err.message}</code>`;
  }
}

// Check a placement
async function getChecked() {
  try {
    const res = await fetch(`${BASE_URL}/api/check`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        puzzle: textArea.value,
        coordinate: coordInput.value,
        value: valInput.value,
      }),
    });

    const data = await res.json();

    errorMsg.innerHTML = `<code>${JSON.stringify(data, null, 2)}</code>`;
  } catch (err) {
    errorMsg.innerHTML = `<code>Server error: ${err.message}</code>`;
  }
}

// Event listeners
document.getElementById("solve-button").addEventListener("click", getSolved);
document.getElementById("check-button").addEventListener("click", getChecked);
