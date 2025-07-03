/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  // Lägg till andra VITE_ variabler här om du har fler
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
