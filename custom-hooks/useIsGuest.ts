"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/store";
import { getUserId } from "@/utils/getUserId";

/**
 * Guest flag from cookies is only available on the client after hydration.
 * Returns false until mounted so SSR and the first client render match.
 */
export function useIsGuest(): boolean {
  const isGuest = useAppSelector((state) => state.authReducer.isGuest);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted && isGuest;
}

/** Signed-in user (not guest). False for guests and before hydration when there is no userId. */
export function useCanInteractAsUser(): boolean {
  const isGuest = useIsGuest();
  const userId = getUserId();
  return !isGuest && Boolean(userId);
}
