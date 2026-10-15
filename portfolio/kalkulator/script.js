let current = "0";
let formula = "";
let lastResult = false;

const display = document.getElementById("display");

/* 🔊 SOUND TANPA MP3 */
let audioCtx;

function playSound(freq = 600, duration = 0.03) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.type = "square";
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

/* AUTO SOUND SEMUA TOMBOL */
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.id === "equals") {
      playSound(900, 0.05); // suara beda untuk =
    } else {
      playSound();
    }
  });
});

/* DISPLAY */
function updateDisplay(val) {
  display.innerText = val;
}

/* NUMBER */
function handleNumber(num) {
  if (lastResult) {
    formula = "";
    current = num;
    lastResult = false;
  } else {
    if (current === "0") {
      current = num;
    } else {
      current += num;
    }
  }

  formula += num;
  updateDisplay(current);
}

/* OPERATOR */
function handleOperator(op) {
  lastResult = false;

  formula = formula.trim();
  const match = formula.match(/[+\-*/]+$/);

  if (match) {
    const lastOps = match[0];

    if (op === "-") {
      if (lastOps.length === 1 && lastOps !== "-") {
        formula += "-";
      } else {
        formula = formula.replace(/[+\-*/]+$/, "-");
      }
    } else {
      formula = formula.replace(/[+\-*/]+$/, op);
    }
  } else {
    formula += op;
  }

  current = op;
  updateDisplay(op);
}

/* DECIMAL */
function handleDecimal() {
  if (lastResult) {
    current = "0.";
    formula = "0.";
    lastResult = false;
    updateDisplay(current);
    return;
  }

  const parts = formula.split(/[+\-*/]/);
  const lastNumber = parts[parts.length - 1];

  if (!lastNumber.includes(".")) {
    current += ".";
    formula += ".";
    updateDisplay(current);
  }
}

/* CLEAR */
function clearAll() {
  current = "0";
  formula = "";
  lastResult = false;
  updateDisplay("0");
}

/* CALCULATE */
function calculate() {
  try {
    let result = eval(formula);
    result = parseFloat(result.toFixed(10));

    updateDisplay(result);
    current = result.toString();
    formula = result.toString();
    lastResult = true;

  } catch {
    updateDisplay("Error");
  }
}

/* EVENTS */
document.getElementById("zero").onclick = () => handleNumber("0");
document.getElementById("one").onclick = () => handleNumber("1");
document.getElementById("two").onclick = () => handleNumber("2");
document.getElementById("three").onclick = () => handleNumber("3");
document.getElementById("four").onclick = () => handleNumber("4");
document.getElementById("five").onclick = () => handleNumber("5");
document.getElementById("six").onclick = () => handleNumber("6");
document.getElementById("seven").onclick = () => handleNumber("7");
document.getElementById("eight").onclick = () => handleNumber("8");
document.getElementById("nine").onclick = () => handleNumber("9");

document.getElementById("add").onclick = () => handleOperator("+");
document.getElementById("subtract").onclick = () => handleOperator("-");
document.getElementById("multiply").onclick = () => handleOperator("*");
document.getElementById("divide").onclick = () => handleOperator("/");

document.getElementById("decimal").onclick = handleDecimal;
document.getElementById("clear").onclick = clearAll;
document.getElementById("equals").onclick = calculate;