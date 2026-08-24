let passwordBox = document.querySelectorAll(".passbox");

function showLogin() {
  indicator.style.transform = "translatex(2%)";
  loginbtn.classList.add("active");
  registerbtn.classList.remove("active");
  loginForm.classList.add("active");
  registerForm.classList.remove("active");
}

function showRegister() {
  indicator.style.transform = "translatex(98%)";
  loginbtn.classList.remove("active");
  registerbtn.classList.add("active");
  loginForm.classList.remove("active");
  registerForm.classList.add("active");
}

function Focus() {
  passwordBox.forEach((n) => {
    n.classList.add("focus");
  });
}

function Blur() {
  passwordBox.forEach((n) => {
    n.classList.remove("focus");
  });
}

function showPassword(e) {
  eyecolor.classList.toggle("active");
  signupPassword.type = signupPassword.type == "password" ? "text" : "password";
}

function showPasswordLog(e) {
  eyecolorlog.classList.toggle("active");
  loginPassword.type = loginPassword.type == "password" ? "text" : "password";
}

if (sessionStorage.getItem("registerpage")) {
  showRegister();
} else {
  showLogin();
}

document.addEventListener("keydown", function (e) {
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && ["I", "C", "J"].includes(e.key)) ||
    (e.ctrlKey && e.key === "U")
  ) {
    e.preventDefault();
  }
});

if (localStorage.getItem("showemail") && localStorage.getItem("showpassword")) {
  sessionStorage.removeItem("registerpage");
  loginEmail.value = localStorage.getItem("showemail");
  loginPassword.value = localStorage.getItem("showpassword");
  checkbox.checked = true;
} else {
  loginEmail.value = "";
  loginPassword.value = "";
  checkbox.checked = false;
}

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
