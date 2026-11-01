const app = document.querySelector("#app");

function renderHome() {
  app.innerHTML = `
    <section class="hero" aria-labelledby="hero-title">
      <figure class="hero-portrait">
        <img
          src="./img/Home-img.jpg"
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
        <p class="chat-welcome">
          ¡Ahoy! ¿Qué quieres saber, grumete?
        </p>
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