import { supabase } from "./supabase.js";
import { showToast } from "../components/toast.js";

const RESEND_COOLDOWN = 2 * 60 * 60 * 1000;
const RESEND_COOLDOWN_KEY = "prepwire_resend_cooldown";

export async function signUp() {
  const fullName = document.getElementById("username").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  const { data: authData, error: authError } =
    await supabase.auth.signUp({
      email,
      password,
    });

  if (authError) {
    const message = authError.message.toLowerCase();

    if (
      message.includes("already registered") ||
      message.includes("already exists") ||
      message.includes("user already registered") ||
      authError.code === "user_already_exists"
    ) {
      showToast(
        "An account with this email already exists. Please log in.",
        "error",
      );
    } else {
      showToast(authError.message, "error");
    }

    return;
  }

  if (!authData || !authData.user) {
    showToast(
      "Unable to create your account. Please try again.",
      "error",
    );
    return;
  }

  /*
   * Supabase can hide whether an email already exists.
   * If a user is returned without an identity, the email already exists.
   */
  if (
    authData.user.identities &&
    authData.user.identities.length === 0
  ) {
    showToast(
      "An account with this email already exists. Please log in.",
      "error",
    );
    return;
  }

  const { error } = await supabase.from("users").insert([
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
    return;
  }

  showToast(
    "Signup successful! Please check your email to confirm your account",
    "success",
  );

  saveCredentials(fullName, email);
  moveToLogin();
}

export async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const resendBtn = document.getElementById("resendConfirmation");

  if (resendBtn) {
    resendBtn.style.display = "none";
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (
      error.code === "email_not_confirmed" ||
      error.message === "Email not confirmed"
    ) {
      showToast(
        "Please confirm your email before logging in.",
        "error",
      );

      if (resendBtn) {
        resendBtn.style.display = "block";
        updateResendButton();
      }

      return;
    }

    switch (error.message) {
      case "Failed to fetch":
        showToast("An error occured, try again.", "error");
        break;

      case "Invalid login credentials":
        showToast("Invalid login credentials.", "error");
        break;

      default:
        showToast(error.message, "error");
        break;
    }

    return;
  }

  if (localStorage.getItem("rememberMe")) {
    localStorage.setItem("showemail", email);
    localStorage.setItem("showpassword", password);
  } else {
    localStorage.removeItem("showemail");
    localStorage.removeItem("showpassword");
  }

  window.location.href = "../dashboard";
}

export async function resendConfirmationEmail() {
  const emailInput = document.getElementById("loginEmail");
  const resendBtn = document.getElementById("resendConfirmation");

  if (!emailInput) {
    return;
  }

  const email = emailInput.value.trim();

  if (!email) {
    showToast(
      "Please enter your email address first.",
      "error",
    );
    return;
  }

  const cooldownUntil = Number(
    localStorage.getItem(RESEND_COOLDOWN_KEY),
  );

  if (cooldownUntil && Date.now() < cooldownUntil) {
    showToast(
      `Please wait ${formatRemainingTime(
        cooldownUntil - Date.now(),
      )} before requesting another email.`,
      "error",
    );

    updateResendButton();
    return;
  }

  if (resendBtn) {
    resendBtn.style.pointerEvents = "none";
    resendBtn.textContent = "Sending...";
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email,
  });

  if (error) {
    if (resendBtn) {
      resendBtn.style.pointerEvents = "auto";
      resendBtn.textContent = "Resend confirmation email";
    }

    const message = error.message.toLowerCase();

    if (
      message.includes("rate limit") ||
      error.code === "over_email_send_rate_limit"
    ) {
      showToast(
        "Too many confirmation emails have been requested. Please try again later.",
        "error",
      );
    } else {
      showToast(
        "Unable to resend confirmation email. Please try again.",
        "error",
      );
    }

    return;
  }

  const newCooldownUntil =
    Date.now() + RESEND_COOLDOWN;

  localStorage.setItem(
    RESEND_COOLDOWN_KEY,
    newCooldownUntil.toString(),
  );

  showToast(
    "Confirmation email sent! Please check your Gmail inbox.",
    "success",
  );

  updateResendButton();
}

function updateResendButton() {
  const resendBtn = document.getElementById(
    "resendConfirmation",
  );

  if (!resendBtn) {
    return;
  }

  const cooldownUntil = Number(
    localStorage.getItem(RESEND_COOLDOWN_KEY),
  );

  if (!cooldownUntil) {
    resendBtn.style.pointerEvents = "auto";
    resendBtn.textContent = "Resend confirmation email";
    return;
  }

  const remaining = cooldownUntil - Date.now();

  if (remaining <= 0) {
    localStorage.removeItem(RESEND_COOLDOWN_KEY);

    resendBtn.style.pointerEvents = "auto";
    resendBtn.textContent = "Resend confirmation email";

    return;
  }

  resendBtn.style.pointerEvents = "none";
  resendBtn.textContent =
    `Resend in ${formatRemainingTime(remaining)}`;

  setTimeout(updateResendButton, 1000);
}

function formatRemainingTime(milliseconds) {
  const totalSeconds = Math.ceil(
    milliseconds / 1000,
  );

  const hours = Math.floor(
    totalSeconds / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
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
  const lastName =
    names.length > 1
      ? names[names.length - 1]
      : "";

  localStorage.setItem(
    "firstName",
    firstName,
  );

  localStorage.setItem(
    "lastName",
    lastName,
  );

  localStorage.setItem(
    "email",
    email,
  );
}

export function setupResendConfirmation() {
  const resendBtn = document.getElementById(
    "resendConfirmation",
  );

  if (!resendBtn) {
    return;
  }

  resendBtn.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      resendConfirmationEmail();
    },
  );

  updateResendButton();
        }
