// @vitest-environment jsdom

import { beforeAll, beforeEach, describe, expect, it } from "vitest";

let renderRoute;

beforeAll(async () => {
  document.body.innerHTML = `
    <header>
      <nav class="nav">
        <a href="/" data-route="/">Inicio</a>
        <a href="/chat" data-route="/chat">Chat</a>
        <a href="/acerca-de" data-route="/acerca-de">Acerca de</a>
      </nav>
    </header>
    <main id="app"></main>
  `;

  ({ renderRoute } = await import("../src/app.js"));
});

beforeEach(() => {
  document.querySelector("#app").innerHTML = "";
  window.history.replaceState({}, "", "/");
  renderRoute();
});

describe("router de la SPA", () => {
  it.each(["/", "/inicio", "/src/index.html"])(
    "muestra Inicio para %s",
    (path) => {
      window.history.replaceState({}, "", path);
      renderRoute();

      expect(document.querySelector("#hero-title")).not.toBeNull();
      expect(document.querySelector(".chat-button").getAttribute("href")).toBe("/chat");
    },
  );

  it("muestra la vista del chat y su formulario", () => {
    window.history.replaceState({}, "", "/chat");
    renderRoute();

    expect(document.querySelector("#chat-title").textContent).toContain("Habla con el capitán");
    expect(document.querySelector("#chat-form")).not.toBeNull();
    expect(document.querySelector(".chat-welcome")).not.toBeNull();
  });

  it("muestra Acerca de", () => {
    window.history.replaceState({}, "", "/acerca-de");
    renderRoute();

    expect(document.querySelector("#about-title").textContent).toContain("Acerca de");
    expect(document.querySelector(".about-page li")).not.toBeNull();
  });

  it("muestra un 404 en rutas desconocidas", () => {
    window.history.replaceState({}, "", "/ruta-inexistente");
    renderRoute();

    expect(document.querySelector(".not-found h1").textContent).toContain("no encontrada");
    expect(document.querySelector(".not-found a").getAttribute("href")).toBe("/");
    expect(document.querySelector(".nav [aria-current='page']")).toBeNull();
  });

  it("marca la ruta activa en la navegación", () => {
    window.history.replaceState({}, "", "/chat");
    renderRoute();

    expect(document.querySelector('.nav a[href="/chat"]').getAttribute("aria-current")).toBe("page");
    expect(document.querySelector('.nav a[href="/"]').hasAttribute("aria-current")).toBe(false);
  });

  it("navega a una ruta interna sin recargar", () => {
    const link = document.querySelector('.nav a[href="/chat"]');
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });

    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(window.location.pathname).toBe("/chat");
    expect(document.querySelector("#chat-form")).not.toBeNull();
  });

  it("no intercepta clics modificados para abrir otra pestaña", () => {
    const link = document.querySelector('.nav a[href="/chat"]');
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
      ctrlKey: true,
    });

    Object.defineProperty(event, "target", { value: link });
    document.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(window.location.pathname).toBe("/");
  });

  it("no intercepta enlaces externos", () => {
    const link = document.createElement("a");
    link.href = "https://example.com";
    link.dataset.route = "https://example.com";
    document.body.append(link);
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });

    Object.defineProperty(event, "target", { value: link });
    document.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(window.location.pathname).toBe("/");
    link.remove();
  });

  it("no intercepta clics que no sean el botón principal", () => {
    const link = document.querySelector('.nav a[href="/chat"]');
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 1,
    });

    Object.defineProperty(event, "target", { value: link });
    document.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(window.location.pathname).toBe("/");
  });

  it("actualiza la vista al recibir popstate", () => {
    window.history.pushState({}, "", "/acerca-de");
    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(document.querySelector("#about-title")).not.toBeNull();
  });
});
