import { l as loadConfig, H as HttpAgent } from "./index-BVUJ6gB9.js";
class StorageClient {
  constructor(bucket, storageGatewayUrl, backendCanisterId, projectId, agent) {
    this.bucket = bucket;
    this.storageGatewayUrl = storageGatewayUrl;
    this.backendCanisterId = backendCanisterId;
    this.projectId = projectId;
    this.agent = agent;
  }
  async putFile(_blobBytes, _onProgress) {
    throw new Error(
      "StorageClient.putFile: @caffeineai/object-storage not available in this environment"
    );
  }
  async getDirectURL(_hash) {
    throw new Error(
      "StorageClient.getDirectURL: @caffeineai/object-storage not available in this environment"
    );
  }
}
async function uploadVideoToStorage(videoBytes, onProgress) {
  var _a;
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  if ((_a = config.backend_host) == null ? void 0 : _a.includes("localhost")) {
    await agent.fetchRootKey().catch(() => {
    });
  }
  const storageClient = new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent
  );
  const { hash } = await storageClient.putFile(videoBytes, onProgress);
  return storageClient.getDirectURL(hash);
}
export {
  uploadVideoToStorage
};
