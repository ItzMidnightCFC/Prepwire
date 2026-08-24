import { supabase } from "../js/supabase.js";
import { showToast } from "../../components/toast.js";

const SETTINGS_KEY = "acecbt_settings";

const defaults = {
  theme: "light",
  autoSave: true,
  questionCount: "20",
  examTime: "20",
};

let cleanupFunctions = [];

export async function init() {
  cleanup();

  const elements = getElements();

  if (!elements) {
    return;
  }

  const settings = loadSettings();

  applySettings(settings, elements);

  await loadEmail(elements);

  setupEvents(elements);

  return cleanup;
}

function cleanup() {
  cleanupFunctions.forEach((fn) => fn());

  cleanupFunctions = [];
}

function getElements() {
  const elements = {
    theme: document.getElementById("theme"),
    autoSave: document.getElementById("autoSave"),
    questionCount: document.getElementById("questionCount"),
    examTime: document.getElementById("examTime"),

    resetButton: document.getElementById("resetButton"),
    profileButton: document.getElementById("profileButton"),

    userEmail: document.getElementById("userEmail"),
  };

  const required = ["theme", "autoSave", "questionCount", "examTime"];

  for (const name of required) {
    if (!elements[name]) {
      console.error(`ACE CBT Settings: missing #${name}`);
      return null;
    }
  }

  return elements;
}

function loadSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY);

  if (!saved) {
    return { ...defaults };
  }

  try {
    const parsed = JSON.parse(saved);

    return {
      ...defaults,
      ...parsed,
    };
  } catch (error) {
    console.error("Invalid ACE CBT settings:", error);

    localStorage.removeItem(SETTINGS_KEY);

    return { ...defaults };
  }
}

function applySettings(settings, elements) {
  elements.theme.value = settings.theme;
  elements.autoSave.checked = settings.autoSave;
  elements.questionCount.value = settings.questionCount;
  elements.examTime.value = settings.examTime;

  applyTheme(settings.theme);
}

function getCurrentSettings(elements) {
  return {
    theme: elements.theme.value,
    autoSave: elements.autoSave.checked,
    questionCount: elements.questionCount.value,
    examTime: elements.examTime.value,
  };
}

function saveSettings(elements) {
  const settings = getCurrentSettings(elements);

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    applyTheme(settings.theme);

    showToast("Settings saved", "info");
  } catch (error) {
    console.error("Could not save ACE CBT settings:", error);

    showToast("Could not save settings", "error");
  }
}

function setupEvents(elements) {
  const inputs = [
    elements.theme,
    elements.autoSave,
    elements.questionCount,
    elements.examTime,
  ];

  inputs.forEach((input) => {
    const handler = () => {
      if (input === elements.theme) {
        applyTheme(elements.theme.value);
      }

      saveSettings(elements);
    };

    input.addEventListener("change", handler);

    cleanupFunctions.push(() => {
      input.removeEventListener("change", handler);
    });
  });

  if (elements.resetButton) {
    const resetHandler = () => {
      resetSettings(elements);
    };

    elements.resetButton.addEventListener("click", resetHandler);

    cleanupFunctions.push(() => {
      elements.resetButton.removeEventListener("click", resetHandler);
    });
  }

  if (elements.profileButton) {
    const profileHandler = () => {
      const profileLink = document.querySelector(
        '.sidebar nav a[data-page="profile"],' +
          '.sidebar nav a[href*="profile"]',
      );

      if (profileLink) {
        profileLink.click();
      }
    };

    elements.profileButton.addEventListener("click", profileHandler);

    cleanupFunctions.push(() => {
      elements.profileButton.removeEventListener("click", profileHandler);
    });
  }
}

function resetSettings(elements) {
  const confirmed = confirm("Are you sure you want to reset all settings?");

  if (!confirmed) {
    return;
  }

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaults));

  applySettings(defaults, elements);

  showToast("Settings reset ✓", "success");
}

function applyTheme(theme) {
  const isDark = theme === "dark";

  document.body.classList.toggle("dark", isDark);

  document.documentElement.classList.toggle("dark", isDark);

  document.documentElement.dataset.theme = theme;
}

async function loadEmail(elements) {
  if (!elements.userEmail) {
    return;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Could not get user:", error.message);
    elements.userEmail.textContent = "Not available";
    return;
  }

  if (!user) {
    elements.userEmail.textContent = "Not available";
    return;
  }

  elements.userEmail.textContent = user.email || "Not available";
}
