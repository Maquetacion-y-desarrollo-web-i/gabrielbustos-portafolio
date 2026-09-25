// Año dinámico en el footer
document.getElementById("year").textContent = new Date().getFullYear();

// Marca el link de navegación activo según la sección visible
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".main-nav a");
const menuButton = document.querySelector(".nav-tgl");
const mainNav = document.querySelector(".main-nav");

const closeMenu = (returnFocus = false) => {
  menuButton.classList.remove("is-toggled");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menú");
  mainNav.classList.remove("is-open");
  document.body.style.overflow = "";

  if (returnFocus) {
    menuButton.focus();
  }
};

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.classList.toggle("is-toggled", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  mainNav.classList.toggle("is-open", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";

  if (isOpen) {
    mainNav.querySelector("a").focus();
  }
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => closeMenu());
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    closeMenu(true);
  }
});

window.matchMedia("(min-width: 641px)").addEventListener("change", (event) => {
  if (event.matches) {
    closeMenu();
  }
});

const setActiveLink = () => {
  let currentId = "";

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 120 && rect.bottom >= 120) {
      currentId = section.id;
    }
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${currentId}`;
    link.classList.toggle("is-current", isActive);
  });
};

window.addEventListener("scroll", setActiveLink, { passive: true });
setActiveLink();
