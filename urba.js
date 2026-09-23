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
   FILTRO DE PORTAFOLIO POR CATEGORÍA
================================ */

const portfolioFilters = document.getElementById("portfolio-filters");
const portfolioItems = document.querySelectorAll("#portfolio-grid .portfolio-item");

portfolioFilters?.querySelectorAll(".chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    portfolioFilters.querySelectorAll(".chip").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;

    portfolioItems.forEach((item) => {
      const match = filter === "todos" || item.dataset.category === filter;
      item.classList.toggle("is-hidden", !match);
    });
  });
});

/* ================================
   FOTOS DEL INICIO (rotan solas cada 3s)
================================ */

const heroImg = document.getElementById("hero-img");
const heroDots = document.querySelectorAll("#hero-dots button");
let heroIndex = 0;
let heroTimer = null;

// Precarga para que el cambio no parpadee
heroDots.forEach((dot) => {
  new Image().src = dot.dataset.src;
});

function showHeroPhoto(index) {
  heroIndex = index;
  const dot = heroDots[index];
  if (!heroImg || !dot) return;

  heroImg.classList.add("is-changing");

  setTimeout(() => {
    heroImg.src = dot.dataset.src;
    heroImg.alt = dot.dataset.alt || heroImg.alt;
    heroImg.classList.remove("is-changing");
  }, 450);

  heroDots.forEach((d) => d.classList.remove("active"));
  dot.classList.add("active");
}

function startHeroRotation() {
  heroTimer = setInterval(() => {
    const next = (heroIndex + 1) % heroDots.length;
    showHeroPhoto(next);
  }, 3000);
}

heroDots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    clearInterval(heroTimer);
    showHeroPhoto(index);
    startHeroRotation();
  });
});

if (heroImg && heroDots.length) {
  startHeroRotation();
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

/* ================================
   RESEÑAS DE GOOGLE (automáticas)
================================ */

// 1) Ve a https://console.cloud.google.com/, crea un proyecto,
//    activa "Places API" y genera una API key.
// 2) Restringe la key por "referenciadores HTTP" a tu dominio
//    (ej. urbanotattoo.mx/*) para que nadie más la use.
// 3) Pega la key aquí abajo. Mientras diga "PON_AQUI_TU_API_KEY"
//    la página seguirá mostrando las 3 reseñas de respaldo.
const GOOGLE_MAPS_API_KEY = "PON_AQUI_TU_API_KEY";

// Texto de búsqueda para encontrar el negocio correcto
const GOOGLE_PLACE_QUERY = "Urbano Tattoo, Sadi Carnot 97, Ciudad de México";

function loadGoogleReviews() {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "PON_AQUI_TU_API_KEY") {
    // Sin key configurada: se quedan las reseñas de respaldo del HTML.
    return;
  }

  const script = document.createElement("script");
  script.src =
    `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}` +
    `&libraries=places&callback=initGoogleReviews`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// Google llama esta función en cuanto su script termina de cargar
window.initGoogleReviews = function () {
  const node = document.getElementById("places-service-node");
  const service = new google.maps.places.PlacesService(node);

  service.findPlaceFromQuery(
    {
      query: GOOGLE_PLACE_QUERY,
      fields: ["place_id"],
    },
    (results, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results?.[0]) {
        return; // se quedan las reseñas de respaldo
      }

      service.getDetails(
        {
          placeId: results[0].place_id,
          fields: ["reviews", "rating", "user_ratings_total"],
        },
        (place, detailStatus) => {
          if (detailStatus !== google.maps.places.PlacesServiceStatus.OK || !place) {
            return;
          }
          renderGoogleReviews(place);
        }
      );
    }
  );
};

function renderGoogleReviews(place) {
  const container = document.getElementById("reviews-container");
  const summary = document.getElementById("reviews-summary");
  if (!container) return;

  if (Array.isArray(place.reviews) && place.reviews.length) {
    container.innerHTML = place.reviews
      .slice(0, 3)
      .map(
        (r) => `
        <blockquote>
          <p>${r.text}</p>
          <cite>— ${r.author_name}</cite>
        </blockquote>`
      )
      .join("");
  }

  if (summary && place.rating) {
    const total = place.user_ratings_total ? ` (${place.user_ratings_total} reseñas)` : "";
    summary.textContent = `${place.rating.toFixed(1)} ★ en Google${total}`;
  }
}

loadGoogleReviews();
