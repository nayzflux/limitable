import type { Adapter } from "@/types/adapter";

export class MemoryAdapter implements Adapter {
  private store: Record<
    string,
    {
      count: number;
      expiresAt: number;
    }
  > = {};

  constructor() {}

  public async set(
    key: string,
    value: {
      count: number;
      expiresAt: number;
    }
  ): Promise<void> {
    this.store[key] = value;
  }

  public async get(key: string): Promise<{
    count: number;
    expiresAt: number;
  } | null> {
    return this.store[key];
  }
}
