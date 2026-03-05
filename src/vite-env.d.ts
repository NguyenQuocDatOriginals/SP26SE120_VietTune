/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_VIETTUNE_AI_BASE_URL?: string;
  readonly VITE_VIETTUNE_AI_CHAT_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}