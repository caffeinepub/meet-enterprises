import { l as loadConfig, H as HttpAgent, S as StorageClient } from "./index-B_IdsXSe.js";
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
