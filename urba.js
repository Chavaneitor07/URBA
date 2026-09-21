/*

* Tinta Nómada
* Funciones principales de la página
  */

/* ================================
CONFIGURACIÓN
================================ */

// Número de WhatsApp del negocio.
// Utilizar lada de país, sin espacios, + ni guiones.
const WHATSAPP_NUMBER = "5525199535";

/* ================================
SELECCIONES
================================ */

const selections = {
estilo: null,
zona: null,
tamano: null
};

/* ================================
ELEMENTOS DEL DOM
================================ */

const preview = document.getElementById("preview");
const sendBtn = document.getElementById("quick-send");

/* ================================
CHIPS
================================ */

document.querySelectorAll(".chips").forEach((group) => {

const key = group.dataset.group;

group.querySelectorAll(".chip").forEach((chip) => {

```
chip.addEventListener("click", () => {

  const alreadyActive = chip.classList.contains("active");

  // Quitar selección anterior
  group.querySelectorAll(".chip").forEach((item) => {
    item.classList.remove("active");
  });

  // Si no estaba seleccionado, activarlo
  if (!alreadyActive) {

    chip.classList.add("active");

    selections[key] = chip.textContent.trim();

  } else {

    selections[key] = null;

  }

  updatePreview();

});
```

});

});

/* ================================
ACTUALIZAR PREVISUALIZACIÓN
================================ */

function updatePreview() {

const parts = [];

if (selections.estilo) {
parts.push(`estilo <b>${selections.estilo}</b>`);
}

if (selections.zona) {
parts.push(`en <b>${selections.zona}</b>`);
}

if (selections.tamano) {
parts.push(`tamaño <b>${selections.tamano}</b>`);
}

// Mensaje inicial
if (parts.length === 0) {

```
preview.textContent =
  "Selecciona estilo, zona y tamaño para armar tu mensaje.";
```

} else {

```
preview.innerHTML =
  "Hola, quiero un tatuaje ${parts.join(", ")}. ¿Me pueden dar información?";
```

}

/* ================================
MENSAJE DE WHATSAPP
================================= */

const message =
`Hola, quiero un tatuaje` +
`${selections.estilo ? " estilo " + selections.estilo : ""}` +
`${selections.zona ? " en " + selections.zona : ""}` +
`${selections.tamano ? " tamaño " + selections.tamano : ""}. ` +
`¿Me pueden dar información?`;

// Crear enlace de WhatsApp
sendBtn.href =
`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

}

/* ================================
MENÚ MÓVIL
================================ */

const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");

toggle?.addEventListener("click", () => {

const visible = links.classList.contains("mobile-menu");

if (visible) {

```
links.classList.remove("mobile-menu");
```

} else {

```
links.classList.add("mobile-menu");
```

}

});

/* ================================
CERRAR MENÚ AL SELECCIONAR
UNA OPCIÓN
================================ */

document.querySelectorAll(".nav-links a").forEach((link) => {

link.addEventListener("click", () => {

```
links.classList.remove("mobile-menu");
```

});

});
