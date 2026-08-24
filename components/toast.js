let toastContainer;

function createToastContainer() {
  if (toastContainer) return;

  toastContainer = document.createElement("div");
  toastContainer.className = "toast-container";

  document.body.appendChild(toastContainer);
}

export function showToast(message, type = "info") {
  createToastContainer();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  toast.textContent = message;

  toastContainer.appendChild(toast);

  // Show
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // Remove after 3 seconds
  if (type == "success") {
    setTimeout(() => {
      toast.classList.remove("show");

      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 8000);
  } else {
    setTimeout(() => {
      toast.classList.remove("show");

      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }
}
