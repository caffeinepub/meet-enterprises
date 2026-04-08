import type { HttpAgent } from "@icp-sdk/core/agent";

/**
 * Minimal StorageClient stub — matches the interface used by videoUpload.ts.
 * The real implementation is in @caffeineai/object-storage which is loaded
 * transitively via @caffeineai/core-infrastructure at runtime.
 */
export class StorageClient {
  constructor(
    private readonly bucket: string,
    private readonly storageGatewayUrl: string,
    private readonly backendCanisterId: string,
    private readonly projectId: string,
    private readonly agent: HttpAgent,
  ) {}

  async putFile(
    _blobBytes: Uint8Array,
    _onProgress?: (percentage: number) => void,
  ): Promise<{ hash: string }> {
    throw new Error(
      "StorageClient.putFile: @caffeineai/object-storage not available in this environment",
    );
  }

  async getDirectURL(_hash: string): Promise<string> {
    throw new Error(
      "StorageClient.getDirectURL: @caffeineai/object-storage not available in this environment",
    );
  }
}
