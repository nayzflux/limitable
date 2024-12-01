import { MemoryAdapter } from "@/adapters/memory";
import { RedisAdapter } from "@/adapters/redis";
import type { Adapter } from "@/types/adapter";
import type { ClientOptions } from "@/types/client-options";
import type { Rule } from "@/types/rule";
import { encode } from "@/utils/encoding";

export class Limitable<T extends { default: Rule } & Record<string, Rule>> {
  private appId: string;
  private rules: T;
  private adapter: Adapter;

  constructor(options: ClientOptions<T>) {
    this.appId = options.appId;
    this.rules = options.rules;
    this.adapter = options.adapter;
  }

  /**
   *
   * @param identifier The unique identifier of the user (e.g. user id, ip address)
   * @param rule The rule name to be used for rate limiting (e.g. default, custom)
   */
  public async verify(
    identifier: string,
    rule?: string & keyof typeof this.rules
  ): Promise<{
    isExceeded: boolean;
    remaining: number;
    limit: number;
    resetAt: Date;
    resetIn: number;
  }> {
    // Get rule
    const r = this.rules[rule || "default"];

    // Rule options
    const maxRequest = r.maxRequest;
    const windowMs = r.windowMs;

    // Get unique key encoding to base64
    const key = [
      encode(this.appId),
      encode(identifier),
      encode(rule || "default"),
    ].join(":");

    // Get count from adapter
    const data = await this.adapter.get(key);

    // Get current request count and window expires at
    const count = data?.count || 0;
    const expiresAt = data?.expiresAt || 0;

    const newCount = count + 1;
    const remaining = maxRequest - newCount;

    // If count has expired
    if (Date.now() > expiresAt) {
      // Reset count
      const expiresAt = Date.now() + windowMs;

      // Set new count and expiresAt
      await this.adapter.set(key, {
        count: newCount,
        expiresAt: expiresAt,
      });

      // Allow access
      return {
        isExceeded: false,
        remaining: maxRequest - 1,
        limit: maxRequest,
        resetAt: new Date(expiresAt),
        resetIn: Math.ceil((expiresAt - Date.now()) / 1000),
      };
    }

    // If request count reached the limit
    if (remaining < 0) {
      // Deny access
      return {
        isExceeded: true,
        remaining: 0,
        limit: maxRequest,
        resetAt: new Date(expiresAt),
        resetIn: Math.ceil((expiresAt - Date.now()) / 1000),
      };
    }

    // Increment request count and expiresAt
    await this.adapter.set(key, {
      count: newCount,
      expiresAt: expiresAt,
    });

    // Allow access
    return {
      isExceeded: false,
      remaining: remaining,
      limit: maxRequest,
      resetAt: new Date(expiresAt),
      resetIn: Math.ceil((expiresAt - Date.now()) / 1000),
    };
  }
}

export { MemoryAdapter, RedisAdapter };
