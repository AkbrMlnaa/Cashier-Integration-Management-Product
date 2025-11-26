import { useState, useEffect } from "react";
import { api } from "../services/api";

let cachedProfile = null;

export default function useAuthCheck() {
  const [authenticated, setAuthenticated] = useState(!!cachedProfile);
  const [profile, setProfile] = useState(cachedProfile);

  useEffect(() => {
    if (cachedProfile) return; 

    let mounted = true;

    api.get("/v1/profile", { withCredentials: true })
      .then(res => {
        if (mounted) {
          cachedProfile = res.data;
          setAuthenticated(true);
          setProfile(res.data);
        }
      })
      .catch(() => {
        if (mounted) {
          setAuthenticated(false);
          setProfile(null);
        }
      });

    return () => { mounted = false; };
  }, []);

  return { authenticated, profile, role: profile?.role };
}
