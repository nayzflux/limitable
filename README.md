# Limitable

Limitable is a simple fast and framework agnostic rate limiting library that let you create customizable rules for your API rate limiting.

# Goals

- easy to use rate limiting
- fast and performant
- customizable rule
- framework agnostic

# Getting Started

## Install Limitable package

Using Bun

```bash
bun add @limitable/ratelimit
```

Or using NPM

```bash
npm install @limitable/ratelimit
```

## Create Limitable client

```ts
const limitable = new Limitable({
  appId: "<your app ID>",
});
```

## Configure Store Adapter

### Redis Store

```ts
const redisAdapter = new RedisAdapter({
  url: "<redis url>",
});

const limitable = new Limitable({
  appId: "<your app ID>",
  adapter: redisAdapter,
});
```

## Create rate limit rule

```ts
const redisAdapter = new RedisAdapter({
  url: "<redis url>",
});

const limitable = new Limitable({
  appId: "<your app ID>",
  adapter: redisAdapter,
  rules: {
    // Default rule
    default: {
      maxRequest: 200, // 200 requests
      windowMs: 10 * 60 * 1000, // per 10 minutes
    },

    // Custom rule
    custom: {
      maxRequest: 20, // 20 requests
      windowMs: 10 * 60 * 1000, // per 10 minutes
    },
  },
});
```

## Check rate limiting on request

Check if a user has exceeded is rate limit

```ts
const { isExceeded, remaining, resetAt } = await limitable.verify(
  "<user identifier>",
  "<rule_name>"
);
```

## Examples

### Hono

```ts
app.post("/rate-limited", async (c) => {
  const info = getConnInfo(c);

  const { isExceeded, remaining, resetAt } = await limitable.verify(
    info.remote.address,
    "custom"
  );

  if (!isExceeded) return c.text("Rate limit exceeded!", 429);

  return c.text("Allowed!");
});
```
