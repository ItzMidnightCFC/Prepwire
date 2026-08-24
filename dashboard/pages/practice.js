import { wasscebody } from "./components/wassceSetup.js";
import { jambbody } from "./components/jambSetup.js";

export function init() {
  const wasscebutton = document.getElementById("wasscebutton");
  const practicebody = document.getElementById("practicebody");
  const questbody = document.getElementById("questbody");
  function showWContent() {
    practicebody.classList.add("opacity");

    setTimeout(() => {
      wasscebody(practicebody);
      practicebody.classList.add("remove");
    }, 400);
    setTimeout(() => {
      practicebody.classList.remove("opacity");
    }, 2000);
  }

  function showJContent() {
    practicebody.classList.add("opacity");

    setTimeout(() => {
      jambbody(practicebody);
      practicebody.classList.add("remove");
    }, 400);
    setTimeout(() => {
      practicebody.classList.remove("opacity");
    }, 2000);
  }

  wasscebutton.addEventListener("click", showWContent);
  jambbutton.addEventListener("click", showJContent);
}
