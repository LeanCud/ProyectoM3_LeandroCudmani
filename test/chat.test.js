// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

function createChatMarkup() {
  document.body.innerHTML = `
    <main>
      <div id="chat-messages">
        <article class="chat-message chat-message--captain chat-welcome">
          <p class="chat-message-text">Saludo de bienvenida</p>
          <time class="chat-message-time" id="chat-welcome-time"></time>
        </article>
      </div>
      <form id="chat-form">
        <input id="chat-input" maxlength="500">
        <button type="submit">Enviar</button>
        <p id="chat-status"></p>
      </form>
    </main>
  `;
}

async function loadChat() {
  vi.resetModules();
  const { initChat } = await import("../src/chat.js");
  initChat();
}

function submitForm() {
  document.querySelector("#chat-form").dispatchEvent(
    new Event("submit", { bubbles: true, cancelable: true }),
  );
}

async function waitForHandler() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  };
}

beforeEach(() => {
  createChatMarkup();
  vi.stubGlobal("fetch", vi.fn());
});

describe("chat del usuario", () => {
  it("rechaza iniciar si faltan elementos requeridos", async () => {
    document.body.innerHTML = "";
    vi.resetModules();
    const { initChat } = await import("../src/chat.js");

    expect(() => initChat()).toThrow("No se encontró la interfaz necesaria");
  });

  it("muestra un error claro si falta el botón de envío", async () => {
    document.querySelector("button").remove();
    vi.resetModules();
    const { initChat } = await import("../src/chat.js");

    expect(() => initChat()).toThrow("No se encontró el botón");
  });

  it.each(["", "   \t  "])("no envía un mensaje vacío (%j)", async (value) => {
    await loadChat();
    document.querySelector("#chat-input").value = value;

    submitForm();

    expect(fetch).not.toHaveBeenCalled();
    expect(document.querySelector("#chat-status").textContent).toContain("Escribe un mensaje");
    expect(document.querySelectorAll(".chat-message--user")).toHaveLength(0);
  });

  it("rechaza mensajes que exceden el límite aunque se fuerce el formulario", async () => {
    await loadChat();
    document.querySelector("#chat-input").value = "x".repeat(501);

    submitForm();

    expect(fetch).not.toHaveBeenCalled();
    expect(document.querySelector("#chat-status").textContent).toContain("500 caracteres");
    expect(document.querySelectorAll(".chat-message--user")).toHaveLength(0);
  });

  it("recorta espacios y envía el mensaje; muestra respuesta y horas", async () => {
    fetch.mockResolvedValue(jsonResponse({ reply: "A navegar, entonces." }));
    await loadChat();
    document.querySelector("#chat-input").value = "  ¿A dónde vamos?  ";

    submitForm();
    await waitForHandler();

    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith("/api/functions", expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }));
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.message).toBe("¿A dónde vamos?");
    expect(document.querySelector(".chat-message--user .chat-message-text").textContent)
      .toBe("¿A dónde vamos?");
    expect(document.querySelector(".chat-message--captain:not(.chat-welcome) .chat-message-author").textContent)
      .toBe("Capitán Jack");
    expect(document.querySelector(".chat-message--captain:not(.chat-welcome) .chat-message-text").textContent)
      .toBe("A navegar, entonces.");
    expect(document.querySelector("#chat-input").value).toBe("");
    expect(document.querySelector("#chat-status").textContent).toBe("");
    expect(document.querySelectorAll(".chat-message-time"))
      .toHaveLength(3);
    expect([...document.querySelectorAll(".chat-message-time")].every((time) =>
      /^\d{2}:\d{2}:\d{2}$/.test(time.textContent))).toBe(true);
  });

  it("permite el límite exacto de 500 caracteres", async () => {
    fetch.mockResolvedValue(jsonResponse({ reply: "Recibido." }));
    await loadChat();
    document.querySelector("#chat-input").value = "x".repeat(500);

    submitForm();
    await waitForHandler();

    expect(fetch).toHaveBeenCalledOnce();
    expect(JSON.parse(fetch.mock.calls[0][1].body).message).toHaveLength(500);
  });

  it("coloca el indicador de espera después del mensaje y evita doble envío", async () => {
    let resolveFetch;
    fetch.mockReturnValue(new Promise((resolve) => {
      resolveFetch = resolve;
    }));
    await loadChat();
    document.querySelector("#chat-input").value = "Primer mensaje";

    submitForm();

    const messages = document.querySelector("#chat-messages");
    expect(messages.children[1].classList.contains("chat-message--user")).toBe(true);
    expect(messages.children[2].classList.contains("chat-thinking")).toBe(true);
    expect(document.querySelector('button[type="submit"]').disabled).toBe(true);

    document.querySelector("#chat-input").value = "Segundo mensaje";
    submitForm();
    expect(fetch).toHaveBeenCalledOnce();
    expect(document.querySelectorAll(".chat-message--user")).toHaveLength(1);

    resolveFetch(jsonResponse({ reply: "Respuesta." }));
    await waitForHandler();

    expect(document.querySelector(".chat-thinking")).toBeNull();
    expect(document.querySelector('button[type="submit"]').disabled).toBe(false);
  });

  it("muestra el error devuelto por el endpoint y restaura el formulario", async () => {
    fetch.mockResolvedValue(jsonResponse({ error: "Servicio no configurado." }, {
      ok: false,
      status: 500,
    }));
    await loadChat();
    document.querySelector("#chat-input").value = "Hola";

    submitForm();
    await waitForHandler();

    expect(document.querySelector("#chat-status").textContent).toBe("Servicio no configurado.");
    expect(document.querySelector(".chat-thinking")).toBeNull();
    expect(document.querySelector('button[type="submit"]').disabled).toBe(false);
  });

  it("maneja respuestas sin JSON válido", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(new SyntaxError("invalid JSON")),
    });
    await loadChat();
    document.querySelector("#chat-input").value = "Hola";

    submitForm();
    await waitForHandler();

    expect(document.querySelector("#chat-status").textContent)
      .toBe("El servidor devolvió una respuesta inválida.");
  });

  it("rechaza un JSON válido que no es un objeto de respuesta", async () => {
    fetch.mockResolvedValue(jsonResponse(null));
    await loadChat();
    document.querySelector("#chat-input").value = "Hola";

    submitForm();
    await waitForHandler();

    expect(document.querySelector("#chat-status").textContent)
      .toBe("El servidor devolvió una respuesta inválida.");
  });

  it.each([
    ["respuesta vacía", { reply: "   " }],
    ["respuesta ausente", {}],
    ["respuesta con formato incorrecto", { reply: 42 }],
  ])("informa una %s del servidor", async (_caseName, body) => {
    fetch.mockResolvedValue(jsonResponse(body));
    await loadChat();
    document.querySelector("#chat-input").value = "Hola";

    submitForm();
    await waitForHandler();

    expect(document.querySelector("#chat-status").textContent)
      .toBe("El servidor devolvió una respuesta vacía.");
  });

  it("muestra el fallo de red y permite continuar", async () => {
    fetch.mockRejectedValue(new TypeError("Failed to fetch"));
    await loadChat();
    document.querySelector("#chat-input").value = "Hola";

    submitForm();
    await waitForHandler();

    expect(document.querySelector("#chat-status").textContent).toBe("Failed to fetch");
    expect(document.querySelector('button[type="submit"]').disabled).toBe(false);
  });

  it("restaura los mensajes al salir del chat y volver durante la sesión", async () => {
    fetch.mockResolvedValue(jsonResponse({ reply: "Respuesta guardada." }));
    await loadChat();
    document.querySelector("#chat-input").value = "Mensaje guardado";

    submitForm();
    await waitForHandler();

    createChatMarkup();
    const { initChat } = await import("../src/chat.js");
    initChat();

    expect([...document.querySelectorAll(".chat-message-text")].map((node) => node.textContent))
      .toEqual(["Saludo de bienvenida", "Mensaje guardado", "Respuesta guardada."]);
  });
});
