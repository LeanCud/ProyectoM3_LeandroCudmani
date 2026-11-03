const MAX_MESSAGE_LENGTH = 500;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;

  if (!apiKey || !model) {
    console.error("Faltan GEMINI_API_KEY o GEMINI_MODEL.");
    return res.status(500).json({
      error: "El servicio de conversación no está configurado.",
    });
  }

  const message = req.body?.message;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Escribe un mensaje." });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      error: `El mensaje no puede superar los ${MAX_MESSAGE_LENGTH} caracteres.`,
    });
  }

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "Interpreta al famoso capitán Jack Sparrow de los piratas del caribe, aventurero y ocurrente. Responde en español, con humor, doble sentido, sarcasmo",
            }],
          },
          contents: [{
            role: "user",
            parts: [{ text: message.trim() }],
          }],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.8,
          },
        }),
      },
    );

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error("Gemini respondió con error:", geminiResponse.status, data);
      return res.status(502).json({
        error: "Gemini no pudo generar una respuesta.",
      });
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!reply) {
      console.error("Gemini devolvió una respuesta vacía o inesperada.");
      return res.status(502).json({
        error: "Gemini devolvió una respuesta vacía.",
      });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Error al comunicarse con Gemini:", error);
    return res.status(502).json({
      error: "No se pudo contactar con Gemini.",
    });
  }
};