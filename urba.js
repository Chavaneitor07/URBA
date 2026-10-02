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

const selections = { estilo: null, zona: null, tamano: null, diseño: null };

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

// Convierte "Línea fina" -> "línea fina" (solo la primera letra)
function lowerFirst(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

// Arma "en el brazo", "en la pierna", etc. según la zona elegida
function zonaPhrase(zona) {
  const map = {
    "Brazo": "en el brazo",
    "Pierna": "en la pierna",
    "Espalda": "en la espalda",
    "Mano": "en la mano",
    "Otra": "en otra zona",
  };
  return map[zona] || `en ${lowerFirst(zona)}`;
}

// Segunda línea del mensaje según si ya tiene diseño o no
function diseñoLine(valor) {
  switch (valor) {
    case "Sí, tengo referencia":
      return "Tengo una referencia del diseño y me gustaría conocer el proceso y recibir información para cotizarlo.";
    case "Tengo una idea":
      return "Tengo una idea del diseño y me gustaría conocer el proceso y recibir información para cotizarlo.";
    case "Quiero asesoría":
      return "Me gustaría recibir asesoría sobre el diseño, conocer el proceso y recibir información para cotizarlo.";
    default:
      return "Me gustaría conocer el proceso y recibir información para cotizarlo.";
  }
}

function updatePreview() {
  const bits = [];
  if (selections.estilo) bits.push(lowerFirst(selections.estilo));
  if (selections.tamano) bits.push(lowerFirst(selections.tamano));
  if (selections.zona) bits.push(zonaPhrase(selections.zona));

  const hasAny = bits.length > 0 || selections["diseño"];

  if (!hasAny) {
    preview.textContent = "Selecciona estilo, zona, tamaño y diseño para armar tu mensaje.";
    sendBtn.href = `https://wa.me/${WHATSAPP_NUMBER}`;
    return;
  }

  const firstLinePlain = bits.length
    ? `Hola, TinTempo. Me interesa realizar un tatuaje de ${bits.join(", ")}.`
    : "Hola, TinTempo. Me interesa realizar un tatuaje.";

  const secondLine = diseñoLine(selections["diseño"]);

  preview.replaceChildren();
  if (bits.length) {
    preview.append("Hola, TinTempo. Me interesa realizar un tatuaje de ");
    bits.forEach((bit, index) => {
      if (index) preview.append(", ");
      const bold = document.createElement("b");
      bold.textContent = bit;
      preview.append(bold);
    });
    preview.append(".");
  } else {
    preview.append("Hola, TinTempo. Me interesa realizar un tatuaje.");
  }
  preview.append(document.createElement("br"), secondLine, document.createElement("br"), "¡Gracias!");

  const message = `${firstLinePlain}\n${secondLine}\n¡Gracias!`;

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
    const shownByCategory = {};

    portfolioItems.forEach((item) => {
      const category = item.dataset.category;
      let show = filter === "todos" || category === filter;

      // En "Todos" deja una muestra de hasta tres trabajos por estilo.
      // Al elegir un estilo se muestran todas sus fotos.
      if (filter === "todos") {
        shownByCategory[category] = (shownByCategory[category] || 0) + 1;
        show = shownByCategory[category] <= 3;
      }

      item.classList.toggle("is-hidden", !show);
    });
  });
});

// Aplica también la vista inicial sin esperar a que el usuario toque un filtro.
portfolioFilters?.querySelector('[data-filter="todos"]')?.click();

/* ================================
   FOTOS DEL INICIO (rotan solas cada 6s y se pueden cambiar manualmente)
================================ */

const heroImg = document.getElementById("hero-img");
const heroDots = document.querySelectorAll("#hero-dots button");
const heroSlider = document.querySelector(".hero-slider");
const heroPrev = document.getElementById("hero-prev");
const heroNext = document.getElementById("hero-next");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
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

  const finishChange = () => {
    heroImg.src = dot.dataset.src;
    heroImg.alt = dot.dataset.alt || heroImg.alt;
    heroImg.classList.remove("is-changing");
  };

  if (prefersReducedMotion.matches) finishChange();
  else setTimeout(finishChange, 450);

  heroDots.forEach((d) => d.classList.remove("active"));
  dot.classList.add("active");
  heroDots.forEach((d) => d.setAttribute("aria-current", String(d === dot)));
}

function startHeroRotation() {
  if (prefersReducedMotion.matches || heroDots.length < 2) return;
  heroTimer = setInterval(() => {
    const next = (heroIndex + 1) % heroDots.length;
    showHeroPhoto(next);
  }, 6000);
}

function resetHeroRotation() {
  clearInterval(heroTimer);
  startHeroRotation();
}

