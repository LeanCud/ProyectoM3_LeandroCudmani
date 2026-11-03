import { initChat } from "./chat.js";

const app = document.querySelector("#app");
const homeImageUrl = new URL("./img/Home-img.jpg", import.meta.url).href;


const routes = {
  "/": renderHome,
  "/src/index.html": renderHome,
  "/inicio": renderHome,
  "/chat": renderChat,
  "/acerca-de": renderAbout,
};

function renderRoute() {
  const render = routes[window.location.pathname];

  if (!render) {
    app.innerHTML = `
      <section class="not-found">
        <h1>Página no encontrada</h1>
        <a href="/" data-route="/">Volver al inicio</a>
      </section>
    `;
    return;
  }

  render();
  updateActiveLink(window.location.pathname);
}

function renderHome() {
  app.innerHTML = `
    <section class="hero" aria-labelledby="hero-title">
      <figure class="hero-portrait">
        <img
          src="${homeImageUrl}"
          alt="Un capitán listo para zarpar"
        >
        <figcaption class="portrait-caption">
          <span class="status-dot" aria-hidden="true"></span>
          <span>En alta mar · Caribe</span>
        </figcaption>
      </figure>

      <div class="hero-copy">
        <p class="eyebrow">
          <span aria-hidden="true">✦</span>
          Ron · Rumbo · Leyenda
        </p>

        <h1 id="hero-title">
          Las mejores historias empiezan <em>en alta mar.</em>
        </h1>

        <p class="hero-description">
          El capitán tiene un mapa, mil aventuras y una respuesta para todo.
          ¿Te atreves a preguntarle?
        </p>

        <a class="chat-button" href="/chat" data-route="/chat">
          <span>Hablar con el capitán</span>
          <span class="button-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  `;
}

function renderChat() {
  app.innerHTML = `
    <section class="chat-page" aria-labelledby="chat-title">
      <div class="chat-heading">
        <p class="eyebrow">Una conversación en alta mar</p>
        <h1 id="chat-title">Habla con el capitán</h1>
        <p>Escribe tu pregunta y espera su respuesta.</p>
      </div>

      <div
        class="chat-messages"
        id="chat-messages"
        aria-live="polite"
        aria-label="Conversación"
      >
        <article class="chat-message chat-message--captain chat-welcome">
          <p class="chat-message-text">
            Muy buenos días, tardes o la hora imprecisa que sea. El capitán está a tu disposición. ¿Qué aventura te trae por estos mares?
          </p>
          <time class="chat-message-time" id="chat-welcome-time"></time>
        </article>
      </div>

      <form class="chat-form" id="chat-form">
        <label for="chat-input">Tu mensaje</label>
        <div class="chat-form-controls">
          <input
            id="chat-input"
            name="message"
            type="text"
            maxlength="500"
            placeholder="Escribe tu pregunta..."
            required
          >
          <button type="submit">Enviar</button>
        </div>
        <p class="chat-status" id="chat-status" aria-live="polite"></p>
      </form>
    </section>
  `;

  initChat();
}

function renderAbout() {
  app.innerHTML = `
    <section class="about-page" aria-labelledby="about-title">
      <p class="eyebrow">La bitácora del proyecto</p>
      <h1 id="about-title">Acerca de esta aventura</h1>

      <p>
        Esta aplicación permite conversar con un personaje ficticio.
        La interfaz es una SPA: cambia de vista sin recargar la página.
      </p>

      <h2>Tecnologías</h2>
      <ul>
        <li>HTML y CSS para la interfaz.</li>
        <li>JavaScript y History API para la navegación.</li>
        <li>Gemini, consultado desde un endpoint de servidor.</li>
      </ul>
    </section>
  `;
}



document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-route]");

  if (!link || event.defaultPrevented) return;
  if (link.origin !== window.location.origin) return;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;

  event.preventDefault();
  history.pushState({}, "", link.href);
  renderRoute();
});

window.addEventListener("popstate", renderRoute);
renderRoute();

function updateActiveLink(path) {
  document.querySelectorAll(".nav [data-route]").forEach((link) => {
    if (link.getAttribute("href") === path) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}
