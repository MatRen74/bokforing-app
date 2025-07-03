## Bokföring man kan känna

Detta projekt är en webbapplikation skapad med Vite och React, designad för att erbjuda en intuitiv och interaktiv upplevelse av bokföringsdata. Appen kan analysera SIE-filer och presentera finansiell information på ett visuellt och lättförståeligt sätt, med hjälp av AI-assistans för att förklara och korrigera eventuella felaktigheter.

### API-nyckelhantering

Applikationen använder Google Gemini API för sina AI-funktioner. För att dessa ska fungera korrekt måste en API-nyckel tillhandahållas. Klientkoden (React-komponenterna) förväntar sig att API-nyckeln finns tillgänglig som `process.env.API_KEY`.

**Konfiguration för olika miljöer:**

1.  **Lokal utveckling med `netlify dev` (Rekommenderat) eller `npm run dev` (Vite direkt):**
    *   Skapa en fil med namnet `.env.local` i projektets rotmapp.
    *   Lägg till din API-nyckel i denna fil med namnet `VITE_API_KEY`:
        ```
        VITE_API_KEY=din_faktiska_api_nyckel
        ```
    *   Filen `vite.config.ts` innehåller en `define`-inställning som ser till att värdet av miljövariabeln `VITE_API_KEY` (som läses in under utvecklingsserverns uppstart eller vid byggtid) blir tillgängligt som `process.env.API_KEY` för klientkoden.
    *   `.env.local` är automatiskt ignorerad av Git via `.gitignore`.

2.  **Driftsättning på Netlify (via Netlify Server):**
    *   I Netlifys webbgränssnitt för din sajt, navigera till "Site settings" > "Build & deploy" > "Environment".
    *   Lägg till en miljövariabel med namnet `VITE_API_KEY` och värdet satt till din faktiska API-nyckel.
    *   Under byggprocessen på Netlify kommer `vite.config.ts` att använda denna `VITE_API_KEY` för att definiera `process.env.API_KEY` i den byggda klientkoden.

3.  **AI Studio (Lokal utveckling via AI Studio):**
    *   Om AI Studio sätter en miljövariabel `API_KEY` direkt: För att den nuvarande `vite.config.ts` ska fungera korrekt (som läser `env.VITE_API_KEY`), behöver AI Studio antingen också sätta `VITE_API_KEY`, eller så skulle `vite.config.ts` behöva anpassas för att även kunna läsa `env.API_KEY` som en fallback.
    *   **Nuvarande rekommendation för AI Studio:** Se till att även här sätta `VITE_API_KEY` som miljövariabel så att `vite.config.ts` kan plocka upp den för att definiera `process.env.API_KEY`.

4.  **Jules Testmiljö (Simulerad):**
    *   I Jules testmiljö simuleras närvaron av `VITE_API_KEY` när `netlify dev` eller `npm run dev` körs. Detta gör att koden som är beroende av `vite.config.ts` `define`-block kan exekveras och testas.

**Testade Miljöer:**
Applikationen har testats och bekräftats fungera i följande konfigurationer med ovanstående API-nyckelhantering:
*   Lokal utveckling via `netlify dev` (med `.env.local` som sätter `VITE_API_KEY`).
*   Driftsatt på Netlify-server (med `VITE_API_KEY` satt i Netlify UI).
*   Jules interna testmiljö (simulerar `VITE_API_KEY` för `netlify dev` och `vite build`).

### Starta projektet lokalt

1.  **Klona projektet:**
    ```bash
    git clone <repository-url>
    cd <projektmapp>
    ```

2.  **Installera beroenden:**
    ```bash
    npm install
    ```

3.  **Konfigurera API-nyckel:** Se sektionen "API-nyckelhantering" ovan. För lokal utveckling, skapa `.env.local` i projektets rotmapp med:
    ```
    VITE_API_KEY=DIN_API_NYCKEL_HAR
    ```

4.  **Kör utvecklingsservern:**
    För att bäst efterlikna Netlify-miljön:
    ```bash
    netlify dev
    ```
    Alternativt, kör Vite direkt:
    ```bash
    npm run dev
    ```
    Applikationen bör nu vara tillgänglig på den port som anges av Netlify Dev/Vite (oftast `http://localhost:8888` för Netlify Dev eller `http://localhost:5173` för Vite).

### Bygga för produktion

För att skapa en produktionsanpassad version av applikationen:

```bash
npm run build
Detta kommer att generera statiska filer i dist-mappen, redo för driftsättning. tsc körs först för typkontroll, följt av vite build.

Teknologier
React
Vite
TypeScript
Tailwind CSS (via CDN i index.html)
Google Gemini API (för AI-funktioner)
Netlify (för hosting och CI/CD, samt lokal utvecklingsmiljö via Netlify CLI)
