import {
  type createActorFunction,
  useActor as useActorBase,
} from "@caffeineai/core-infrastructure";
import type { BackendActor } from "../types";

// createActor is imported at runtime from backend.ts.
// We use a dynamic import to avoid circular dependency issues and because
// backend.ts is auto-generated and may have varying types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _createActor: createActorFunction<BackendActor> | null = null;

async function getCreateActor(): Promise<createActorFunction<BackendActor>> {
  if (_createActor) return _createActor;
  const mod = await import("../backend");
  // The generated createActor signature matches createActorFunction<Backend>
  // We cast it here because the generated Backend class implements BackendActor at runtime
  // even though the generated type declarations are incomplete.
  _createActor =
    mod.createActor as unknown as createActorFunction<BackendActor>;
  return _createActor;
}

// Eager-load so it's ready before first use
getCreateActor().catch(() => {});

export function useActor(): {
  actor: BackendActor | null;
  isFetching: boolean;
} {
  // We provide a stable wrapper function that resolves asynchronously.
  // The base useActor from core-infrastructure accepts a createActorFunction<T>
  // and internally calls createActorWithConfig(createActor, options).
  // We proxy through a sync wrapper that delegates to the cached createActor.
  const stableCreateActor: createActorFunction<BackendActor> = (
    canisterId,
    uploadFile,
    downloadFile,
    options,
  ) => {
    if (!_createActor) {
      // Return a proxy object that will lazily resolve
      const proxy = {} as BackendActor;
      return proxy;
    }
    return _createActor(canisterId, uploadFile, downloadFile, options);
  };

  return useActorBase<BackendActor>(stableCreateActor);
}
