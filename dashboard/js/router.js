const routes = {
  dashboard: "./dashboard/pages/dashboard.html",

  practice: "./dashboard/pages/practice.html",

  pastquestions: "./dashboard/pages/pastquestions.html",

  subjects: "./dashboard/pages/subjects.html",

  progress: "./dashboard/pages/progress.html",

  history: "./dashboard/pages/history.html",

  profile: "./dashboard/pages/profile.html",

  settings: "./dashboard/pages/settings.html",
};

let currentPage = "dashboard";

let cleanupFn = null;

/* ---------------- ACTIVE SIDEBAR ---------------- */

function setActiveLink(page) {
  document.querySelectorAll("[data-page]").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === page);
  });
}

/* ---------------- PAGE LOADER ---------------- */

async function loadPage(page) {
  const loader = document.getElementById("loader");

  if (loader) {
    loader.style.display = "flex";
  }

  // cleanup previous page JS

  if (typeof cleanupFn === "function") {
    cleanupFn();

    cleanupFn = null;
  }

  currentPage = page;

  setActiveLink(page);

  try {
    const res = await fetch(routes[page]);

    if (!res.ok) {
      throw new Error("Page not found");
    }

    document.getElementById("app").innerHTML = await res.text();

    // Load page JS

    try {
      const module = await import(`../pages/${page}.js`);

      cleanupFn = module.init?.() || null;
    } catch (error) {
      console.error(`Error loading ${page}.js:`, error);

      cleanupFn = null;
    }
  } catch (err) {
    console.error(err);

    document.getElementById("app").innerHTML =
      "<h2>404 Error</h2><h3>Page Not Found<h3>";
  } finally {
    if (loader) {
      loader.style.display = "none";
    }
  }
}

/* ---------------- ROUTE LOADER ---------------- */

export function loadRoute(path) {
  const parts = path.split("/").filter(Boolean);

  let page = parts[parts.length - 1];

  // If we're on the dashboard/root route

  if (!page || page === "index.html") {
    page = "dashboard";
  }

  // Remove .html if present

  page = page.replace(".html", "");

  // Make sure the route exists

  if (!routes[page]) {
    page = "dashboard";
  }

  loadPage(page);
}

/* ---------------- NAVIGATION ---------------- */

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-page]");

  if (!link) return;

  e.preventDefault();

  loadPage(link.dataset.page);
});

/* ---------------- INITIAL LOAD ---------------- */

window.addEventListener("load", () => {
  loadRoute(window.location.pathname);
});
