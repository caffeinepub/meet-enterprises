import { useCallback, useState } from "react";
import { useInternetIdentity } from "./useInternetIdentity";

const PROFILE_KEY = "meet_enterprises_profile";

export type LocalProfile = {
  name: string;
  whatsapp: string;
};

export function useLocalProfile() {
  const [profile, setProfileState] = useState<LocalProfile | null>(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? (JSON.parse(raw) as LocalProfile) : null;
    } catch {
      return null;
    }
  });

  const setProfile = useCallback((p: LocalProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    setProfileState(p);
  }, []);

  const clearProfile = useCallback(() => {
    localStorage.removeItem(PROFILE_KEY);
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
