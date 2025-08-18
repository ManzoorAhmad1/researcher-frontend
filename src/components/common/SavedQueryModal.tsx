import React from "react";
import { IoClose } from "react-icons/io5";
import { MdHistory } from "react-icons/md";
import { LoaderCircle } from "lucide-react";
import { Text } from "rizzui";

interface QueryHistoryItem {
  id: number;
  search_value: string;
  date: string;
}

interface SavedQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  queryHistory: QueryHistoryItem[];
  historyLoading: boolean;
  loadingMore: boolean;
  hasMoreHistory: boolean;
  onLoadQuery: (query: string) => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  onLoadMore?: () => void;
}

const SavedQueryModal: React.FC<SavedQueryModalProps> = ({
  isOpen,
  onClose,
  queryHistory,
  historyLoading,
  loadingMore,
  hasMoreHistory,
  onLoadQuery,
  onScroll,
  onLoadMore
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#2C3A3F] rounded-lg p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Query History
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <IoClose className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div
          className="space-y-3 max-h-[50vh] overflow-y-auto"
          onScroll={onScroll}
        >
          {historyLoading ? (
            <div className="text-center py-8">
              <LoaderCircle className="animate-spin h-8 w-8 mx-auto text-blue-500 mb-2" />
              <Text className="text-gray-500 dark:text-gray-400">
                Loading your saved queries...
              </Text>
            </div>
          ) : queryHistory.length === 0 ? (
            <div className="text-center py-8">
              <MdHistory className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <Text className="text-gray-500 dark:text-gray-400 mb-2">
                No saved queries yet
              </Text>
              <Text className="text-sm text-gray-400 dark:text-gray-500">
                Build and save your first query to see it here!
              </Text>
            </div>
          ) : (
            <>
              {queryHistory.map((historyItem) => (
                <div
                  key={historyItem.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
                        "{historyItem.search_value}"
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Saved on {historyItem.date}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onLoadQuery(historyItem.search_value)}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0 transition-colors"
                    >
                      Use Query
                    </button>
                  </div>
                </div>
              ))}

              {/* Loading more indicator */}
              {loadingMore && (
                <div className="text-center py-4">
                  <LoaderCircle className="animate-spin h-6 w-6 mx-auto text-blue-500 mb-2" />
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    Loading more queries...
                  </Text>
                </div>
              )}

              {/* Load More Button (fallback) */}
              {!loadingMore && hasMoreHistory && queryHistory.length > 0 && onLoadMore && (
                <div className="text-center py-4">
                  <button
                    type="button"
                    onClick={onLoadMore}
                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    Load More Queries
                  </button>
                </div>
              )}

              {/* End of data indicator */}
              {!hasMoreHistory && queryHistory.length > 10 && (
                <div className="text-center py-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    No more queries to load
                  </Text>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedQueryModal;
