'use strict';

const textArea = document.getElementById("text-input");
const coordInput = document.getElementById("coord");
const valInput = document.getElementById("val");
const errorMsg = document.getElementById("error");
const cells = document.querySelectorAll(".sudoku-input");

// Automatically detect base URL
const baseURL = window.location.origin;

// Fill grid from textArea
function fillPuzzle(data) {
  for (let i = 0; i < 81; i++) {
    const value = data[i] && data[i] !== "." ? data[i] : "";
    if (cells[i]) cells[i].value = value;
  }
}

// Update textArea when grid changes (optional)
function updateTextArea() {
  let puzzle = "";
  cells.forEach(cell => {
    puzzle += cell.value || ".";
  });
  textArea.value = puzzle;
}

// Listen for changes in textArea and update grid
textArea.addEventListener("input", () => {
  const valueArray = textArea.value.split("").slice(0, 81);
  fillPuzzle(valueArray);
});

// Optionally listen to each grid cell change
cells.forEach((cell, idx) => {
  cell.addEventListener("input", () => {
    updateTextArea();
  });
});

// Solve button
async function getSolved() {
  const payload = { puzzle: textArea.value };

  try {
    const res = await fetch(`${baseURL}/api/solve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.error) {
      errorMsg.innerHTML = `<code>${data.error}</code>`;
      return;
    }

    fillPuzzle(data.solution);
    errorMsg.innerHTML = `<code>Sudoku solved!</code>`;
  } catch (err) {
    errorMsg.innerHTML = `<code>Server error: ${err.message}</code>`;
  }
}

// Check button
async function getChecked() {
  const payload = {
    puzzle: textArea.value,
    coordinate: coordInput.value,
    value: valInput.value,
  };

  try {
    const res = await fetch(`${baseURL}/api/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

// Initial grid fill
document.addEventListener("DOMContentLoaded", () => {
  fillPuzzle(textArea.value.split("").slice(0, 81));
});
