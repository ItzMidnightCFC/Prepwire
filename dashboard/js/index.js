import { supabase } from "./supabase.js";
import { showToast } from "../../components/toast.js";

const retrievedName = localStorage.getItem("firstName");
const words = retrievedName.split(" ");
const logoutBtn = document.querySelector(".logoutbtn");

words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

async function setDashboardTitle() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    showToast("You are not logged in.", "warning");
    return;
  }

  showToast(`Success! signed in as ${words}.`, "success");
  document.title = "Dashboard | " + user.email;
}

logoutBtn.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    console.error(error.message);
    return;
  }

  window.location.href = "../../authentication";
});

async function loadGlobalSettings() {
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

await loadGlobalSettings();

setDashboardTitle();
