const circle = document.getElementById("circle");

const jsubject = sessionStorage.getItem("jtsubject");
const jsnq = sessionStorage.getItem("jsnq");

nsubject.textContent = jsubject;
estsub.textContent = jsubject;
estno.textContent = `${jsnq} Questions`;
document.title = "JAMB Practice | " + jsubject;

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
