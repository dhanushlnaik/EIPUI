import { os } from "@orpc/server";
import { router } from "./router";

export const orpc = os.router(router);
export type ORPC = typeof orpc;
