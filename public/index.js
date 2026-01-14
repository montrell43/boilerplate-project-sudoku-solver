const textArea = document.getElementById("text-input");
const coordInput = document.getElementById("coord");
const valInput = document.getElementById("val");
const errorMsg = document.getElementById("error");

// ✅ Set backend URL: auto-switch between localhost and deployed Render URL
const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000" // local backend
    : "https://your-render-url.onrender.com"; // production backend


async function getSolved() {
  const stuff = { puzzle: textArea.value };

  const data = await fetch(`${API_BASE}/api/solve`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(stuff)
  });

  const parsed = await data.json();

  if (parsed.error) {
    errorMsg.innerHTML = `<code>${JSON.stringify(parsed, null, 2)}</code>`;
    return;
  }

  fillpuzzle(parsed.solution);
}


async function getChecked() {
  const stuff = {
    puzzle: textArea.value,
    coordinate: coordInput.value,
    value: valInput.value
  };

  const data = await fetch(`${API_BASE}/api/check`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(stuff)
  });

  const parsed = await data.json();
  errorMsg.innerHTML = `<code>${JSON.stringify(parsed, null, 2)}</code>`;
}



// Event listeners
document.getElementById("solve-button").addEventListener("click", getSolved);
document.getElementById("check-button").addEventListener("click", getChecked);
