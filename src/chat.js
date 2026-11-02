const history = [];

export function initChat() {
  const form = document.querySelector("#chat-form");
  const input = document.querySelector("#chat-input");
  const messages = document.querySelector("#chat-messages");
  const status = document.querySelector("#chat-status");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = input.value.trim();
    if (!message) return;

    addMessage(messages, "Tú", message);
    input.value = "";
    status.textContent = "El capitán está pensando…";

    try {
      const response = await fetch("/api/functions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });

      if (!response.ok) {
        throw new Error("No se pudo obtener una respuesta.");
      }

      const data = await response.json();
      addMessage(messages, "Capitán", data.reply);
      status.textContent = "";
    } catch (error) {
      status.textContent = error.message;
    }
  });
}

function addMessage(container, author, text) {
  const paragraph = document.createElement("p");
  paragraph.textContent = `${author}: ${text}`;
  container.append(paragraph);
}