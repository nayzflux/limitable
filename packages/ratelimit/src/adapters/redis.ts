import type { Adapter } from "@/types/adapter";
import { createClient, type RedisClientOptions } from "redis";

export class RedisAdapter implements Adapter {
  private redisClient;

  constructor(options: RedisClientOptions) {
    this.redisClient = createClient(options);
    this.redisClient.connect();
  }

  public async set(
    key: string,
    value: {
      count: number;
      expiresAt: number;
    }
  ): Promise<void> {
    await this.redisClient.set(key, JSON.stringify(value));
  }

  public async get(key: string): Promise<{
    count: number;
    expiresAt: number;
  } | null> {
    const value = await this.redisClient.get(key);
    if (!value) return null;
    const json = JSON.parse(value) satisfies {
      count: number;
      expiresAt: number;
    };
    return json;
  }
}
