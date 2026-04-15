import { client } from "@/lib/orpc";

export async function getStatusTimelineV2Data(): Promise<any> {
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
