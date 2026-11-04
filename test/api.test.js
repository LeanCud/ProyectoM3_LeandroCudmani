import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../api/functions.js";

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function geminiResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  };
}

async function invoke(body, method = "POST") {
  const res = createResponse();
  await handler({ method, body }, res);
  return res;
}

beforeEach(() => {
  vi.stubEnv("GEMINI_API_KEY", "test-api-key");
  vi.stubEnv("GEMINI_MODEL", "test-model");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(geminiResponse({
    candidates: [{ content: { parts: [{ text: "Respuesta de prueba." }] } }],
  })));
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("endpoint POST /api/functions", () => {
  it("rechaza métodos distintos de POST y anuncia el permitido", async () => {
    const res = await invoke({ message: "Hola" }, "GET");

    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe("POST");
    expect(res.body.error).toContain("Método no permitido");
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(["GEMINI_API_KEY", "GEMINI_MODEL"])(
    "devuelve 500 si falta %s",
    async (variable) => {
      vi.stubEnv(variable, "");

      const res = await invoke({ message: "Hola" });

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toContain("no está configurado");
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["sin cuerpo", undefined],
    ["cuerpo null", null],
    ["cuerpo en forma de array", []],
    ["cuerpo en forma de texto", "message=hola"],
  ])("rechaza %s", async (_caseName, body) => {
    const res = await invoke(body);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("objeto JSON");
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    ["campo ausente", {}],
    ["valor no textual", { message: 123 }],
    ["solo espacios", { message: " \n\t " }],
  ])("rechaza mensajes con %s", async (_caseName, body) => {
    const res = await invoke(body);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("mensaje");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rechaza un mensaje que supera los 500 caracteres", async () => {
    const res = await invoke({ message: "x".repeat(501) });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("500 caracteres");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("acepta exactamente 500 caracteres, recorta espacios y llama a Gemini", async () => {
    const message = `${"x".repeat(499)} `;
    const res = await invoke({ message });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ reply: "Respuesta de prueba." });
    expect(fetch).toHaveBeenCalledOnce();

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain("/models/test-model:generateContent");
    expect(options.method).toBe("POST");
    expect(options.headers["x-goog-api-key"]).toBe("test-api-key");
    expect(JSON.parse(options.body).contents[0].parts[0].text).toBe("x".repeat(499));
  });

  it("elimina espacios alrededor del modelo y la clave antes de usarlos", async () => {
    vi.stubEnv("GEMINI_API_KEY", " test-api-key ");
    vi.stubEnv("GEMINI_MODEL", " test-model ");

    const res = await invoke({ message: "Hola" });

    expect(res.statusCode).toBe(200);
    expect(fetch.mock.calls[0][0]).toContain("/models/test-model:");
    expect(fetch.mock.calls[0][1].headers["x-goog-api-key"]).toBe("test-api-key");
  });

  it("traduce errores de Gemini a 502 sin filtrar el detalle externo", async () => {
    fetch.mockResolvedValue(geminiResponse(
      { error: { message: "detalle privado del proveedor" } },
      { ok: false, status: 429 },
    ));

    const res = await invoke({ message: "Hola" });

    expect(res.statusCode).toBe(502);
    expect(res.body.error).toBe("Gemini no pudo generar una respuesta.");
    expect(JSON.stringify(res.body)).not.toContain("detalle privado");
  });

  it("responde 502 cuando Gemini devuelve JSON inválido", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(new SyntaxError("invalid JSON")),
    });

    const res = await invoke({ message: "Hola" });

    expect(res.statusCode).toBe(502);
    expect(res.body.error).toBe("Gemini devolvió una respuesta inválida.");
  });

  it.each([
    ["sin texto", { candidates: [{ content: { parts: [] } }] }],
    ["texto vacío", { candidates: [{ content: { parts: [{ text: "  " }] } }] }],
  ])("responde 502 si Gemini devuelve una respuesta vacía (%s)", async (_caseName, data) => {
    fetch.mockResolvedValue(geminiResponse(data));

    const res = await invoke({ message: "Hola" });

    expect(res.statusCode).toBe(502);
    expect(res.body.error).toBe("Gemini devolvió una respuesta vacía.");
  });

  it.each([
    ["sin candidatos", {}],
    ["partes con formato inválido", { candidates: [{ content: { parts: {} } }] }],
  ])("rechaza la estructura inesperada de Gemini: %s", async (_caseName, data) => {
    fetch.mockResolvedValue(geminiResponse(data));

    const res = await invoke({ message: "Hola" });

    expect(res.statusCode).toBe(502);
    expect(res.body.error).toBe("Gemini devolvió una respuesta inválida.");
  });

  it("responde 502 si falla la conexión con Gemini", async () => {
    fetch.mockRejectedValue(new TypeError("network unavailable"));

    const res = await invoke({ message: "Hola" });

    expect(res.statusCode).toBe(502);
    expect(res.body.error).toBe("No se pudo contactar con Gemini.");
  });
});
