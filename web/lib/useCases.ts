"use client";

import { useCallback, useEffect, useState } from "react";
import { friendlyError, listCases } from "./contract";
import type { CaseSummary } from "./genlayer";

export function useCases() {
  const [cases, setCases] = useState<CaseSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const data = await listCases();
      setCases([...data].sort((a, b) => b.id - a.id)); // newest first
    } catch (e) {
      setError(friendlyError(e));
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { cases, error, reload };
}