function stepHeroPhoto(direction) {
  const next = (heroIndex + direction + heroDots.length) % heroDots.length;
  showHeroPhoto(next);
  resetHeroRotation();
}

heroDots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showHeroPhoto(index);
    resetHeroRotation();
  });
});

heroPrev?.addEventListener("click", () => stepHeroPhoto(-1));
heroNext?.addEventListener("click", () => stepHeroPhoto(1));

// En celular también se puede deslizar la foto hacia un lado.
let heroTouchStartX = null;
heroSlider?.addEventListener("touchstart", (event) => {
  heroTouchStartX = event.changedTouches[0].screenX;
}, { passive: true });

heroSlider?.addEventListener("touchend", (event) => {
  if (heroTouchStartX === null) return;
  const deltaX = event.changedTouches[0].screenX - heroTouchStartX;
  if (Math.abs(deltaX) > 45) stepHeroPhoto(deltaX < 0 ? 1 : -1);
  heroTouchStartX = null;
}, { passive: true });

if (heroImg && heroDots.length) {
  startHeroRotation();
}

/* ================================
   MENÚ: RESALTAR SECCIÓN ACTIVA
================================ */

const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const navSections = [...navLinks]
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (navSections.length) {
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === id);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );

  navSections.forEach((section) => spyObserver.observe(section));
}

/* ================================
   MENÚ MÓVIL
================================ */

const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
const header = document.querySelector("header");

// Oculta la barra al desplazarse hacia abajo y la recupera al subir.
let previousScrollY = window.scrollY;
let scrollTicking = false;

window.addEventListener("scroll", () => {
  if (scrollTicking) return;
  scrollTicking = true;

  window.requestAnimationFrame(() => {
    const currentScrollY = window.scrollY;
    const difference = currentScrollY - previousScrollY;
    const mobileMenuOpen = links?.classList.contains("mobile-menu");

    if (currentScrollY < 80 || mobileMenuOpen || difference < -6) {
      header?.classList.remove("nav-hidden");
    } else if (difference > 6) {
      header?.classList.add("nav-hidden");
    }

    previousScrollY = currentScrollY;
    scrollTicking = false;
  });
}, { passive: true });

function setMobileMenu(open) {
  links?.classList.toggle("mobile-menu", open);
  toggle?.setAttribute("aria-expanded", String(open));
  toggle?.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  if (toggle) toggle.textContent = open ? "×" : "☰";
}

toggle?.addEventListener("click", () => {
  setMobileMenu(!links?.classList.contains("mobile-menu"));
});

// Cerrar el menú al elegir una opción
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    setMobileMenu(false);
  });
});

/* ================================
   CARRUSEL DE RESEÑAS
================================ */

// En escritorio se ven 3 reseñas a la vez; en celular, una por vez
// (así la página no se estira y se desliza con el dedo o con las flechas).
const testiMobile = window.matchMedia("(max-width: 760px)");
let testiApi = null;

function initTestiSlider() {
  const container = document.getElementById("reviews-container");
  const dotsWrap = document.getElementById("testi-dots");
  if (!container || !dotsWrap) return;

  const slides = [...container.querySelectorAll("blockquote")];
  if (!slides.length) return;

  const perPage = testiMobile.matches ? 1 : 3;
  const pageCount = Math.ceil(slides.length / perPage);
  let page = 0;

  // Un punto por cada página
  dotsWrap.innerHTML = Array.from({ length: pageCount })
    .map((_, i) => `<button aria-label="Ver reseñas, página ${i + 1}"></button>`)
    .join("");
  const dots = [...dotsWrap.querySelectorAll("button")];

  function show(newPage) {
    page = (newPage + pageCount) % pageCount;
    const start = page * perPage;
    const end = start + perPage;
    slides.forEach((s, i) => s.classList.toggle("active", i >= start && i < end));
    dots.forEach((d, i) => d.classList.toggle("active", i === page));
  }

  dots.forEach((dot, i) => dot.addEventListener("click", () => show(i)));

  // Los botones y el deslizado usan siempre la versión más reciente
  testiApi = { step: (dir) => show(page + dir) };

  show(0);
}

// Flechas y deslizar con el dedo: se enlazan una sola vez
document.querySelector(".testi-prev")?.addEventListener("click", () => testiApi?.step(-1));
document.querySelector(".testi-next")?.addEventListener("click", () => testiApi?.step(1));

(function bindTestiSwipe() {
  const track = document.querySelector(".testi-track");
  if (!track) return;
  let startX = null;
  let startY = null;
  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  track.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    // Solo si el gesto fue claramente horizontal (no al hacer scroll)
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      testiApi?.step(dx < 0 ? 1 : -1);
    }
    startX = startY = null;
  });
})();

