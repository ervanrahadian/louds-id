import { useCallback, useEffect, useMemo, useState } from "react";
import {
  arrayRemove,
  arrayUnion,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

import {
  OWNER_EMAIL,
  isAdminEmail,
  isOwnerEmail,
  isValidEmail,
  normalizeEmail,
} from "@/lib/admins";
import { db } from "@/lib/firebase";
import type { AppUser } from "@/lib/types";

const adminsRef = doc(db, "settings", "admins");

export function useAdmins(user: AppUser | null) {
  const [extraAdmins, setExtraAdmins] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      adminsRef,
      (snapshot) => {
        const data = snapshot.data();
        const emails = Array.isArray(data?.emails) ? data.emails : [];
        setExtraAdmins(
          emails
            .filter((value): value is string => typeof value === "string")
            .map(normalizeEmail)
            .filter((value) => value && value !== OWNER_EMAIL),
        );
      },
      () => {
        setExtraAdmins([]);
      },
    );

    return unsubscribe;
  }, []);

  const isOwner = isOwnerEmail(user?.email);
  const isAdmin = isAdminEmail(user?.email, extraAdmins);
  const admins = useMemo(
    () => [OWNER_EMAIL, ...extraAdmins.filter((email) => email !== OWNER_EMAIL)],
    [extraAdmins],
  );

  const addAdmin = useCallback(
    async (email: string) => {
      if (!isOwner) {
        throw new Error("Only the owner can add admins.");
      }

      const value = normalizeEmail(email);
      if (!isValidEmail(value)) {
        throw new Error("Enter a valid email address.");
      }
      if (value === OWNER_EMAIL || extraAdmins.includes(value)) {
        throw new Error("That email is already an admin.");
      }

      await setDoc(adminsRef, { emails: arrayUnion(value) }, { merge: true });
    },
    [extraAdmins, isOwner],
  );

  const removeAdmin = useCallback(
    async (email: string) => {
      if (!isOwner) {
        throw new Error("Only the owner can remove admins.");
      }

      const value = normalizeEmail(email);
      if (value === OWNER_EMAIL) {
        throw new Error("The owner cannot be removed.");
      }

      await setDoc(adminsRef, { emails: arrayRemove(value) }, { merge: true });
    },
    [isOwner],
  );

  return { isAdmin, isOwner, admins, extraAdmins, addAdmin, removeAdmin };
}
