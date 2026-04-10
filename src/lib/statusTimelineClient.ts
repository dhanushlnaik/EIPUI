import { client } from "@/lib/orpc";
import type { StatusTimelineV2Response } from "@/server/data/statusTimelineV2";

export async function getStatusTimelineV2Data(): Promise<StatusTimelineV2Response> {
  try {
    return await client.home.getStatusTimelineV2();
  } catch (rpcError) {
    console.warn("oRPC getStatusTimelineV2 failed, using REST fallback:", rpcError);
    const response = await fetch("/api/new/graphsv2");
    if (!response.ok) {
      throw new Error(`Fallback graphsv2 request failed: ${response.status}`);
    }
    return response.json();
  }
}
