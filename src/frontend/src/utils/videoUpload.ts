import { HttpAgent } from "@icp-sdk/core/agent";
import { loadConfig } from "../config";
import { StorageClient } from "./StorageClient";

export async function uploadVideoToStorage(
  videoBytes: Uint8Array,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch(() => {});
  }
  const storageClient = new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );
  const { hash } = await storageClient.putFile(videoBytes, onProgress);
  return storageClient.getDirectURL(hash);
}
