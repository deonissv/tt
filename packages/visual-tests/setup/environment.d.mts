export interface VisualEnvironment {
  mode: string;
  baseURL: string;
  apiURL?: string;
  assetURL: string;
  projectName: string;
}

export function setupEnvironment(environment: VisualEnvironment): Promise<() => Promise<void>>;
export function restartApplication(): Promise<void>;
export function applicationStartedAt(): Promise<string>;
export function refreshAPIURL(fallback?: string): Promise<string | undefined>;