// Si giran el celular o cambia el tamaño de ventana, se reacomoda
testiMobile.addEventListener("change", initTestiSlider);

initTestiSlider();

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
    const reviews = document.createDocumentFragment();
    place.reviews.slice(0, 5).forEach((review) => {
      const rating = Number(review.rating);
      const starCount = Number.isFinite(rating) ? Math.max(0, Math.min(5, Math.round(rating))) : 5;
      const card = document.createElement("blockquote");
      const stars = document.createElement("span");
      stars.className = "testi-stars";
      stars.textContent = "★".repeat(starCount) + "☆".repeat(5 - starCount);

      const text = document.createElement("p");
      text.textContent = review.text || "";

      const author = document.createElement("cite");
      author.textContent = `— ${review.author_name || "Cliente de Google"}`;

      card.append(stars, text, author);
      reviews.append(card);
    });
    container.replaceChildren(reviews);
    initTestiSlider();
  }

  setRatingBadge(place.rating, place.user_ratings_total);

  if (summary && place.rating) {
    const total = place.user_ratings_total ? ` (${place.user_ratings_total} reseñas)` : "";
    summary.textContent = `${place.rating.toFixed(1)} ★ en Google${total}`;
  }
}

loadGoogleReviews();

/* ================================
   BADGE DE CALIFICACIÓN (hero)
================================ */

// Solo se muestra con datos REALES. Dos formas de activarlo:
// 1) Automática: cuando configures GOOGLE_MAPS_API_KEY, se llena sola.
// 2) Manual: escribe aquí tu calificación y total de reseñas tal como
//    aparecen hoy en Google Maps (ej. { rating: 4.9, total: 25 }).
//    Actualízalo de vez en cuando. Con null, el badge queda oculto.
const GOOGLE_RATING_MANUAL = { rating: null, total: null };

function setRatingBadge(rating, total) {
  const badge = document.getElementById("rating-badge");
  const text = document.getElementById("rating-badge-text");
  if (!badge || !text || !rating) return;

  const count = total ? ` (${total} reseñas)` : "";
  text.textContent = `${Number(rating).toFixed(1)} en Google${count}`;
  badge.hidden = false;
}

setRatingBadge(GOOGLE_RATING_MANUAL.rating, GOOGLE_RATING_MANUAL.total);

/* ================================
   PORTAFOLIO: "VER DETALLE" + LIGHTBOX
================================ */

(function initPortfolioLightbox() {
  const items = [...document.querySelectorAll("#portfolio-grid figure.portfolio-item")];
  if (!items.length) return;

  // Etiqueta "Ver detalle" y accesibilidad en cada foto real
  items.forEach((item) => {
    item.dataset.zoomable = "";
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", "Ver foto en grande");
    const tag = document.createElement("span");
    tag.className = "portfolio-zoom";
    tag.textContent = "Ver detalle";
    item.appendChild(tag);
  });

  const box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Foto del portafolio");
  box.innerHTML = `
    <button class="lightbox-close" aria-label="Cerrar">✕</button>
    <button class="lightbox-prev" aria-label="Foto anterior">‹</button>
    <figure><img alt=""><figcaption></figcaption></figure>
    <button class="lightbox-next" aria-label="Foto siguiente">›</button>`;
  document.body.appendChild(box);

  const img = box.querySelector("img");
  const caption = box.querySelector("figcaption");
  let current = 0;
  let lastFocus = null;

  // Solo navega entre las fotos visibles con el filtro activo
  const visible = () => items.filter((i) => !i.classList.contains("is-hidden"));

  function show(item) {
    const src = item.querySelector("img");
    img.src = src.currentSrc || src.src;
    img.alt = src.alt;
    caption.textContent = item.querySelector("figcaption")?.textContent || "";
    current = visible().indexOf(item);
  }

  function step(dir) {
    const list = visible();
    if (list.length < 2) return;
    show(list[(current + dir + list.length) % list.length]);
  }

  function open(item) {
    lastFocus = document.activeElement;
    show(item);
    box.classList.add("open");
    document.body.style.overflow = "hidden";
    box.querySelector(".lightbox-close").focus();
  }

  function close() {
    box.classList.remove("open");
    document.body.style.overflow = "";
    lastFocus?.focus();
  }

  items.forEach((item) => {
    item.addEventListener("click", () => open(item));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(item);
      }
    });
  });

  box.querySelector(".lightbox-close").addEventListener("click", close);
  box.querySelector(".lightbox-prev").addEventListener("click", () => step(-1));
  box.querySelector(".lightbox-next").addEventListener("click", () => step(1));
  box.addEventListener("click", (e) => {
    if (e.target === box) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!box.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  // Deslizar con el dedo para cambiar de foto
  let startX = null;
  box.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    startX = null;
  });
})();
