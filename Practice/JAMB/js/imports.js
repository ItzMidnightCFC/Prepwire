// calc.js
import { showCalculator } from "../../../components/calculator.js";
import { recordStreak } from "../../../dashboard/pages/streak.js";

document.getElementById("openBtn").addEventListener("click", () => {
  showCalculator();
});

const jsubject = sessionStorage.getItem("jsubject");

if (
  jsubject == "mathematics" ||
  jsubject == "accounting" ||
  jsubject == "physics" ||
  jsubject == "chemistry"
) {
  document.getElementById("openBtn").style.display = "flex";
} else {
  document.getElementById("openBtn").style.display = "none";
}
