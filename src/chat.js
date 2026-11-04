const history = [];
const MAX_MESSAGE_LENGTH = 500;

export function initChat() {
  const form = document.querySelector("#chat-form");
  const input = document.querySelector("#chat-input");
  const messages = document.querySelector("#chat-messages");
  const status = document.querySelector("#chat-status");
  if (!form || !input || !messages || !status) {
    throw new Error("No se encontró la interfaz necesaria para iniciar el chat.");
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const welcomeTime = document.querySelector("#chat-welcome-time");
  if (!submitButton) {
    throw new Error("No se encontró el botón para enviar mensajes.");
  }

  if (welcomeTime) {
    setMessageTime(welcomeTime, new Date());
  }

  // Recupera los mensajes si se navegó a otra vista y se volvió al chat.
  history.forEach(({ author, text, role, time }) => {
    addMessage(messages, author, text, role, new Date(time));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = input.value.trim();
    if (submitButton.disabled) return;
    if (!message) {
      status.textContent = "Escribe un mensaje antes de enviarlo.";
      input.focus();
      return;
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      status.textContent = `El mensaje no puede superar los ${MAX_MESSAGE_LENGTH} caracteres.`;
      input.focus();
      return;
    }

    const sentAt = new Date();
    history.push({
      author: "Tú",
      text: message,
      role: "user",
      time: sentAt.toISOString(),
    });
    addMessage(messages, "Tú", message, "user", sentAt);

    input.value = "";
    status.textContent = "";
    submitButton.disabled = true;

    const thinking = addThinkingMessage(messages);

    try {
      const response = await fetch("/api/functions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("El servidor devolvió una respuesta inválida.");
      }

      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("El servidor devolvió una respuesta inválida.");
      }

      if (!response.ok) {
        throw new Error(data.error || `Error del servidor: ${response.status}`);
      }

      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("El servidor devolvió una respuesta vacía.");
      }

      const receivedAt = new Date();
      history.push({
        author: "Capitán Jack",
        text: data.reply,
        role: "captain",
        time: receivedAt.toISOString(),
      });
      addMessage(messages, "Capitán Jack", data.reply, "captain", receivedAt);
    } catch (error) {
      status.textContent = error instanceof Error
        ? error.message
        : "No se pudo enviar el mensaje.";
    } finally {
      thinking.remove();
      submitButton.disabled = false;
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  });
}

function addMessage(container, author, text, role, date) {
  const article = document.createElement("article");
  article.className = `chat-message chat-message--${role}`;

  const label = document.createElement("span");
  label.className = "chat-message-author";
  label.textContent = author;

  const paragraph = document.createElement("p");
  paragraph.className = "chat-message-text";
  paragraph.textContent = text;

  const time = document.createElement("time");
  time.className = "chat-message-time";
  setMessageTime(time, date);

  article.append(label, paragraph, time);
  container.append(article);
  container.scrollTop = container.scrollHeight;
}

function addThinkingMessage(container) {
  const message = document.createElement("p");
  message.className = "chat-thinking";
  message.setAttribute("role", "status");
  message.textContent = "El capitán está pensando…";
  container.append(message);
  container.scrollTop = container.scrollHeight;
  return message;
}

function setMessageTime(element, date) {
  element.dateTime = date.toISOString();
  element.textContent = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}