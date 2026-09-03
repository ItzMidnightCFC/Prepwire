const circle = document.getElementById("circle");

const wtsubject = sessionStorage.getItem("wtsubject");
const wsnq = sessionStorage.getItem("wsnq");

nsubject.textContent = wtsubject;
estsub.textContent = wtsubject;
estno.textContent = `${wsnq} Questions`;
document.title = "WASSCE Practice | " + wtsubject;

reload.onclick = () => {
  location.reload();
};

function loadGlobalSettings() {
  const SETTINGS_KEY = "acecbt_settings";

  const saved = localStorage.getItem(SETTINGS_KEY);

  if (!saved) {
    document.body.classList.remove("dark");
    document.documentElement.classList.remove("dark");
    return;
  }

  try {
    const settings = JSON.parse(saved);

    const isDark = settings.theme === "dark";

    document.body.classList.toggle("dark", isDark);
    document.documentElement.classList.toggle("dark", isDark);

    document.documentElement.dataset.theme = settings.theme;
  } catch (error) {
    console.error("Could not load global settings:", error);
  }
}

loadGlobalSettings();

document.addEventListener("selectstart", (e) => {
  e.preventDefault();
});

