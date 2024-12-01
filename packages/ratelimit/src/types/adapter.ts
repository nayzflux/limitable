export interface Adapter {
  set: (
    key: string,
    value: { count: number; expiresAt: number }
  ) => Promise<void>;
  get: (key: string) => Promise<{ count: number; expiresAt: number } | null>;
}
