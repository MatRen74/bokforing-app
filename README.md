## Bokföring man kan känna

Detta projekt är en webbapplikation skapad med Vite och React, designad för att erbjuda en intuitiv och interaktiv upplevelse av bokföringsdata. Appen kan analysera SIE-filer och presentera finansiell information på ett visuellt och lättförståeligt sätt, med hjälp av AI-assistans för att förklara och korrigera eventuella felaktigheter.

### API-nyckelhantering

Applikationen använder Google Gemini API och är designad för att fungera i flera olika miljöer. För att säkerställa detta är API-nyckelhanteringen standardiserad: **koden i komponenterna använder alltid `process.env.API_KEY` för att hämta nyckeln.**

**Konfiguration för olika miljöer:**

1.  **Vite-baserade miljöer (Netlify, `npm run dev`):**
    *   Dessa miljöer använder Vite som byggverktyg. Konfigurera en miljövariabel med namnet `VITE_API_KEY`.
    *   **Lokalt:** Skapa en `.env.local`-fil i projektets rotmapp med innehållet `VITE_API_KEY=din_nyckel_här`.
    *   **På Netlify:** I sajtens inställningar, lägg till en miljövariabel `VITE_API_KEY` med din nyckel.
    *   **Hur det fungerar:** Filen `vite.config.ts` fungerar som en "adapter". Under byggprocessen tar den värdet från `VITE_API_KEY` och gör det tillgängligt för applikationen som `process.env.API_KEY`.

2.  **Standard Node.js-miljöer (AI Studio, Cloud Run):**
    *   Dessa miljöer förväntar sig en miljövariabel med namnet `API_KEY`.
    *   Applikationen läser `process.env.API_KEY` direkt, utan behov av någon adapter.

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
    Applikationen bör nu vara tillgänglig på den port som anges av Netlify Dev/Vite (oftast `http://localhost:8888` eller `http://localhost:5173`).

### Bygga för produktion

För att skapa en produktionsanpassad version av applikationen:

```bash
npm run build