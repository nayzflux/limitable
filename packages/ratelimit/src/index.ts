import type { Adapter } from "@/types/adapter";
import type { ClientOptions } from "@/types/client-options";
import type { Rule } from "@/types/rule";

export class Limitable<T extends { default: Rule } & Record<string, Rule>> {
  private appId: string;
  private rules: T;
  private adapter: Adapter;

  constructor(options: ClientOptions<T>) {
    this.appId = options.appId;
    this.rules = options.rules;
    this.adapter = options.adapter;
  }

  public async verify(
    identifier: string,
    rule?: string & keyof typeof this.rules & string
  ): Promise<{ isExceeded: boolean; remaining: number; resetAt: Date }> {
    // Get rule
    const r = this.rules[rule || "default"];

    // Rule options
    const maxRequest = r.maxRequest;
    const windowMs = r.windowMs;

    // Get unique key
    const key = [this.appId, identifier, rule].join(":");

    // Get count from adapter
    const data = await this.adapter.get(key);
    const split = data ? data.split(":") : ["0", "0"];

    // Get current request count and window expires at
    const count = parseInt(split?.[0] || "0");
    const expiresAt = parseInt(split?.[1] || "0");

    const newCount = count + 1;
    const remaining = maxRequest - newCount;

    // If count has expired
    if (Date.now() > expiresAt) {
      // Reset count
      const expiresAt = Date.now() + windowMs;
      await this.adapter.set(key, newCount + ":" + expiresAt);

      // Allow access
      return {
        isExceeded: false,
        remaining: maxRequest - 1,
        resetAt: new Date(expiresAt),
      };
    }

    // If request count reached the limit
    if (remaining < 0) {
      // Deny access
      return {
        isExceeded: true,
        remaining: 0,
        resetAt: new Date(expiresAt),
      };
    }

    // Increment request countexpiresAt
    await this.adapter.set(key, newCount + ":" + expiresAt);

    // Allow access
    return {
      isExceeded: false,
      remaining: remaining,
      resetAt: new Date(expiresAt),
    };
  }
}
