/* Urbano Tatto - funciones principales de la página */

// Número de WhatsApp con lada de país (52 = México), sin +, espacios ni guiones.
const WHATSAPP_NUMBER = "525525199535";

// Todos los botones de WhatsApp de la página usan este mismo número
document.querySelectorAll('a[href*="wa.me/"]').forEach((a) => {
  a.href = a.href.replace(/wa\.me\/\d+/, `wa.me/${WHATSAPP_NUMBER}`);
});

/* ================================
   SELECCIONES (chips)
================================ */

const selections = { estilo: null, zona: null, tamano: null };

const preview = document.getElementById("preview");
const sendBtn = document.getElementById("quick-send");

document.querySelectorAll(".chips").forEach((group) => {
  const key = group.dataset.group;

  group.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const alreadyActive = chip.classList.contains("active");

      group.querySelectorAll(".chip").forEach((item) => {
        item.classList.remove("active");
      });

      if (alreadyActive) {
        selections[key] = null;
      } else {
        chip.classList.add("active");
        selections[key] = chip.textContent.trim();
      }

      updatePreview();
    });
  });
});

/* ================================
   VISTA PREVIA Y ENLACE DE WHATSAPP
================================ */

function updatePreview() {
  const parts = [];

  if (selections.estilo) parts.push(`estilo <b>${selections.estilo}</b>`);
  if (selections.zona) parts.push(`en <b>${selections.zona}</b>`);
  if (selections.tamano) parts.push(`tamaño <b>${selections.tamano}</b>`);

  if (parts.length === 0) {
    preview.textContent = "Selecciona estilo, zona y tamaño para armar tu mensaje.";
  } else {
    preview.innerHTML = `Hola, quiero un tatuaje ${parts.join(", ")}. ¿Me pueden dar información?`;
  }

  const message =
    "Hola, quiero un tatuaje" +
    (selections.estilo ? " estilo " + selections.estilo : "") +
    (selections.zona ? " en " + selections.zona : "") +
    (selections.tamano ? " tamaño " + selections.tamano : "") +
    ". ¿Me pueden dar información?";

  sendBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* ================================
   MENÚ MÓVIL
================================ */

const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");

toggle?.addEventListener("click", () => {
  const open = links.classList.toggle("mobile-menu");
  toggle.setAttribute("aria-expanded", String(open));
});

// Cerrar el menú al elegir una opción
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    links.classList.remove("mobile-menu");
    toggle?.setAttribute("aria-expanded", "false");
  });
});
