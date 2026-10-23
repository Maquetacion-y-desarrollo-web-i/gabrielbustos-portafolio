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

/* Tema claro / oscuro */
const root = document.documentElement;
const themeBtn = document.querySelector(".theme-toggle");
const syncThemeLabel = () =>
  themeBtn.setAttribute("aria-label", root.dataset.theme === "light" ? "Cambiar a tema oscuro" : "Cambiar a tema claro");
themeBtn.addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (e) {}
  syncThemeLabel();
});

syncThemeLabel();

/* Formulario de contacto */
const form = document.getElementById("contact-form");
const statusEl = form.querySelector(".form-status");
const submitBtn = form.querySelector("button[type=submit]");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    statusEl.className = "form-status is-error";
    statusEl.textContent = "Completá nombre, email y mensaje.";
    return;
  }
  submitBtn.disabled = true;
  statusEl.className = "form-status";
  statusEl.textContent = "Enviando…";

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    form.reset();
    statusEl.className = "form-status is-ok";
    statusEl.textContent = "¡Listo! Recibí tu consulta y te respondo pronto.";
  } catch (err) {
    statusEl.className = "form-status is-error";
    statusEl.textContent = "No se pudo enviar. Probá por WhatsApp o escribime a gabrielbustosdev@gmail.com.";
  } finally {
    submitBtn.disabled = false;
  }
});

/* Certificados: carrusel infinito, una tarjeta a la vez (flechas, arrastre y teclado) + vista ampliada */
(() => {
  const carousel = document.querySelector(".carousel");
  if (!carousel) return;
  const viewport = carousel.querySelector(".carousel-viewport");
  const track = carousel.querySelector(".carousel-track");
  const counter = document.querySelector(".carousel-count");
  const dialog = document.getElementById("cert-dialog");
  const dialogImg = dialog.querySelector("img");
  const dialogCaption = dialog.querySelector(".cert-caption");
  const total = track.children.length;

  [...track.children].forEach((li, i) => { li.dataset.n = i; });
  track.prepend(track.lastElementChild);

  let busy = false, dragStart = null, dragX = 0, moved = false, timer = 0;

  
  const setPos = (k, drag, animate) => {
    track.classList.toggle("no-anim", !animate);
    track.style.setProperty("--k", k);
    track.style.setProperty("--drag", `${drag}px`);
  };

  const sync = () => {
    [...track.children].forEach((li, i) => {
      li.inert = i !== 1;
      li.setAttribute("aria-hidden", String(i !== 1));
    });
    counter.textContent = `${Number(track.children[1].dataset.n) + 1} / ${total}`;
  };

  const settle = () => {
    setPos(1, 0, false);
    sync();
    void track.offsetWidth; 
    track.classList.remove("no-anim");
    busy = false;
  };

  const go = (dir) => {
    if (busy) return;
    busy = true;
    setPos(dir === "next" ? 2 : 0, 0, true);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      track.removeEventListener("transitionend", onEnd);
      if (dir === "next") track.append(track.firstElementChild);
      else track.prepend(track.lastElementChild);
      settle();
    };
    const onEnd = (e) => { if (e.target === track && e.propertyName === "transform") finish(); };
    track.addEventListener("transitionend", onEnd);
    timer = setTimeout(finish, 700); 
  };

  carousel.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-dir]");
    if (btn) go(btn.dataset.dir);
  });
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") go("next");
    else if (e.key === "ArrowLeft") go("prev");
  });

  // Arrastre con mouse o dedo
  viewport.addEventListener("pointerdown", (e) => {
    if (busy || (e.pointerType === "mouse" && e.button !== 0)) return;
    dragStart = e.clientX; dragX = 0; moved = false;
  });
  viewport.addEventListener("pointermove", (e) => {
    if (dragStart === null) return;
    dragX = e.clientX - dragStart;
    if (!moved && Math.abs(dragX) > 6) {
      moved = true;
      viewport.setPointerCapture(e.pointerId);
      viewport.classList.add("is-dragging");
    }
    if (moved) setPos(1, dragX, false);
  });
  const endDrag = () => {
    if (dragStart === null) return;
    dragStart = null;
    viewport.classList.remove("is-dragging");
    if (!moved) return;
    if (Math.abs(dragX) > Math.min(80, viewport.clientWidth / 5)) go(dragX < 0 ? "next" : "prev");
    else setPos(1, 0, true);
    setTimeout(() => { moved = false; }, 0); // evita que el arrastre dispare un "click"
  };
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("scroll", () => { viewport.scrollLeft = 0; });

  // Vista ampliada
  track.addEventListener("click", (e) => {
    const thumb = e.target.closest(".cert-thumb");
    if (!thumb || moved) return;
    dialogImg.src = thumb.dataset.full;
    dialogImg.alt = thumb.querySelector("img").alt;
    dialogCaption.textContent = thumb.closest(".cert-card").querySelector("h3").textContent;
    dialog.showModal();
  });
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || e.target.closest(".cert-close")) dialog.close();
  });

  settle();
})();