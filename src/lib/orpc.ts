import type { RouterClient } from "@orpc/server";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { router } from "@/server/orpc/router";

const link = new RPCLink({
  url: `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/rpc`,
  fetch: (url, options) =>
    fetch(url, {
      ...options,
      credentials: "include",
    }),
  headers: async () => {
    if (typeof window !== "undefined") {
      return {};
    }

    const { headers } = await import("next/headers");
    const h = await headers();
    return Object.fromEntries(h.entries());
  },
});

export const client: RouterClient<typeof router> =
  (globalThis as unknown as { $client?: RouterClient<typeof router> }).$client ??
  createORPCClient(link);
