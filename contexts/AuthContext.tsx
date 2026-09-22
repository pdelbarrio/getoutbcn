import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { profilesService } from "../services/supabase/profiles";
import { Profile } from "../services/supabase/types";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  profile: null,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile() {
    const currentUser = session?.user;
    if (!currentUser) {
      setProfile(null);
      return;
    }
    try {
      const data = await profilesService.getById(currentUser.id);
      setProfile(data);
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  }

  useEffect(() => {
    if (session?.user) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [session]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log(
        "🔄 Sesión inicial cargada:",
        session ? "✅ usuario logado" : "❌ sin sesión",
      );
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Evento de auth:", event);
      console.log("🔄 Sesión:", session ? "usuario presente" : "sin usuario");
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
