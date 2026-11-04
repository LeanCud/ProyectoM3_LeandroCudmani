# El Perla Negra

https://proyectom3.vercel.app/

SPA responsive para conversar con un capitán pirata ficticio. Está construida con HTML, CSS y JavaScript, utiliza History API para la navegación y se conecta con Google Gemini a través de una función de Vercel.

## Personaje

El proyecto presenta a Jack Sparrow, personaje ficticio de *Piratas del Caribe*, como un capitán aventurero, ingenioso y sarcástico. Las respuestas del chat se generan mediante Gemini a partir de instrucciones de personalidad definidas en el servidor.

## Funcionalidades

- Navegación SPA entre Inicio, Chat y Acerca de.
- Diseño responsive para pantallas móviles, tablets y escritorio.
- Chat con respuestas generadas por Google Gemini.
- Indicador mientras el personaje prepara la respuesta.
- Historial de mensajes conservado en memoria mientras la aplicación está abierta. Se pierde al recargar la página o cerrar la pestaña.
- API key protegida en el servidor: no se incluye en el código del navegador.

> La interfaz conserva la conversación entre vistas. Actualmente, el endpoint envía a Gemini el mensaje nuevo, pero no el historial como contexto; por eso el personaje puede no recordar los turnos anteriores.

## Tecnologías

- HTML
- CSS
- JavaScript
- History API
- Vercel Functions
- Google Gemini API
- Vitest
- jsdom

## Requisitos

- Node.js LTS y npm
- Cuenta de Vercel
- API key de Google AI Studio con acceso a un modelo Gemini

## Ejecutar localmente

1. Clona el repositorio y entra a su carpeta:

   ```bash
   git clone https://github.com/LeanCud/ProyectoM3_LeandroCudmani.git
   cd ProyectoM3_LeandroCudmani
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Copia el archivo de ejemplo para crear tu configuración local. Desde Git Bash:

   ```bash
   cp .env.example .env.local
   ```

   Abre `.env.local` y reemplaza los valores de ejemplo por tu API key y el identificador de un modelo habilitado:

   ```env
   GEMINI_API_KEY=tu_clave_de_google_ai_studio
   GEMINI_MODEL=nombre_del_modelo_disponible
   ```

   `.env.example` es solo una plantilla y no debe contener secretos. `.env.local` está excluido por Git; no lo compartas ni lo subas al repositorio.

4. Inicia sesión en Vercel si todavía no lo hiciste:

   ```bash
   npx vercel login
   ```

5. Inicia el servidor local:

   ```bash
   npx vercel dev
   ```

6. Abre en el navegador la dirección que aparece en la terminal, normalmente `http://localhost:3000`.

## Ejecutar los tests

Desde la raíz del proyecto, ejecuta:

```bash
npm test
```

Las pruebas usan respuestas simuladas para Gemini; no requieren una API key ni generan llamadas reales al servicio.

## Desplegar en Vercel

1. Importa el repositorio de GitHub en Vercel o vincúlalo con Vercel CLI.
2. Configura la raíz del proyecto como el directorio que contiene `vercel.json`, `api/` y `src/`.
3. En **Settings → Environment Variables**, agrega:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`
4. Selecciona **Production** para ambas variables y guarda los cambios.
5. Despliega desde la raíz del proyecto:

   ```bash
   npx vercel --prod
   ```

Si cambias las variables de entorno, vuelve a desplegar para que los cambios surtan efecto.

## Capturas de pantalla

### Inicio - Mobile
- [Pagina de inicio funcionando en mobile](src/docs/SPA-Screen/Inicio-Mobile.png)

### Chat — Mobile
- [Chat funcionando en mobile](src/docs/SPA-Screen/Chat-Mobile.png)

### Acerca de - Mobile
- [Acerca de funcionando en mobile](src/docs/SPA-Screen/AcercaDe-Mobile.png)

### Inicio - Ipad
- [Pagina de inicio funcionando en Ipad](src/docs/SPA-Screen/Inicio-Ipad.png)

### Chat - Ipad
- [Chat funcionando en Ipad](src/docs/SPA-Screen/Chat-Ipad.png)

### Acerca de - Ipad
- [Acerca de funcionando en Ipad](src/docs/SPA-Screen/AcercaDe-Ipad.png)

### Inicio — escritorio
- [Página de inicio funcionando en escritorio](src/docs/SPA-Screen/Inicio-Desktop.png)

### Chat — escritorio
- [Chat funcionando en escritorio](src/docs/SPA-Screen/Chat-Desktop.png)

### Acerca de - escritorio
- [Acerca de funcionando en escritorio](src/docs/SPA-Screen/AcercaDe-Desktop.png)




## Registro del uso de IA

### PROMPT 1
- [Prompt](src/docs/Ia-Screen/Prompt1-estilos.png)

### PROMPT 2
- [Prompt](src/docs/Ia-Screen/Prompt2-problema.png)

## RESPUESTA
- [Respuesta](src/docs/Ia-Screen/Prompt2-solucion.png)

### PROMPT 3
- [Prompt 3](src/docs/Ia-Screen/Prompt3-problema.png)

## RESPUESTA
- [Respuesta](src/docs/Ia-Screen/Prompt3-solucion.png)

### PROMPT 4
- [Prompt](src/docs/Ia-Screen/Prompt4.png)

### PROMPT 5
- [Prompt](src/docs/Ia-Screen/Prompt5.png)

### PROMPT 6
- [Prompt](src/docs/Ia-Screen/Prompt6.png)

## RESPUESTA
- [Respuesta](src/docs/Ia-Screen/Prompt6-solucion.png)



## Enlaces
- **Aplicación desplegada:** [https://proyectom3.vercel.app/](https://proyectom3.vercel.app/)
- **Repositorio de GitHub:** [https://github.com/LeanCud/ProyectoM3_LeandroCudmani](https://github.com/LeanCud/ProyectoM3_LeandroCudmani)