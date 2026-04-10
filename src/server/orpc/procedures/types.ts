import { os } from "@orpc/server";

export type Ctx = {
  headers: Record<string, string>;
};

export const publicProcedure = os.$context<Ctx>();
