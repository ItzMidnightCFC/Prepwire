// calculator.js

export function showCalculator() {
  let existing = document.getElementById("calculator");

  if (existing) {
    existing.style.display = "block";
    return;
  }

  const calc = document.createElement("div");
  calc.id = "calculator";
  calc.className = "calculator";

  calc.innerHTML = `
    <div class="calc-header">
    <img src='../../assets/prepIcon.png' width='20px'/>
      <span>Calculator</span>
      <button class="minimize-btn" onclick="closeCalc()">-</button>
    </div>

    <input id="display" class="display" type="text" readonly />

    <!-- NORMAL -->
    <div class="buttons" id="normalBtns">
      <button class="clear" onclick="clearDisplay()">C</button>
      <button onclick="press('%')">%</button>
      <button onclick="press('/')">÷</button>
      <button onclick="press('*')">×</button>

      <button onclick="press('7')">7</button>
      <button onclick="press('8')">8</button>
      <button onclick="press('9')">9</button>
      <button class="operator" onclick="press('-')">−</button>

      <button onclick="press('4')">4</button>
      <button onclick="press('5')">5</button>
      <button onclick="press('6')">6</button>
      <button class="operator" onclick="press('+')">+</button>

      <button onclick="press('1')">1</button>
      <button onclick="press('2')">2</button>
      <button onclick="press('3')">3</button>
      <button onclick="toggleSci()">SCI</button>

      <button onclick="press('0')">0</button>
      <button onclick="press('.')">.</button>
      <button class="equal" onclick="calculate()">=</button>
    </div>

    <!-- SCIENTIFIC -->
    <div class="buttons" id="sciBtns" style="display:none;">
      <button class="clear" onclick="clearDisplay()">C</button>
      <button onclick="applyFunc('sin')">sin</button>
      <button onclick="applyFunc('cos')">cos</button>
      <button onclick="applyFunc('tan')">tan</button>

      <button onclick="applyFunc('sqrt')">√</button>
      <button onclick="power()">^</button>
      <button onclick="applyFunc('log')">log</button>
      <button onclick="press('/')">÷</button>

      <button onclick="press('7')">7</button>
      <button onclick="press('8')">8</button>
      <button onclick="press('9')">9</button>
      <button onclick="press('*')">×</button>

      <button onclick="press('4')">4</button>
      <button onclick="press('5')">5</button>
      <button onclick="press('6')">6</button>
      <button onclick="press('-')">−</button>

      <button onclick="press('1')">1</button>
      <button onclick="press('2')">2</button>
      <button onclick="press('3')">3</button>
      <button onclick="press('+')">+</button>

      <button onclick="press('0')">0</button>
      <button onclick="press('.')">.</button>
      <button onclick="calculate()">=</button>
      <button onclick="toggleSci()">←</button>
    </div>
  `;

  document.body.appendChild(calc);

  // ================= DRAG =================
  const handle = calc.querySelector(".calc-header");

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  handle.addEventListener("mousedown", (e) => {
    if (window.innerWidth <= 768) return;

    isDragging = true;
    offsetX = e.clientX - calc.offsetLeft;
    offsetY = e.clientY - calc.offsetTop;

    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    calc.style.left = e.clientX - offsetX + "px";
    calc.style.top = e.clientY - offsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  });
}

// ================= BASIC FUNCTIONS =================

window.press = function (value) {
  document.getElementById("display").value += value;
};

window.calculate = function () {
  let display = document.getElementById("display");

  try {
    display.value = eval(display.value);
  } catch {
    display.value = "Error";
  }
};

window.clearDisplay = function () {
  document.getElementById("display").value = "";
};

window.closeCalc = function () {
  document.getElementById("calculator").style.display = "none";
};

// ================= SCI FUNCTIONS =================

// 🔁 Toggle
window.toggleSci = function () {
  const normal = document.getElementById("normalBtns");
  const sci = document.getElementById("sciBtns");

  if (normal.style.display === "none") {
    normal.style.display = "grid";
    sci.style.display = "none";
  } else {
    normal.style.display = "none";
    sci.style.display = "grid";
  }
};

// 🔥 Smart math functions (NO brackets needed)
window.applyFunc = function (type) {
  let display = document.getElementById("display");
  let value = parseFloat(display.value);

  if (isNaN(value)) return;

  let result;

  switch (type) {
    case "sin":
      result = Math.sin((value * Math.PI) / 180);
      break;
    case "cos":
      result = Math.cos((value * Math.PI) / 180);
      break;
    case "tan":
      result = Math.tan((value * Math.PI) / 180);
      break;
    case "sqrt":
      result = Math.sqrt(value);
      break;
    case "log":
      result = Math.log10(value);
      break;
  }

  display.value = result;
};

// 🔥 Power (^)
window.power = function () {
  let display = document.getElementById("display");
  let base = parseFloat(display.value);

  let exp = prompt("Enter power:");

  if (exp !== null && !isNaN(exp)) {
    display.value = Math.pow(base, exp);
  }
};
