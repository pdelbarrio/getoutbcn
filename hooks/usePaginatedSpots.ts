import { useCallback, useEffect, useRef, useState } from "react";
import { Spot } from "../services/supabase/types";
import { PAGE_SIZE } from "../constants/Pagination";

type PageResult = { data: Spot[]; count: number | null };

export function usePaginatedSpots(
  key: string,
  fetchPage: (from: number, to: number) => Promise<PageResult>,
) {
  const [items, setItems] = useState<Spot[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(0);
  const lockRef = useRef(false);
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  const hasMore = count === null ? false : items.length < count;

  const loadFirst = useCallback(async (mode: "initial" | "refresh") => {
    lockRef.current = true;
    mode === "refresh" ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const { data, count: total } = await fetchPageRef.current(0, PAGE_SIZE - 1);
      setItems(data);
      setCount(total);
      pageRef.current = 0;
    } catch (error: any) {
      console.error("Error loading spots:", error);
      setError(error?.message || "Error loading spots");
    } finally {
      setLoading(false);
      setRefreshing(false);
      lockRef.current = false;
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (lockRef.current || loadingMore || !hasMore) return;
    lockRef.current = true;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;
    try {
      const from = nextPage * PAGE_SIZE;
      const { data } = await fetchPageRef.current(from, from + PAGE_SIZE - 1);
      setItems((prev) => prev.concat(data));
      pageRef.current = nextPage;
    } catch (error) {
      console.error("Error loading more spots:", error);
    } finally {
      setLoadingMore(false);
      lockRef.current = false;
    }
  }, [loadingMore, hasMore]);

  const refresh = useCallback(() => loadFirst("refresh"), [loadFirst]);

  useEffect(() => {
    setItems([]);
    setCount(null);
    pageRef.current = 0;
    loadFirst("initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, loadFirst]);

  return {
    items,
    count,
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}