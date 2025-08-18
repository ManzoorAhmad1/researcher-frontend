import React from "react";
import { IoClose, IoAdd, IoRemove } from "react-icons/io5";
import { MdHistory } from "react-icons/md";
import { ValidatedQueryInput } from "./ValidatedInput";
import { useQueryRowValidation } from "./useTextValidation";
import { Select } from "rizzui";
import toast from "react-hot-toast";

interface QueryRow {
  id: number;
  searchTerm: string;
  operator: "AND" | "OR" | "AND NOT";
}

interface BuildQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHistory: () => void;
  queryRows: QueryRow[];
  setQueryRows: React.Dispatch<React.SetStateAction<QueryRow[]>>;
  saveQuery: boolean;
  setSaveQuery: React.Dispatch<React.SetStateAction<boolean>>;
  onCreateQuery: () => void;
  onReset: () => void;
  generatePreviewQuery: () => string;
  validation: ReturnType<typeof useQueryRowValidation>;
  // Date range props (optional - only for paper search)
  dateRange?: {
    startYear: string;
    endYear: string;
    enabled: boolean;
  };
  setDateRange?: React.Dispatch<React.SetStateAction<{
    startYear: string;
    endYear: string;
    enabled: boolean;
  }>>;
  showDateFilter?: boolean; // Flag to show/hide date filter
}

