# Meet Enterprises

## Current State
The admin panel category creation button fails silently. The actor initialization in `useActor.ts` skips `_initializeAccessControlWithSecret` for anonymous users (Version 18 fix), but Caffeine's MixinStorage mixin may still require initialization for update calls. Additionally, admin mutations use `actor!` without null guards.

## Requested Changes (Diff)

### Add
- Try-catch around `_initializeAccessControlWithSecret` for anonymous actors so init is always attempted
- Null guard + descriptive error in all admin mutation functions
- Actual error message displayed in admin toasts (not generic "Failed to create category")
- sessionStorage-backed admin token for robustness

### Modify
- `useActor.ts`: for anonymous path, attempt `_initializeAccessControlWithSecret` with caffeineToken if present, or with empty string wrapped in try-catch
- `useQueries.ts`: all admin mutations guard against null actor and empty token
- `adminStore.ts`: persist token in sessionStorage so it survives any edge cases
- `AdminPage.tsx`: show real error messages in toasts

### Remove
- Silent error swallowing in category/product/scheme admin actions

## Implementation Plan
1. Update `adminStore.ts` to use sessionStorage for persistence
2. Update `useActor.ts` to always attempt init with try-catch
3. Update admin mutations in `useQueries.ts` to add null/empty guards
4. Update `AdminPage.tsx` toast error messages to show actual error
