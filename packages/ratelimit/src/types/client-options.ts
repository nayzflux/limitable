import type { Adapter } from "@/types/adapter";

export type ClientOptions<T> = {
  appId: string;
  adapter: Adapter;
  rules: T;
};
