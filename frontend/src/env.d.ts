/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly PROD: boolean;
  readonly MODE: string;
  // add more environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
