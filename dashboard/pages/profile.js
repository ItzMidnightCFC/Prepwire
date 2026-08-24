import { supabase } from "../js/supabase.js";
import { showToast } from "../../components/toast.js";

export function init() {
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const phoneNumber = document.getElementById("phoneNumber");
  const userEmail = document.getElementById("userEmail");

  const applybtn = document.getElementById("applbtn");

  const profileImageInput = document.getElementById("profileImageInput");

  const profilePreview = document.getElementById("profilePreview");

  // ==================================================
  // ORIGINAL VALUES
  // ==================================================

  let originalFullName = "";
  let originalPhoneNumber = "";

  // Prevent repeated identical error toasts
  let currentError = null;

  // ==================================================
  // INITIAL BUTTON STATE
  // ==================================================

  applybtn.disabled = true;
  applybtn.classList.remove("enabled");

  // ==================================================
  // LOAD LOCAL STORAGE
  // ==================================================

  const retrievedFName = localStorage.getItem("firstName") || "";

  const retrievedLName = localStorage.getItem("lastName") || "";

  const retrievedEmail = localStorage.getItem("email") || "";

  firstName.value = retrievedFName;
  lastName.value = retrievedLName;
  userEmail.value = retrievedEmail;

  if (retrievedFName) {
    mainProfileText.textContent = retrievedFName.trim().charAt(0).toUpperCase();
  }

  // ==================================================
  // LIVE VALIDATION
  // ==================================================

  function validateProfile() {
    const first = firstName.value.trim();
    const last = lastName.value.trim();
    const phone = phoneNumber.value.trim();

    let error = null;

    // -----------------------------------------------
    // FIRST NAME
    // -----------------------------------------------

    if (!first) {
      error = "First name is required.";
    } else if (first.length < 2) {
      error = "First name must be at least 2 characters.";
    } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'-]+$/.test(first)) {
      error = "Enter a valid first name.";
    }

    // -----------------------------------------------
    // LAST NAME
    // -----------------------------------------------
    else if (!last) {
      error = "Last name is required.";
    } else if (last.length < 2) {
      error = "Last name must be at least 2 characters.";
    } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'-]+$/.test(last)) {
      error = "Enter a valid last name.";
    }

    // -----------------------------------------------
    // PHONE NUMBER
    // OPTIONAL
    // -----------------------------------------------
    else if (
      phone &&
      !/^(?:\+234|234|0)(?:70|71|80|81|90|91)\d{8}$/.test(phone)
    ) {
      error = "Enter a valid Nigerian phone number.";
    }

    // -----------------------------------------------
    // SHOW ERROR TOAST
    // -----------------------------------------------

    if (error !== currentError) {
      if (error) {
        showToast(error, "error");
      }

      currentError = error;
    }

    // -----------------------------------------------
    // CHECK CHANGES
    // -----------------------------------------------

    const currentFullName = `${first} ${last}`;

    const nameChanged =
      currentFullName.trim().toLowerCase() !==
      originalFullName.trim().toLowerCase();

    const phoneChanged = phone !== originalPhoneNumber;

    const hasChanges = nameChanged || phoneChanged;

    // -----------------------------------------------
    // BUTTON
    // -----------------------------------------------

    const valid = !error;

    if (valid && hasChanges) {
      applybtn.disabled = false;
      applybtn.classList.add("enabled");
    } else {
      applybtn.disabled = true;
      applybtn.classList.remove("enabled");
    }

    return valid;
  }

  // ==================================================
  // LIVE INPUT LISTENERS
  // ==================================================

  [firstName, lastName, phoneNumber].forEach((input) => {
    input.addEventListener("input", validateProfile);
  });

  // ==================================================
  // APPLY BUTTON
  // ==================================================

  applybtn.addEventListener("click", async () => {
    if (!validateProfile()) {
      return;
    }

    await saveName();
  });

  // ==================================================
  // PROFILE IMAGE INPUT
  // ==================================================

  profileImageInput.addEventListener("change", async () => {
    const file = profileImageInput.files[0];

    if (!file) return;

    const imageURL = URL.createObjectURL(file);

    profilePreview.src = imageURL;

    profilePreview.style.display = "block";

    mainProfileText.style.display = "none";

    previewcov.style.display = "flex";

    await uploadProfileImage(file);
  });

  // ==================================================
  // LOAD USERNAME / PROFILE
  // ==================================================

  async function loadUsername() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(userError.message);

      return;
    }

    if (!user) {
      window.location.href = "";
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("full_name, phone_number, avatar_url")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error(error.message);

      return;
    }

    // -----------------------------------------------
    // ORIGINAL VALUES
    // -----------------------------------------------

    const name = (data.full_name || "").trim();

    originalFullName = name;

    originalPhoneNumber = data.phone_number || "";

    // -----------------------------------------------
    // SPLIT NAME
    // -----------------------------------------------

    const names = name.split(/\s+/);

    const retrievedFirstName = names[0] || "";

    const retrievedLastName = names.length > 1 ? names[names.length - 1] : "";

    firstName.value = retrievedFirstName;

    lastName.value = retrievedLastName;

    phoneNumber.value = data.phone_number || "";

    // -----------------------------------------------
    // SAVE NAME TO LOCAL STORAGE
    // -----------------------------------------------

    localStorage.setItem("firstName", retrievedFirstName);

    localStorage.setItem("lastName", retrievedLastName);

    // -----------------------------------------------
    // PROFILE INITIAL
    // -----------------------------------------------

    if (name) {
      const firstLetter = name.charAt(0).toUpperCase();

      profiletext.textContent = firstLetter;

      mainProfileText.textContent = firstLetter;
    }

    // -----------------------------------------------
    // PROFILE IMAGE
    // -----------------------------------------------

    if (data.avatar_url) {
      profilePreview.src = data.avatar_url;

      profileImage.src = data.avatar_url;

      profilePreview.style.display = "block";

      mainProfileText.style.display = "none";

      previewcov.style.display = "flex";

      profiletext.style.display = "none";

      profileImage.style.display = "block";
    }

    validateProfile();
  }

  // ==================================================
  // UPLOAD PROFILE IMAGE
  // ==================================================

  async function uploadProfileImage(file) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      showToast("You are not logged in.", "warning");

      return;
    }

    // -----------------------------------------------
    // IMAGE TYPE
    // -----------------------------------------------

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image.", "warning");

      return;
    }

    // -----------------------------------------------
    // IMAGE SIZE
    // -----------------------------------------------

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be less than 5MB.", "warning");

      return;
    }

    // -----------------------------------------------
    // FILE PATH
    // -----------------------------------------------

    const filePath = `${user.id}/avatar`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);

      showToast("Failed to upload image.", "error");

      return;
    }

    // -----------------------------------------------
    // PUBLIC URL
    // -----------------------------------------------

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // -----------------------------------------------
    // SAVE URL TO DATABASE
    // -----------------------------------------------

    const { error: updateError } = await supabase
      .from("users")
      .update({
        avatar_url: avatarUrl,
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Database error:", updateError);

      showToast("Image uploaded but profile wasn't updated.", "error");

      return;
    }

    // -----------------------------------------------
    // DISPLAY IMAGE
    // -----------------------------------------------

    profilePreview.src = avatarUrl;

    profileImage.src = avatarUrl;

    profiletext.style.display = "none";

    profileImage.style.display = "block";

    showToast("Profile picture updated!", "success");
  }

  // ==================================================
  // SAVE PROFILE
  // ==================================================

  async function saveName() {
    const newFirstName = firstName.value.trim();

    const newLastName = lastName.value.trim();

    const newPhoneNumber = phoneNumber.value.trim();

    // -----------------------------------------------
    // FINAL VALIDATION
    // -----------------------------------------------

    if (!validateProfile()) {
      return;
    }

    // -----------------------------------------------
    // FORMAT NAME
    // -----------------------------------------------

    const formattedFirstName =
      newFirstName.charAt(0).toUpperCase() + newFirstName.slice(1);

    const formattedLastName =
      newLastName.charAt(0).toUpperCase() + newLastName.slice(1);

    const newFullName = `${formattedFirstName} ${formattedLastName}`;

    // -----------------------------------------------
    // NOTHING CHANGED
    // -----------------------------------------------

    if (
      newFullName.trim().toLowerCase() ===
        originalFullName.trim().toLowerCase() &&
      newPhoneNumber === originalPhoneNumber
    ) {
      applybtn.disabled = true;

      applybtn.classList.remove("enabled");

      showToast("No changes were made.", "warning");

      return;
    }

    // -----------------------------------------------
    // GET USER
    // -----------------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      showToast("You are not logged in.", "warning");

      return;
    }

    // -----------------------------------------------
    // UPDATE DATABASE
    // -----------------------------------------------

    const { data, error } = await supabase
      .from("users")
      .update({
        full_name: newFullName,

        phone_number: newPhoneNumber || null,
      })
      .eq("user_id", user.id)
      .select();

    if (error) {
      console.error(error.message);

      showToast("Failed to update profile.", "error");

      return;
    }

    if (!data || data.length === 0) {
      showToast("Profile could not be updated.", "error");

      return;
    }

    // -----------------------------------------------
    // UPDATE ORIGINAL VALUES
    // -----------------------------------------------

    originalFullName = newFullName;

    originalPhoneNumber = newPhoneNumber;

    // -----------------------------------------------
    // UPDATE LOCAL STORAGE
    // -----------------------------------------------

    localStorage.setItem("firstName", formattedFirstName);

    localStorage.setItem("lastName", formattedLastName);

    // -----------------------------------------------
    // UPDATE PROFILE INITIAL
    // -----------------------------------------------

    mainProfileText.textContent = formattedFirstName.charAt(0).toUpperCase();

    // -----------------------------------------------
    // SUCCESS
    // -----------------------------------------------

    showToast("Profile updated successfully!", "success");

    // Button becomes disabled again
    validateProfile();
  }

  // ==================================================
  // DASHBOARD TITLE + EMAIL
  // ==================================================

  async function setDashboardTitle() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting user:", error);

      return;
    }

    if (!user) return;

    const email = user.email || "";

    // -----------------------------------------------
    // SAVE EMAIL TO LOCAL STORAGE
    // -----------------------------------------------

    localStorage.setItem("email", email);

    // -----------------------------------------------
    // DISPLAY EMAIL
    // -----------------------------------------------

    profileemail.textContent = email;

    userEmail.value = email;
  }

  // ==================================================
  // GET USER NAME
  // ==================================================

  async function getUserName() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error getting user:", userError);

      return;
    }

    if (!user) {
      console.log("No user is logged in");

      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("full_name")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error getting full name:", error);

      return;
    }

    const fullName = (data.full_name || "").trim();

    originalFullName = fullName;

    const names = fullName.split(/\s+/);

    const retrievedFirstName = names[0] || "";

    const retrievedLastName = names.length > 1 ? names[names.length - 1] : "";

    firstName.value = retrievedFirstName;

    lastName.value = retrievedLastName;

    localStorage.setItem("firstName", retrievedFirstName);

    localStorage.setItem("lastName", retrievedLastName);

    validateProfile();
  }

  // ==================================================
  // LOAD EVERYTHING
  // ==================================================

  getUserName();
  loadUsername();
  setDashboardTitle();

  return null;
}
