"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "rizzui";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../ui/tooltip";
import { FaCheck } from "react-icons/fa";
import { createPaperPdf } from "@/apis/explore";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

interface ReferenceResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string | number;
  onPaperAdd?: (paperId: number, url: string) => void;
}

interface ReferenceResult {
  paperId?: string;
  title?: string;
  year?: number;
  referenceCount?: number;
  citationCount?: number;
  openAccessPdf?: {
    url: string;
  };
  pdfLink?: string;
  is_disable_url?: boolean;
  source?: string;
  authors?: any[];
  abstract?: string;
  data?: {
    type?: string;
  };
  message?: {
    title?: string[];
    URL?: string;
    type?: string;
  };
  URL?: string;
  alreadyExists?: boolean;
  searchMethod?: string;
  searchInput?: string;
}

const ReferenceResultsModal: React.FC<ReferenceResultsModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onPaperAdd,
}) => {
  const [results, setResults] = useState<ReferenceResult[]>([]);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [isAdded, setIsAdded] = useState<{ [key: string]: boolean }>({});
  const [expandedAuthors, setExpandedAuthors] = useState<{ [key: string]: boolean }>({});
  const [authorsOverflow, setAuthorsOverflow] = useState<{ [key: string]: boolean }>({});
  const authorsRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const currentProject = useSelector((state: any) => state?.project);
  useEffect(() => {
    if (isOpen) {
      const storedResults = localStorage.getItem('referenceExtractionResults');
      if (storedResults) {
        try {
          const parsedResults = JSON.parse(storedResults);
          if (parsedResults.data) {
            setResults(Array.isArray(parsedResults.data) ? parsedResults.data : [parsedResults.data]);
          }
        } catch (error) {
          console.error('Error parsing stored results:', error);
        }
      }
    }
  }, [isOpen]);

  // Calculate actual source counts from search results
  const calculateSourceCounts = (results: ReferenceResult[]) => {
    let validPDFs = 0;
    results.forEach((item) => {
      if (item.openAccessPdf?.url || item.pdfLink) {
        if (!item.is_disable_url) {
          validPDFs++;
        }
      }
    });
    return {
      validPDFs: validPDFs
    };
  };

  // Handle favorite/paper addition
  const handleFavourite = async (paperId: number, url: string) => {
    try {
      setIsLoading((prev: any) => ({
        ...prev,
        [paperId]: true,
      }));

      const response: any = await createPaperPdf({
        url,
        project_id: currentProject?.project?.id,
      });
      
      if (response.status === 200) {
        setIsAdded((prev: any) => ({
          ...prev,
          [paperId]: true,
        }));
        toast.success(response?.data?.message);
        
        // Call the callback if provided
        if (onPaperAdd) {
          onPaperAdd(paperId, url);
        }
        // Dispatch a custom event to trigger refetch in ExplorerTable
        window.dispatchEvent(new CustomEvent('refetchPapers'));
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error: any) {
      console.error("Error creating paper PDF:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "This paper couldn't be added automatically. Please click 'Preview' to download the file and upload it manually to your Papers"
      );
    } finally {
      setIsLoading((prev: any) => ({
        ...prev,
        [paperId]: false,
      }));
    }
  };

  // Check for authors overflow
  const checkAuthorsOverflow = useCallback((index: string) => {
    const el = authorsRefs.current[index];
    if (el) {
      // Check if text actually overflows by comparing scroll dimensions with client dimensions
      // Only show "See more" if there's significant overflow (more than 5px difference)
      const horizontalOverflow = el.scrollWidth > el.clientWidth + 5;
      const verticalOverflow = el.scrollHeight > el.clientHeight + 5;
      const hasOverflow = horizontalOverflow || verticalOverflow;
      
      setAuthorsOverflow(prev => ({
        ...prev,
        [index]: hasOverflow
      }));
    }
  }, []);

  // Check overflow when results change
  useEffect(() => {
    if (results.length > 0) {
      results.forEach((_, index) => {
        // Use multiple timeouts to ensure DOM is fully rendered
        setTimeout(() => checkAuthorsOverflow(index.toString()), 100);
        setTimeout(() => checkAuthorsOverflow(index.toString()), 300);
        setTimeout(() => checkAuthorsOverflow(index.toString()), 500);
      });
    }
  }, [results, checkAuthorsOverflow]);

  // Add window resize listener for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (results.length > 0) {
        results.forEach((_, index) => {
          checkAuthorsOverflow(index.toString());
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [results, checkAuthorsOverflow]);

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#2C3A3F] rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Reference Extraction Results
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2"
          >
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {results.length > 0 ? (
            <>
              {/* Processing Summary */}
              <div className="border-b border-gray-200 dark:border-gray-600 p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      📊 Processing Summary
                    </h3>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium transition-all duration-300 animate-pulse">
                    ✓ Complete
                  </span>
                </div>
                
                {/* Key Metrics */}
                <div className="grid gap-3 text-xs mb-4 grid-cols-2">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-blue-100 dark:hover:bg-blue-900/30">
                    <div className="font-medium text-blue-800 dark:text-blue-300">Total Papers</div>
                    <div className="text-blue-600 dark:text-blue-400">{results.length}</div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-green-100 dark:hover:bg-green-900/30">
                    <div className="font-medium text-green-800 dark:text-green-300">Available PDFs</div>
                    <div className="text-green-600 dark:text-green-400">{calculateSourceCounts(results).validPDFs}</div>
                  </div>
                </div>

                {/* AI Model Information */}
                <div className="mb-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30">
                  <div className="font-medium text-indigo-800 dark:text-indigo-300 mb-1 text-xs">
                    🤖 AI Processing
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400">
                    Text analysis and reference extraction completed using advanced AI models
                  </div>
                </div>
              </div>

              {/* Results List */}
              <ul className="max-h-[calc(80vh-300px)] overflow-y-auto flex flex-col pb-4">
                <TooltipProvider>
                  {[...results]
                    .sort((a, b) => {
                      const aIsPdf = a?.data?.type === "pdf" ? 1 : 0;
                      const bIsPdf = b?.data?.type === "pdf" ? 1 : 0;
                      return bIsPdf - aIsPdf;
                    })
                    .map((item: any, i: any) => {
                      return (
                        <li
                          className="px-4 pt-4 mb-2 flex justify-between flex-row items-center gap-3 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg hover:shadow-sm"
                          key={i}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-gray-100 leading-tight mb-1">
                              {item?.message?.title?.[0] || item?.title}
                            </div>
                            
                            {/* Authors and Year */}
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {(item?.authors || item?.message?.author) && (
                                <div className="relative mr-3">
                                  <div
                                    ref={(el) => {
                                      authorsRefs.current[i] = el;
                                    }}
                                    className={`transition-all duration-500 ease-in-out ${
                                      expandedAuthors[i] 
                                        ? 'max-h-none opacity-100' 
                                        : 'max-h-[40px] opacity-80 overflow-hidden'
                                    }`}
                                    style={{
                                      maxWidth: '92%',
                                      whiteSpace: expandedAuthors[i] ? 'normal' : 'nowrap',
                                      textOverflow: expandedAuthors[i] ? 'clip' : 'ellipsis',
                                      cursor: authorsOverflow[i] ? 'pointer' : 'default',
                                      lineHeight: expandedAuthors[i] ? '1.4' : '1.2',
                                    }}
                                    onClick={() => {
                                      if (authorsOverflow[i]) {
                                        setExpandedAuthors(prev => ({
                                          ...prev,
                                          [i]: !prev[i]
                                        }));
                                      }
                                    }}
                                  >
                                    {(item.authors || item.message?.author || []).map((author: any, index: number) => {
                                      // Handle structured author objects (given + family) - Crossref format
                                      if (author.given && author.family) {
                                        return `${author.given} ${author.family}`;
                                      }
                                      // Handle author objects with name property - Semantic Scholar format
                                      else if (author.name) {
                                        return author.name;
                                      }
                                      // Handle simple string authors
                                      else if (typeof author === 'string') {
                                        return author;
                                      }
                                      // Fallback to string representation
                                      else {
                                        return String(author);
                                      }
                                    }).join(', ')}
                                  </div>
                                  {authorsOverflow[i] && !expandedAuthors[i] && (
                                    <button
                                      className="absolute right-0 top-0 text-xs text-blue-600 hover:underline z-20 transition-opacity duration-300 opacity-90 hover:opacity-100 bg-white dark:bg-[#2C3A3F] px-1 rounded"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedAuthors(prev => ({
                                          ...prev,
                                          [i]: true
                                        }));
                                      }}
                                    >
                                      See more
                                    </button>
                                  )}
                                  {authorsOverflow[i] && expandedAuthors[i] && (
                                    <button
                                      className="block mt-1 text-xs text-blue-600 hover:underline z-10 transition-opacity duration-300 opacity-80 hover:opacity-100 text-left"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedAuthors(prev => ({
                                          ...prev,
                                          [i]: false
                                        }));
                                      }}
                                    >
                                      See less
                                    </button>
                                  )}
                                </div>
                              )}
                              {(item?.year || item?.message?.issued?.['date-parts']?.[0]?.[0]) && (
                                <span className="text-gray-500 dark:text-gray-500">
                                  ({item.year || item?.message?.issued?.['date-parts']?.[0]?.[0]})
                                </span>
                              )}
                            </div>
                            
                            {/* Search Method and Input Information */}
                            {(item?.searchMethod || item?.searchInput) && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                  {item?.searchMethod && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 transition-all duration-200 hover:scale-105 hover:shadow-sm">
                                      {item.searchMethod}
                                    </span>
                                  )}
                                  {item?.searchInput && (
                                    <span className="text-gray-600 dark:text-gray-300 " title={item.searchInput}>
                                   &ldquo;{item.searchInput}&rdquo; 
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-center gap-2 mt-2">
                            <Button
                              className="h-8 button-full preview-button transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              variant="outline"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(
                                  (item?.openAccessPdf?.url || item?.message?.URL || item.URL || ""),
                                  "_blank"
                                );
                              }}
                              disabled={item?.openAccessPdf?.url === ""}
                            >
                              Preview
                            </Button>

                            <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      className={`h-8 bg-blueTh min-w-40 text-black font-semibold flex items-center justify-center bg-[#E2EEFF] rounded-full hover:bg-[#E2EEFF] transition-all duration-200 hover:scale-105 hover:shadow-md ${item?.alreadyExists ? 'opacity-50 cursor-not-allowed pointer-events-none' : ((typeof item?.is_disable_url !== 'undefined' && item?.is_disable_url === true) || (typeof item?.is_disable_url === 'undefined' && ((item?.type !== "pdf" && item?.data?.type !== "pdf" && item?.message?.type !== "pdf"))) ? 'disabled-btn' : '')}`}
                                      variant="secondary"
                                      aria-disabled={
                                        (typeof item?.is_disable_url !== 'undefined' && item?.is_disable_url === true) ||
                                        (typeof item?.is_disable_url === 'undefined' && ((item?.type !== "pdf" && item?.data?.type !== "pdf" && item?.message?.type !== "pdf")))
                                      }
                                      disabled={item?.alreadyExists}
                                      onClick={e => {
                                        if (
                                          (typeof item?.is_disable_url !== 'undefined' && item?.is_disable_url === true) ||
                                          (typeof item?.is_disable_url === 'undefined' && ((item?.type !== "pdf" && item?.data?.type !== "pdf" && item?.message?.type !== "pdf")))
                                        ) {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          // Optionally, you can trigger a tooltip programmatically here if your tooltip lib supports it
                                          return;
                                        }
                                        handleFavourite(i, item?.openAccessPdf?.url || item?.message?.URL || item.URL);
                                      }}
                                    >
                                      {item?.alreadyExists ? (
                                        "Already Exists"
                                      ) : item?.type === "pdf" || item?.data?.type === "pdf" || item?.message?.type === "pdf" || item?.is_disable_url === false ? (
                                        isLoading[i] ? (
                                          <Loader variant="threeDot" size="sm" />
                                        ) : isAdded[i] ? (
                                          <FaCheck className="text-green-500 h-5 w-5" />
                                        ) : (
                                          "Add to My Papers"
                                        )
                                      ) : (
                                        <IoMdCloseCircleOutline className="text-red-700 text-2xl" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  {(
                                    (typeof item?.is_disable_url !== 'undefined' && item?.is_disable_url === true) ||
                                    (typeof item?.is_disable_url === 'undefined' && ((item?.type !== "pdf" && item?.data?.type !== "pdf" && item?.message?.type !== "pdf")))
                                  ) ? (
                                    <TooltipContent side="top" className="w-64 whitespace-normal break-words text-sm text-gray-800 dark:text-gray-200 font-normal">
                                      Please download the PDF from Preview and upload it manually.
                                    </TooltipContent>
                                  ) : null}
                                </Tooltip>
                          </div>
                        </li>
                      );
                    })}
                </TooltipProvider>
              </ul>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No results available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferenceResultsModal; 