import { useSearchParams } from "react-router-dom";

export function useFilterParams<T extends Record<string, string>>(defaults: T) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = { ...defaults } as T;
  for (const key in defaults) {
    const value = searchParams.get(key);
    if (value !== null) filters[key] = value as T[typeof key];
  }
  const page = Number(searchParams.get("page") || "1");

  const setFilters = (partial: Partial<T>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(partial).forEach(([k, v]) => {
      if (v) next.set(k, v as string);
      else next.delete(k);
    });
    next.set("page", "1");
    setSearchParams(next);
  };

  const setPage = (page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
  };

  return { filters, page, setFilters, setPage };
}
