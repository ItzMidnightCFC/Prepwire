import { supabase } from "./authentication/supabase.js";
import { showToast } from "./components/toast.js";

export async function signUp() {
  const fullName = document.getElementById("username").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    showToast(authError, "error");
    return;
  }

  const { data, error } = await supabase.from("users").insert([
    {
      user_id: authData.user.id,
      full_name: fullName,
      email: email,
    },
  ]);

  if (error) {
    showToast(
      "We are experiencing authentication issues, try again later.",
      "error",
    );
  } else {
    showToast(
      "Signup successful! Please check your email to confirm your account",
      "success",
    );
    saveCredentials(fullName, email);
    moveToLogin();
  }
}

export async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    switch (error.message) {
      case "Failed to fetch":
        showToast("An error occured, try again.", "error");
        break;
      case "Invalid login credentials":
        showToast("Invalid login credentials.", "error");
        break;
      default:
        showToast(`${error.message}`, "error");
        break;
    }
  } else {
    if (localStorage.getItem("rememberMe")) {
      localStorage.setItem("showemail", email);
      localStorage.setItem("showpassword", password);
    } else {
      localStorage.removeItem("showemail");
      localStorage.removeItem("showpassword");
    }
    window.location.href = "./dashboard";
  }
}

function moveToLogin() {
  indicator.style.transform = "translatex(2%)";
  loginbtn.classList.add("active");
  registerbtn.classList.remove("active");
  loginForm.classList.add("active");
  registerForm.classList.remove("active");
  document.getElementById("loginEmail").value =
    document.getElementById("signupEmail").value;
  document.getElementById("username").value = "";
  document.getElementById("signupEmail").value = "";
  document.getElementById("signupPassword").value = "";
  document.getElementById("confirmPassword").value = "";
  document.getElementById("loginPassword").value = "";
  localStorage.removeItem("rememberMe");
  localStorage.removeItem("showemail");
  localStorage.removeItem("showpassword");
  checkbox.checked = false;
}

function saveCredentials(name, email) {
  const names = name.trim().split(/\s+/);

  const firstName = names[0];
  const lastName = names[names.length - 1];

  localStorage.setItem("firstName", firstName);
  localStorage.setItem("lastName", lastName);
  localStorage.setItem("email", email);
}
