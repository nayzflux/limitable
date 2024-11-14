import type { Adapter } from "@/types/adapter";
import { createClient, type RedisClientOptions } from "redis";

export class RedisAdapter implements Adapter {
  private redisClient;

  constructor(options: RedisClientOptions) {
    this.redisClient = createClient(options);
    this.redisClient.connect();
  }

  public async set(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }

  public async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }
}
