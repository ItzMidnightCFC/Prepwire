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

function setActiveLink(page) {
  document.querySelectorAll("[data-page]").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === page);
  });
}

async function loadPage(page, updateHistory = true) {
  const loader = document.getElementById("loader");
  const app = document.getElementById("app");

  if (!app) return;

  if (loader) {
    loader.style.display = "flex";
  }

  if (typeof cleanupFn === "function") {
    try {
      cleanupFn();
    } catch (error) {
      console.error("Cleanup error:", error);
    }

    cleanupFn = null;
  }

  currentPage = page;
  setActiveLink(page);

  try {
    const res = await fetch(routes[page]);

    if (!res.ok) {
      throw new Error("Page not found");
    }

    const html = await res.text();

    app.innerHTML = html;

    const content = document.querySelector(".content");

    if (content) {
      content.scrollTop = 0;
    }

    window.scrollTo(0, 0);

    try {
      const module = await import(`../pages/${page}.js?${Date.now()}`);
      cleanupFn = module.init?.() || null;
    } catch (error) {
      console.error(`Error loading ${page}.js:`, error);
      cleanupFn = null;
    }

    if (updateHistory) {
      const url =
        page === "dashboard"
          ? window.location.pathname.split("/dashboard")[0] || "/"
          : `${window.location.pathname.split("/dashboard")[0] || ""}/dashboard/${page}`;

      history.pushState({ page }, "", url);
    }

    requestAnimationFrame(() => {
      if (content) {
        content.scrollTop = 0;
      }

      window.scrollTo(0, 0);
    });
  } catch (err) {
    console.error(err);

    app.innerHTML = `
      <h2>404 Error</h2>
      <h3>Page Not Found</h3>
    `;
  } finally {
    if (loader) {
      loader.style.display = "none";
    }
  }
}

export function loadRoute(path) {
  const parts = path.split("/").filter(Boolean);

  let page = parts[parts.length - 1];

  if (!page || page === "index.html" || page === "dashboard") {
    page = "dashboard";
  }

  page = page.replace(".html", "");

  if (!routes[page]) {
    page = "dashboard";
  }

  loadPage(page, false);
}

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-page]");

  if (!link) return;

  e.preventDefault();

  const page = link.dataset.page;

  if (!routes[page]) return;

  if (page === currentPage) return;

  loadPage(page, true);
});

window.addEventListener("popstate", () => {
  loadRoute(window.location.pathname);
});

window.addEventListener("load", () => {
  loadRoute(window.location.pathname);
});
