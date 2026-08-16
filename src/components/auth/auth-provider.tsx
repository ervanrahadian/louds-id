import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";

import { AuthContext } from "@/hooks/auth-context";
import { auth, googleProvider } from "@/lib/firebase";
import type { AppUser } from "@/lib/types";

function mapUser(user: User): AppUser {
  return {
    uid: user.uid,
    photo: user.photoURL,
    email: user.email,
    displayName: user.displayName?.trim() || user.email?.split("@")[0] || "Guest",
  };
}

function authErrorMessage(error: unknown): string {
  if (typeof error === "object" && error && "code" in error) {
    const code = String((error as { code: string }).code);
    if (
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request"
    ) {
      return "";
    }
    if (code === "auth/popup-blocked") {
      return "The sign-in popup was blocked. Allow popups and try again.";
    }
    if (code === "auth/network-request-failed") {
      return "Network error. Check your connection and try again.";
    }
  }
  return "Could not sign in. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser ? mapUser(authUser) : null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const message = authErrorMessage(err);
      if (message) {
        setError(message);
      }
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setError(null);
    await signOut(auth);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({ user, loading, error, signIn, signOutUser, clearError }),
    [user, loading, error, signIn, signOutUser, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
