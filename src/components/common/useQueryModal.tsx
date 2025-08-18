import { useState, useCallback } from "react";
import { useQueryRowValidation } from "./useTextValidation";
import toast from "react-hot-toast";

interface QueryRow {
  id: number;
  searchTerm: string;
  operator: "AND" | "OR" | "AND NOT";
}

interface QueryHistoryItem {
  id: number;
  search_value: string;
  date: string;
}

export const useQueryModal = () => {
  // Modal states
  const [showBuildQueryModal, setShowBuildQueryModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  
  // Query building states
  const [queryRows, setQueryRows] = useState<QueryRow[]>([
    { id: 1, searchTerm: "", operator: "AND" }
  ]);
  const [builtQuery, setBuiltQuery] = useState<string>("");
  const [saveQuery, setSaveQuery] = useState<boolean>(false);
  
  // Date range filter states (for paper search only)
  const [dateRange, setDateRange] = useState<{
    startYear: string;
    endYear: string;
    enabled: boolean;
  }>({
    startYear: "",
    endYear: "",
    enabled: false,
  });
  
  // History states
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [hasMoreHistory, setHasMoreHistory] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  
  // Validation
  const validation = useQueryRowValidation();

  // Generate preview query
  const generatePreviewQuery = useCallback(() => {
    const filteredRows = queryRows.filter(
      (row) => row.searchTerm.trim() !== ""
    );
    if (filteredRows.length === 0) {
      return "";
    }

    let query = "";
    filteredRows.forEach((row, index) => {
      const term = `"${row.searchTerm.trim()}"`;
      if (index === 0) {
        query = term;
      } else {
        query += ` ${row.operator} ${term}`;
      }
    });

    return query;
  }, [queryRows]);

  // Load query from history
  const loadQueryFromHistory = useCallback((query: string) => {
    // Split by AND, OR, AND NOT (case-insensitive)
    const regex = /\s+(AND NOT|AND|OR)\s+/gi;
    const terms = query.split(regex).filter(Boolean);
    const newRows: QueryRow[] = [];
    let operator = "AND";
    let id = 1;
    
    // Clear any previous errors
    validation.clearAllErrors();
    validation.clearAllQueryRowErrors();
    
    for (let i = 0; i < terms.length; i++) {
      const term = terms[i].trim();
      if (["AND", "OR", "AND NOT"].includes(term.toUpperCase())) {
        operator = term.toUpperCase();
        continue;
      }
      // Remove quotes if present
      const cleanTerm = term.replace(/^"|"$/g, "");
      newRows.push({
        id: id++,
        searchTerm: cleanTerm,
        operator:
          newRows.length === 0 ? "AND" : (operator as "AND" | "OR" | "AND NOT"),
      });
    }
    
    if (newRows.length > 0) {
      setQueryRows(newRows);
      setShowBuildQueryModal(true);
      setShowHistoryModal(false);
    }
  }, []);

  // Reset query builder
  const resetQueryBuilder = useCallback(() => {
    setQueryRows([{ id: 1, searchTerm: "", operator: "AND" }]);
    setBuiltQuery("");
    setSaveQuery(false);
    setDateRange({
      startYear: "",
      endYear: "",
      enabled: false,
    });
  }, []);

  // Create query with validation
  const createQuery = useCallback((
    onSuccess: (query: string) => void
  ) => {
    // Validate all query rows first
    let hasErrors = false;
    queryRows.forEach(row => {
      if (row.searchTerm.trim()) {
        const error = validation.validateQueryRow(row.id, row.searchTerm);
        if (error) hasErrors = true;
      }
    });

    if (hasErrors) {
      return; // Don't proceed if there are validation errors
    }

    const query = generatePreviewQuery();
    if (query === "") {
      toast.error("Please add at least one search term");
      return;
    }

    // Clear all errors before setting built query and closing modal
    validation.clearAllErrors();
    validation.clearAllQueryRowErrors();

    setBuiltQuery(query);
    setShowBuildQueryModal(false);
    toast.success("Query built successfully!");
    onSuccess(query);
  }, [queryRows, validation, generatePreviewQuery]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback((
    e: React.UIEvent<HTMLDivElement>,
    loadMoreHistory: () => void
  ) => {
    const target = e.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    
    // Check if user scrolled to within 50px of the bottom
    const isNearBottom = scrollHeight - scrollTop <= clientHeight + 50;
    
    if (isNearBottom && hasMoreHistory && !loadingMore) {
      loadMoreHistory();
    }
  }, [hasMoreHistory, loadingMore]);

  return {
    // Modal states
    showBuildQueryModal,
    setShowBuildQueryModal,
    showHistoryModal,
    setShowHistoryModal,
    
    // Query building
    queryRows,
    setQueryRows,
    builtQuery,
    setBuiltQuery,
    saveQuery,
    setSaveQuery,
    generatePreviewQuery,
    resetQueryBuilder,
    createQuery,
    
    // Date range filter
    dateRange,
    setDateRange,
    
    // History
    queryHistory,
    setQueryHistory,
    historyLoading,
    setHistoryLoading,
    historyPage,
    setHistoryPage,
    hasMoreHistory,
    setHasMoreHistory,
    loadingMore,
    setLoadingMore,
    loadQueryFromHistory,
    handleScroll,
    
    // Validation
    validation
  };
};

export type UseQueryModalReturn = ReturnType<typeof useQueryModal>;
