declare module "*.json" {
  const value: any;
  export default value;
}

// Vite environment typings so `import.meta.env` is recognized
interface ImportMetaEnv {
  readonly APP_API_BASE_URL: string;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
