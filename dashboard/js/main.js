let sidebar = document.querySelector(".sidebar");
let links = document.querySelectorAll("nav a");

menuBtn.addEventListener("click", () => {
  sidebar.style.display = "grid";
  wholecov.style.display = "block";
  setTimeout(() => {
    sidebar.classList.add("show");
    cancelBar();
  }, 20);
});

function cancelBar() {
  wholecov.addEventListener("click", () => {
    sidebar.classList.remove("show");
    setTimeout(() => {
      sidebar.style.display = "none";
      wholecov.style.display = "none";
    }, 260);
  });

  links.forEach((n, b) => {
    n.addEventListener("click", () => {
      sidebar.classList.remove("show");
      setTimeout(() => {
        sidebar.style.display = "none";
        wholecov.style.display = "none";
      }, 260);
    });
  });
}
