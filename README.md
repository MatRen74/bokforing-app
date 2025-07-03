# Bokföring man kan känna

Välkommen till "Bokföring man kan känna"! Detta projekt är en webbapplikation skapad med Vite och React, designad för att erbjuda en intuitiv och interaktiv upplevelse av din bokföringsdata. Genom att ladda upp en SIE-fil kan appen visualisera din finansiella information på ett lättförståeligt sätt och använda AI-driven assistans för att hjälpa dig förstå och potentiellt korrigera felaktigheter i din bokföring.

## Komma igång (för utvecklare)

Den här guiden hjälper dig att sätta upp och köra projektet lokalt på din dator.

### Förutsättningar

*   **Node.js:** Se till att du har Node.js installerat. Du kan ladda ner det från [nodejs.org](https://nodejs.org/). Vi rekommenderar den senaste LTS-versionen. Node.js inkluderar npm (Node Package Manager) som används för att hantera projektets beroenden.
*   **Git:** Projektet versionshanteras med Git. Om du inte har det, ladda ner det från [git-scm.com](https://git-scm.com/).
*   **Texteditor/IDE:** En bra kodredigerare som [Visual Studio Code](https://code.visualstudio.com/) (rekommenderas), WebStorm, eller liknande.
*   **(Valfritt men Rekommenderat) Netlify CLI:** För att på bästa sätt efterlikna Netlifys driftsmiljö lokalt. Installeras via npm: `npm install -g netlify-cli`.

### 1. Klona projektet

Öppna din terminal (kommandotolken, PowerShell, Terminal på macOS/Linux) och kör följande kommandon:

```bash
git clone https://github.com/MatRen74/bokforing-app.git
cd bokforing-app
Byt ut https://github.com/MatRen74/bokforing-app.git mot URL:en till ditt repository om du har en egen fork.

2. Installera beroenden
När du är i projektmappen (bokforing-app), kör följande kommando för att ladda ner och installera alla nödvändiga paket som projektet är beroende av (dessa specificeras i package.json och package-lock.json):

npm install
Detta kan ta en liten stund.

3. Konfigurera API-nyckel för AI-funktioner
Applikationen använder Google Gemini API för sina AI-drivna analys- och chattfunktioner. För att dessa ska fungera måste du tillhandahålla en API-nyckel.

Så här fungerar API-nyckelhanteringen:

Internt i React-komponenterna (t.ex. AiChatAssistant.tsx, AiErrorAssistant.tsx) förväntar sig koden att API-nyckeln finns tillgänglig som en variabel vid namn process.env.API_KEY.
Eftersom process.env inte är direkt tillgängligt i klientkod som körs i webbläsaren på samma sätt som i Node.js, använder projektet en mekanism i Vite (vite.config.ts) för att göra nyckeln tillgänglig.
Konfiguration för din lokala utvecklingsmiljö:

Skapa en .env.local-fil: I projektets rotmapp (samma mapp som package.json), skapa en ny fil och döp den till .env.local.
Lägg till din API-nyckel: Öppna .env.local och lägg till din Google Gemini API-nyckel med variabelnamnet VITE_API_KEY:
VITE_API_KEY=DIN_FAKTISKA_API_NYCKEL_HAR
Ersätt DIN_FAKTISKA_API_NYCKEL_HAR med din riktiga nyckel.
Hur det fungerar lokalt:
När du startar utvecklingsservern (med netlify dev eller npm run dev), läser Vite in variabler från .env.local.
Filen vite.config.ts innehåller en inställning (define: { 'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY) }) som tar värdet från VITE_API_KEY och vid "byggtid" (eller när utvecklingsservern kompilerar koden i minnet) ersätter alla förekomster av process.env.API_KEY i din klientkod med det faktiska nyckelvärdet.
Viktigt: Filen .env.local är redan inkluderad i .gitignore, så din API-nyckel kommer inte av misstag att checkas in i Git-repositoryt.
4. Kör utvecklingsservern
Nu är du redo att starta applikationen!

För att bäst efterlikna Netlify-miljön (rekommenderat):

netlify dev
Detta kommando använder Netlify CLI, läser netlify.toml och hanterar miljövariabler (inklusive de från .env.local) på ett sätt som liknar hur det fungerar när appen är driftsatt på Netlify.

Alternativt, kör Vite direkt:

npm run dev
Detta startar Vites inbyggda utvecklingsserver.

Oavsett vilket kommando du använder, bör du se ett meddelande i terminalen som talar om vilken adress applikationen nu är tillgänglig på. Oftast är det:

http://localhost:8888 (för netlify dev)
http://localhost:5173 (för npm run dev)
Öppna denna adress i din webbläsare för att se applikationen.

API-nyckelkonfiguration för andra miljöer
Driftsättning på Netlify (Server):

I Netlifys webbgränssnitt för din sajt: Navigera till "Site settings" (eller "Site configuration") > "Build & deploy" > "Environment" > "Environment variables".
Klicka på "Edit variables" och lägg till en miljövariabel:
Key: VITE_API_KEY
Value: Din faktiska Google Gemini API-nyckel.
Se till att variabelns "Scope" är satt så att den är tillgänglig för de builds/grenar du vill (t.ex. "All deploys").
När Netlify bygger din sajt kommer vite.config.ts att använda denna VITE_API_KEY för att definiera process.env.API_KEY i den byggda klientkoden.
AI Studio (eller liknande Node.js-baserade miljöer):

Denna applikation är primärt en klient-sidans applikation (SPA). Om AI Studio eller en liknande miljö ska köra den, skulle den typiskt sett antingen servera de statiska filerna som produceras av npm run build, eller köra utvecklingsservern via npm run dev (vilket kräver Node.js).
Om miljön kan sätta miljövariabler som är tillgängliga för Node.js-processen som kör Vite (antingen dev-servern eller byggprocessen), då ska VITE_API_KEY sättas. vite.config.ts kommer då att hantera exponeringen till klientkoden som process.env.API_KEY.
Om AI Studio har en specifik metod för att injicera hemligheter direkt i klientkoden som process.env.API_KEY utan Vite's define-mekanism, skulle det kräva en annan konfiguration än den nuvarande.
Nuvarande rekommendation: Förutsätt att miljön tillåter VITE_API_KEY att sättas för bygg-/utvecklingsprocessen.
Testade Miljöer
Applikationens API-nyckelhantering och grundläggande funktionalitet har testats och bekräftats fungera i följande konfigurationer:

Lokal utveckling via netlify dev (med .env.local som sätter VITE_API_KEY).
Driftsatt på Netlify-server (med VITE_API_KEY satt i Netlify UI).
Jules (AI-assistentens) interna testmiljö (simulerar VITE_API_KEY för netlify dev och vite build, och verifierar att process.env.API_KEY blir tillgänglig för klientkoden tack vare vite.config.ts).
Bygga för produktion
För att skapa en produktionsanpassad version av applikationen som kan driftsättas på en statisk webbserver:

npm run build
Detta kommando gör två saker (enligt scripts i package.json):

tsc: Kör TypeScript-kompilatorn för att kontrollera typer i hela projektet (enligt tsconfig.json).
vite build: Om typkontrollen lyckas, paketerar Vite applikationen för produktion. Optimerade, statiska filer genereras i dist-mappen.
Innehållet i dist-mappen är det som sedan driftsätts.

Teknologier
React: Bibliotek för att bygga användargränssnitt.
Vite: Modernt frontend-verktyg som sköter utvecklingsserver och byggprocess.
TypeScript: Ett superset av JavaScript som lägger till statisk typning.
Tailwind CSS: Används för styling (via CDN i index.html för enkelhetens skull i detta projekt).
Google Gemini API: Används för AI-funktioner som felanalys och chattassistans.
Netlify: Plattform för hosting, CI/CD (Continuous Integration/Continuous Deployment) och Netlify CLI för lokal utveckling.