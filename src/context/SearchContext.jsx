import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useTasks } from "./TaskContext";

const SearchContext = createContext({
  query: "",
  results: [],
  setQuery: () => {},
  clear: () => {},
});

export const SearchProvider = ({ children }) => {
  const { tasks, setFilters } = useTasks();
  const [query, setQueryState] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = tasks
      .filter((t) => (t.title || "").toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q))
      .slice(0, 10);
    setResults(filtered);
  }, [query, tasks]);

  const setQuery = useCallback(
    (val) => {
      setQueryState(val);
      setFilters({ search: val });
    },
    [setFilters]
  );

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    setFilters({ search: "" });
  }, [setFilters]);

  const value = useMemo(
    () => ({
      query,
      results,
      setQuery,
      clear,
    }),
    [query, results, setQuery, clear]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export const useSearch = () => useContext(SearchContext);
