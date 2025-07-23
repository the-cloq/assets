const canvas = document.getElementById("curveCanvas");
const ctx = canvas.getContext("2d");
const ldrInput = document.getElementById("ldrInput");

const NUM_POINTS = 10;
let brightnessCurve = Array(NUM_POINTS).fill(0);
let originalCurve = JSON.stringify(brightnessCurve);

// Load initial values from ESP
fetch("/config.json")
  .then(res => res.json())
  .then(data => {
    if (Array.isArray(data.brightnessCurve)) {
      brightnessCurve = data.brightnessCurve.slice(0, NUM_POINTS); // Trim/extend as needed
      originalCurve = JSON.stringify(brightnessCurve);
    }
    if (typeof data.ldrValue === "number") {
      ldrInput.value = data.ldrValue;
    }
    drawCurve();
  });

function getCurrentLDRIndex() {
  const ldrValue = parseFloat(ldrInput.value);
  return Math.min(NUM_POINTS - 1, Math.floor(ldrValue * (NUM_POINTS - 1) / 1023)); // Normalize if LDR is 0–1023
}

function drawCurve() {
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  const step = w / (NUM_POINTS - 1);

  ctx.beginPath();
  ctx.moveTo(0, h - (brightnessCurve[0] / 255) * h);
  for (let i = 1; i < NUM_POINTS; i++) {
    const x = i * step;
    const y = h - (brightnessCurve[i] / 255) * h;
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Red dot
  const index = getCurrentLDRIndex();
  const x = index * step;
  const y = h - (brightnessCurve[index] / 255) * h;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, 2 * Math.PI);
  ctx.fillStyle = "red";
  ctx.fill();

  document.getElementById("currentIndexDisplay").textContent = `Index ${index}`;
}

function adjustCurrentPoint(delta) {
  const index = getCurrentLDRIndex();
  brightnessCurve[index] = Math.max(0, Math.min(255, brightnessCurve[index] + delta));
  drawCurve();
  updateSaveButtonVisibility();
}

function updateSaveButtonVisibility() {
  const current = JSON.stringify(brightnessCurve);
  const saveBtn = document.getElementById("saveCurveButton");
  saveBtn.style.display = (current !== originalCurve) ? "block" : "none";
}

function saveCurve() {
  const formData = new FormData();
  formData.append("ok", "ok"); // Needed for ESP to recognize it
  formData.append("brightnessCurve", JSON.stringify(brightnessCurve));

  fetch("/", {
    method: "POST",
    body: formData
  })
  .then(res => res.text())
  .then(response => {
    console.log("Saved:", response);
    originalCurve = JSON.stringify(brightnessCurve);
    updateSaveButtonVisibility();
  });
}

ldrInput.addEventListener("input", drawCurve);

document.getElementById("submitBtn").addEventListener("click", function(event) {
  event.preventDefault(); // Prevent form submission
  saveCurve();
});
