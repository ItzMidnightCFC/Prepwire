let navbar = document.querySelector("header");
let header = document.querySelector("header");
let mobileNavbar = document.querySelector(".mobile-navbar");
let navlinks = document.querySelectorAll("nav ul li a");
let headertext = document.querySelector("header h1");

window.addEventListener("scroll", () => {
  if (window.scrollY > 20) {
    navbar.classList.add("scrolled");
    headertext.classList.add("scrolled");
    navlinks.forEach((n) => {
      n.classList.add("scrolled");
    });
  } else {
    if (mobileNavbar.classList.contains('active')) {
    headertext.classList.add("scrolled");
  }
  else {
    headertext.classList.remove("scrolled");
  }
    
    navbar.classList.remove("scrolled");
    
    navlinks.forEach((n) => {
      n.classList.remove("scrolled");
    });
  }
});

function Register() {
  sessionStorage.setItem("registerpage", true);
  window.open("/authentication", "_blank");
}

function Login(){
  sessionStorage.removeItem("registerpage");
  window.open("/authentication", "_blank");
};

const btn = document.getElementById("menuBtn");

btn.addEventListener("click", () => {
  
  if (!navbar.classList.contains('scrolled')) {
  headertext.classList.toggle("scrolled");
}
else {
  if (window.scrollY == 0) {
  headertext.classList.remove("scrolled");
}
}
  btn.classList.toggle("active");
  mobileNavbar.classList.toggle("active");
  navbar.classList.toggle("menuactive");
  
});

function screenWidth() {
  const height = header.getBoundingClientRect().height;
  mobileNavbar.style.top = height + "px";
}


