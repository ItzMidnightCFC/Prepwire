// calc.js
import { showCalculator } from "../../../components/calculator.js";
import { recordStreak } from "../../../dashboard/pages/streak.js";

document.getElementById("openBtn").addEventListener("click", () => {
  showCalculator();
});

const wsubject = sessionStorage.getItem("wsubject");

if (
  wsubject == "mathematics" ||
  wsubject == "accounting" ||
  wsubject == "physics" ||
  wsubject == "chemistry"
) {
  document.getElementById("openBtn").style.display = "flex";
} else {
  document.getElementById("openBtn").style.display = "none";
}
