import { useCallback, useState } from "react";
import { useInternetIdentity } from "./useInternetIdentity";

const PROFILE_KEY = "meet_enterprises_profile";

export type LocalProfile = {
  name: string;
  whatsapp: string;
};

function profileKey(name: string, whatsapp: string) {
  return `${PROFILE_KEY}_${name.trim().toLowerCase()}_${whatsapp.trim()}`;
}

export function useLocalProfile() {
  // Read the active profile from localStorage.
  // We store a pointer key so we know which profile is currently active.
  const [profile, setProfileState] = useState<LocalProfile | null>(() => {
    try {
      // Try legacy single-key first for backward compat
      const activeKey = localStorage.getItem(`${PROFILE_KEY}_active`);
      if (activeKey) {
        const raw = localStorage.getItem(activeKey);
        return raw ? (JSON.parse(raw) as LocalProfile) : null;
      }
      // Fall back to old single-key profile
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LocalProfile;
        // Migrate to new keyed format
        const key = profileKey(parsed.name, parsed.whatsapp);
        localStorage.setItem(key, JSON.stringify(parsed));
        localStorage.setItem(`${PROFILE_KEY}_active`, key);
        localStorage.removeItem(PROFILE_KEY);
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const setProfile = useCallback((p: LocalProfile) => {
    const key = profileKey(p.name, p.whatsapp);
    localStorage.setItem(key, JSON.stringify(p));
    localStorage.setItem(`${PROFILE_KEY}_active`, key);
    setProfileState(p);
  }, []);

  const clearProfile = useCallback(() => {
    const activeKey = localStorage.getItem(`${PROFILE_KEY}_active`);
    if (activeKey) {
      localStorage.removeItem(activeKey);
      localStorage.removeItem(`${PROFILE_KEY}_active`);
    }
    setProfileState(null);
  }, []);

  return { profile, setProfile, clearProfile };
}

export function useInternetIdentityWithProfile() {
  const ii = useInternetIdentity();
  const { profile, setProfile, clearProfile } = useLocalProfile();

  const clear = useCallback(() => {
    clearProfile();
    ii.clear();
  }, [clearProfile, ii]);

  return {
    ...ii,
    profile,
    setProfile,
    clear,
  };
}