const BuildQueryModal: React.FC<BuildQueryModalProps> = ({
  isOpen,
  onClose,
  onOpenHistory,
  queryRows,
  setQueryRows,
  saveQuery,
  setSaveQuery,
  onCreateQuery,
  onReset,
  generatePreviewQuery,
  validation,
  dateRange,
  setDateRange,
  showDateFilter = false,
}) => {
  const { queryRowErrors, validateQueryRow, clearQueryRowError } = validation;

  const operatorOptions = [
    { label: "AND", value: "AND" },
    { label: "OR", value: "OR" },
    { label: "AND NOT", value: "AND NOT" },
  ];

  const addQueryRow = () => {
    if (queryRows.length < 5) {
      const newId = Math.max(...queryRows.map((row) => row.id)) + 1;
      setQueryRows([
        ...queryRows,
        { id: newId, searchTerm: "", operator: "AND" },
      ]);
    }
  };

  const removeQueryRow = (id: number) => {
    if (queryRows.length > 1) {
      setQueryRows(queryRows.filter((row) => row.id !== id));
    }
  };

  const updateQueryRow = (
    id: number,
    field: "searchTerm" | "operator",
    value: string
  ) => {
    setQueryRows(
      queryRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleCreateQuery = () => {
    // Validate all query rows first
    let hasErrors = false;
    queryRows.forEach(row => {
      if (row.searchTerm.trim()) {
        const error = validateQueryRow(row.id, row.searchTerm);
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

    onCreateQuery();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <style>{`
        .rizzui-select-dropdown {
          z-index: 99999 !important;
          position: fixed !important;
        }
        
        .rizzui-select-container {
          position: relative !important;
        }
        
        .rizzui-select-dropdown-list {
          background: white !important;
          border: 1px solid #d1d5db !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
          max-height: 200px !important;
          overflow-y: auto !important;
        }
        
        .dark .rizzui-select-dropdown-list {
          background: #2C3A3F !important;
          border-color: #6b7280 !important;
        }

        .modal-content {
          display: flex;
          flex-direction: column;
          max-height: calc(100vh - 2rem);
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
        }
      `}</style>
      <div className="modal-content bg-white dark:bg-[#2C3A3F] rounded-lg w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-2 sm:mx-4">
                <div className="modal-body p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Build Search Query
          </h2>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenHistory}
              className="btn text-white inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border border-transparent rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 transition-all duration-200 ease-in-out hover:shadow-md active:transform active:scale-95"
            >
              <MdHistory className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Saved Queries</span>
              <span className="sm:hidden">Saved</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <IoClose className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
            </button>
          </div>
        </div>

        {/* Operators Explanation Section */}
        <div className="mt-2 sm:mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
          <h3 className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
            📚 How Search Operators Work:
          </h3>
          <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-600 dark:text-blue-400 min-w-[50px] sm:min-w-[60px] text-xs sm:text-xs">
                AND:
              </span>
              <span className="text-xs">Must contain all terms</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-green-600 dark:text-green-400 min-w-[50px] sm:min-w-[60px] text-xs sm:text-xs">
                OR:
              </span>
              <span className="text-xs">Can contain any of the terms</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-red-600 dark:text-red-400 min-w-[50px] sm:min-w-[60px] text-xs sm:text-xs">
                AND NOT:
              </span>
              <span className="text-xs">Must exclude the second term</span>
            </div>
          </div>
        </div>

        {/* Date Range Filter Section - Only show for paper search */}
        {showDateFilter && dateRange && setDateRange && (
          <div className="mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="enableDateFilter"
                checked={dateRange.enabled}
                onChange={(e) => setDateRange(prev => ({ ...prev, enabled: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label
                htmlFor="enableDateFilter"
                className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200 cursor-pointer"
              >
                📅 Filter by Publication Year
              </label>
            </div>
            
            {dateRange.enabled && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    From Year
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 2020"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={dateRange.startYear}
                    onChange={(e) => {
                      setDateRange(prev => ({ ...prev, startYear: e.target.value }));
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2C3A3F] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    To Year
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 2025"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={dateRange.endYear}
                    onChange={(e) => {
                      setDateRange(prev => ({ ...prev, endYear: e.target.value }));
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2C3A3F] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
            
            {dateRange.enabled && dateRange.startYear && dateRange.endYear && 
             parseInt(dateRange.startYear) > parseInt(dateRange.endYear) && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                ⚠️ Note: Start year is greater than end year
              </p>
            )}
            
            {dateRange.enabled && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                💡 Leave empty to search from/to any year. Both fields are optional.
              </p>
            )}
          </div>
        )}

        <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {queryRows.map((row, index) => (
            <div key={row.id} className="mb-4 sm:mb-5">
              {/* All elements in a single row */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Operator Selector - Only show for rows after the first */}
                {index > 0 && (
                  <div className="flex-shrink-0 w-32 sm:w-36 md:w-40 relative z-50">
                    <Select
                      value={operatorOptions.find(option => option.value === row.operator) || null}
                      onChange={(selectedOption:any) => {
                        if (selectedOption) {
                          updateQueryRow(row.id, "operator", selectedOption.value as "AND" | "OR" | "AND NOT");
                        }
                      }}
                      options={operatorOptions}
                      className="w-full text-sm"
                      dropdownClassName="!z-[99999] !fixed !bg-white dark:!bg-[#2C3A3F] !border !border-gray-300 dark:!border-gray-600 !rounded-lg !shadow-lg !min-w-[160px] !w-auto"
                      selectClassName="!bg-white dark:!bg-[#2C3A3F] !border !border-gray-300 dark:!border-gray-600 !rounded-lg !text-gray-900 dark:!text-white"
                      clearable={false}
                    />
                  </div>
                )}

                {/* Search Input */}
                <div className="flex-1">
                  <ValidatedQueryInput
                    placeholder="Search by Title or Author"
                    value={row.searchTerm}
                    onChange={(value) => {
                      updateQueryRow(row.id, "searchTerm", value);
                      clearQueryRowError(row.id);
                    }}
                    error={queryRowErrors[row.id] || ""}
                    className="w-full px-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2C3A3F] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Add Button - Only show on the last row if we can add more */}
                  {queryRows.length < 5 && index === queryRows.length - 1 && (
                    <button
                      type="button"
                      onClick={addQueryRow}
                      className="flex items-center justify-center w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                      title="Add another search term"
                    >
                      <IoAdd className="w-4 h-4" />
                    </button>
                  )}

                  {/* Remove Button - Only show if we have more than one row */}
                  {queryRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQueryRow(row.id)}
                      className="flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                      title="Remove this search term"
                    >
                      <IoRemove className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

          {/* Save Query Checkbox */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <input
              type="checkbox"
              id="saveQuery"
              checked={saveQuery}
              onChange={(e) => setSaveQuery(e.target.checked)}
              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <label
              htmlFor="saveQuery"
              className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
            >
              Save this query to history for future use
            </label>
          </div>
        </div>

        {/* Sticky Footer with Buttons */}
        <div className="sticky bottom-0 bg-white dark:bg-[#2C3A3F] px-3 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            {generatePreviewQuery() ? (
              <>
                <button
                  type="button"
                  onClick={onReset}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateQuery}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Create Query
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildQueryModal;
