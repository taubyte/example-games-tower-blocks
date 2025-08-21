export enum Env {
  DEV = 'development',
  PROD = 'production',
}

export function getEnv(): Env {
  // Use Vite's environment variable system
  return import.meta.env.MODE === 'development' ? Env.DEV : Env.PROD;
}
