import { publicProcedure } from "./types";
import { getAllProposals } from "@/server/data/allProposals";
import { getStatusTimelineV2 } from "@/server/data/statusTimelineV2";

export const homeProcedures = {
  getAllProposals: publicProcedure.handler(async () => {
    return getAllProposals();
  }),
  getStatusTimelineV2: publicProcedure.handler(async () => {
    return getStatusTimelineV2();
  }),
};
