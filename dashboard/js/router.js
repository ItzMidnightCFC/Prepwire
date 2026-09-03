const routes = {
  dashboard: "./dashboard/pages/dashboard.html",
  practice: "./dashboard/pages/practice.html",
  pastquestions: "./dashboard/pages/pastquestions.html",
  subjects: "./dashboard/pages/subjects.html",
  progress: "./dashboard/pages/progress.html",
  leaderboard: "./dashboard/pages/leaderboard.html",
  overall: "./dashboard/pages/leaderboardpages/overall.html",
  leadsubjects: "./dashboard/pages/leaderboardpages/leadsubjects.html",
  weeklypoints: "./dashboard/pages/leaderboardpages/weeklypoints.html",
  history: "./dashboard/pages/history.html",
  profile: "./dashboard/pages/profile.html",
  settings: "./dashboard/pages/settings.html",
};

const pageScripts = {
  dashboard: "../pages/dashboard.js",
  practice: "../pages/practice.js",
  pastquestions: "../pages/pastquestions.js",
  subjects: "../pages/subjects.js",
  progress: "../pages/progress.js",
  leaderboard: "../pages/leaderboard.js",
  overall: "../pages/leaderboardpages/overall.js",
  leadsubjects: "../pages/leaderboardpages/leadsubjects.js",
  weeklypoints: "..pages/leaderboardpages/weeklypoints.js",
  history: "..pages/history.js",
  profile: "..pages/profile.js",
  settings: "..pages/settings.js",
};

let currentPage = "dashboard";
let cleanupFn = null;

/* ---------------- ACTIVE SIDEBAR ---------------- */

function setActiveLink(page) {
  const leaderboardPages = [
    "leaderboard",
    "overall",
    "leadsubjects",
    "weeklypoints",
  ];

  document.querySelectorAll("[data-page]").forEach((link) => {
    const linkPage = link.dataset.page;

    const isLeaderboardPage =
      leaderboardPages.includes(page) && linkPage === "leaderboard";

    link.classList.toggle("active", linkPage === page || isLeaderboardPage);
  });
}

/* ---------------- PAGE LOADER ---------------- */
async function loadPage(page) {
  const loader = document.getElementById("loader");

  if (loader) {
    loader.style.display = "flex";
  }

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

    const scriptPath = pageScripts[page];

    if (scriptPath) {
      try {
        const module = await import(scriptPath);

        cleanupFn = module.init?.() || null;
      } catch (error) {
        console.error(`Error loading ${page}.js:`, error);
        cleanupFn = null;
      }
    }
  } catch (err) {
    console.error(err);

    document.getElementById("app").innerHTML =
      "<h2>404 Error</h2><h3>Page Not Found</h3>";
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

  if (!page || page === "index.html") {
    page = "dashboard";
  }

  page = page.replace(".html", "");

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
