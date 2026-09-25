const year = document.getElementById("year");
const menuButton = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
const navLinks = document.querySelectorAll(".main-nav a");
const sections = document.querySelectorAll("main section[id]");

year.textContent = new Date().getFullYear();

const closeMenu = (returnFocus = false) => {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menú");
  menuButton.classList.remove("is-toggled");
  mainNav.classList.remove("is-open");
  document.body.classList.remove("menu-open");

  if (returnFocus) menuButton.focus();
};

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.classList.toggle("is-toggled", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  mainNav.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);

  if (isOpen) mainNav.querySelector("a").focus();
});

navLinks.forEach((link) => link.addEventListener("click", () => closeMenu()));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    closeMenu(true);
  }
});

window.matchMedia("(min-width: 701px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

const setActiveLink = () => {
  let currentId = "";

  sections.forEach((section) => {
    const bounds = section.getBoundingClientRect();
    if (bounds.top <= 130 && bounds.bottom >= 130) currentId = section.id;
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${currentId}`;
    link.classList.toggle("is-current", isActive);
    if (isActive) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
};

window.addEventListener("scroll", setActiveLink, { passive: true });
setActiveLink();