"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import { Loader } from "rizzui";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { FaCheck } from "react-icons/fa";
import { autoImportSearchPdf } from "@/apis/files";
import { createPaperPdf } from "@/apis/explore";
import toast from "react-hot-toast";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import { useSelector } from "react-redux";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../ui/tooltip";

// Progress update interface
interface ProgressUpdate {
  type: 'progress';
  message: string;
  percentage: number;
  step: string;
  details?: {
    extractedInfo?: {
      totalReferences: number;
      referencesWithDOI: number;
      referencesWithTitle: number;
      referencesWithAuthors: number;
    };
    searchMethods?: {
      doiSearches: number;
      titleSearches: number;
      authorSearches: number;
    };
    searchResults?: {
      semanticScholarResults: number;
      googleScholarResults: number;
      doiResults?: number;
      validPDFs: number;
    };
    processingStats?: {
      currentReference: number;
      totalReferences: number;
      successfulSearches: number;
      failedSearches: number;
    };
  };
}

// Background processing notification interface
interface BackgroundProcessingNotification {
  success: boolean;
  message: string;
  data?: any[];
}

// Simple manual debounce function
function createDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout;
  
  const debounced = ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T & { cancel: () => void };
  
  debounced.cancel = () => {
    clearTimeout(timeoutId);
  };
  
  return debounced;
}

interface TextSearchProps {
  placeholder?: string;
  onPaperAdd?: (paperId: number, url: string) => void;
  projectId?: string | number;
  className?: string;
  disabled?: boolean;
  layout?: 'uploader' | 'import-docs';
}

const TextSearch: React.FC<TextSearchProps> = ({
  placeholder = "Enter your paper references here to search for papers",
  onPaperAdd,
  projectId,
  className = "",
  disabled = false,
  layout = 'uploader',
}) => {
  const [textareaContent, setTextareaContent] = useState("");
  const [textSearchResults, setTextSearchResults] = useState<any[]>([]);
  const [textSearchLoading, setTextSearchLoading] = useState(false);
  const [showTextSearchResults, setShowTextSearchResults] = useState(false);
  const [activeTextApiCalls, setActiveTextApiCalls] = useState(0);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [isAdded, setIsAdded] = useState<{ [key: string]: boolean }>({});
  const textareaDropdownRef = useRef<HTMLDivElement>(null);
  
  // Progress tracking states
  const [searchProgress, setSearchProgress] = useState<ProgressUpdate | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [processingSummary, setProcessingSummary] = useState<ProgressUpdate | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  
  // Background processing states
  const [backgroundProcessing, setBackgroundProcessing] = useState(false);
  const [backgroundNotification, setBackgroundNotification] = useState<BackgroundProcessingNotification | null>(null);

  // Authors expansion states
  const [expandedAuthors, setExpandedAuthors] = useState<{ [key: string]: boolean }>({});
  const [authorsOverflow, setAuthorsOverflow] = useState<{ [key: string]: boolean }>({});
  const authorsRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Calculate actual source counts from search results
  const calculateSourceCounts = (results: any[]) => {
    let validPDFs = 0;
    results.forEach((item: any) => {
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
    if (textSearchResults.length > 0) {
      textSearchResults.forEach((_, index) => {
        // Use multiple timeouts to ensure DOM is fully rendered
        setTimeout(() => checkAuthorsOverflow(index.toString()), 100);
        setTimeout(() => checkAuthorsOverflow(index.toString()), 300);
        setTimeout(() => checkAuthorsOverflow(index.toString()), 500);
      });
    }
  }, [textSearchResults, checkAuthorsOverflow]);

  // Add window resize listener for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (textSearchResults.length > 0) {
        textSearchResults.forEach((_, index) => {
          checkAuthorsOverflow(index.toString());
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [textSearchResults, checkAuthorsOverflow]);
  
  // Socket and user data
  const { socket } = useSocket();
  const userData = useSelector((state: any) => state?.user?.user?.user);

  // Listen for search progress updates
  useEffect(() => {
    if (socket && userData?.id) {
      const handleSearchProgress = (progress: ProgressUpdate) => {
        setShowProgress(true);
        setCurrentStep(progress.step);
        
        // Handle different completion states
        if (progress.percentage === 100) {
          if (progress.step === 'complete') {
            setProcessingSummary(progress);
            setShowSummary(true);
            setShowProgress(false);
            setSearchProgress(null);
          } else if (progress.step === 'error' || progress.step === 'no_results' || progress.step === 'no_references') {
            setProcessingSummary(progress);
            setShowSummary(true);
            setShowProgress(false);
            setSearchProgress(null);
          }
        }
      };

      const handleBackgroundProcessing = (notification: BackgroundProcessingNotification) => {
        setBackgroundProcessing(false);
        setBackgroundNotification(notification);
        
        if (notification.success && notification.data) {
          setTextSearchResults(notification.data);
          setShowTextSearchResults(true);
          setShowProgress(false);
          setSearchProgress(null);
        }
      };

      const handleReferenceExtractionComplete = (result: any) => {
        setBackgroundProcessing(false);
        
        if (result.success && result.data) {
          let results = [];
          if (Array.isArray(result.data)) {
            results = result.data;
          } else if (result.data.message) {
            results = [result.data.message];
          } else if (result.data.data) {
            results = Array.isArray(result.data.data) ? result.data.data : [result.data.data];
          } else {
            results = [result.data];
          }
          
          setTextSearchResults(results);
          setShowTextSearchResults(true);
          setShowProgress(false);
          setSearchProgress(null);
        }
      };

      socket.on('search_progress', handleSearchProgress);
      socket.on('background_processing_complete', handleBackgroundProcessing);
      socket.on('reference_extraction_complete', handleReferenceExtractionComplete);

      return () => {
        socket.off('search_progress', handleSearchProgress);
        socket.off('background_processing_complete', handleBackgroundProcessing);
        socket.off('reference_extraction_complete', handleReferenceExtractionComplete);
      };
    }
  }, [socket, userData?.id]);

  // Get step display name
  const getStepDisplayName = (step: string) => {
    const stepNames: { [key: string]: string } = {
      'extracting_references': 'Extracting References',
      'references_detected': 'References Detected',
      'searching_papers': 'Searching Papers',
      'papers_found': 'Papers Found',
      'validating_papers': 'Validating Papers',
      'complete': 'Complete',
      'single_search': 'Single Search',
      'error': 'Error',
      'no_results': 'No Results',
      'no_references': 'No References',
      'background_processing': 'Background Processing'
    };
    return stepNames[step] || step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get step icon
  const getStepIcon = (step: string) => {
    const stepIcons: { [key: string]: string } = {
      'extracting_references': '🔍',
      'references_detected': '📄',
      'searching_papers': '🔎',
      'papers_found': '📚',
      'validating_papers': '✅',
      'complete': '🎉',
      'single_search': '🔍',
      'error': '❌',
      'no_results': '⚠️',
      'no_references': '⚠️',
      'background_processing': '⚙️'
    };
    return stepIcons[step] || '📊';
  };

  // debouncedTextSearch function
  const debouncedTextSearch = useCallback(
    createDebounce(async (text: string) => {
      if (!text.trim()) {
        setTextSearchResults([]);
        setTextSearchLoading(false);
        setShowTextSearchResults(false);
        setShowProgress(false);
        setSearchProgress(null);
        setShowSummary(false);
        setProcessingSummary(null);
        setBackgroundProcessing(false);
        setBackgroundNotification(null);
        return;
      }

      // Increment active text API calls counter
      setActiveTextApiCalls(prev => prev + 1);
      setTextSearchLoading(true);
      setShowTextSearchResults(true);
      setShowProgress(true);
      setBackgroundProcessing(false);
      setBackgroundNotification(null);
      
      try {
        const body = { text };
        const apiRes = await autoImportSearchPdf(body);
        
        if (apiRes?.success) {
          // Check if this is a background processing response (status 202)
          if (apiRes.status === 202 || apiRes.message?.includes("started") || apiRes.message?.includes("notified")) {
            // Background processing initiated
            setBackgroundProcessing(true);
            setTextSearchLoading(false);
            setShowProgress(false);
            setSearchProgress(null);
            
            // Show professional notification message with close icon
            toast.success("Reference extraction started. You will be notified when it is complete.");
            
            // Clear the input field
            setTextareaContent("");
            
            // Close the dropdown/modal after a short delay
            setTimeout(() => {
              setShowTextSearchResults(false);
              setBackgroundProcessing(false);
              setBackgroundNotification(null);
            }, 2000);
            
            return;
          }
          
          // Immediate processing results (≤2 references)
          let results = [];
          if (apiRes.data) {
            if (Array.isArray(apiRes.data)) {
              results = apiRes.data;
            } else if (apiRes.data.message) {
              results = [apiRes.data.message];
            } else if (apiRes.data.data) {
              results = Array.isArray(apiRes.data.data) ? apiRes.data.data : [apiRes.data.data];
            } else {
              results = [apiRes.data];
            }
          }
          setTextSearchResults(results);
        } else {
          setTextSearchResults([]);
          // Only show toast for actual errors, not for "no data found" responses
          if (apiRes?.message?.includes("No references extracted") || 
              apiRes?.message?.includes("no results found")) {
            // Don't show toast for no data found cases
          } else {
            toast.error("Something went wrong. Please try again.");
            // Set loading to false when showing error toast
            setTextSearchLoading(false);
          }
        }
      } catch (error: any) {
        console.error('📝 Text API call failed:', error);
        setTextSearchResults([]);
        
        // Show toast for 500 status errors
        if (error?.response?.status === 500) {
          toast.error("Something went wrong. Please try again.");
        }
      } finally {
        // Decrement active text API calls counter
        setActiveTextApiCalls(prev => {
          const newCount = prev - 1;
          // Only hide loading if no more active calls and not in background processing
          if (newCount === 0 && !backgroundProcessing) {
            setTextSearchLoading(false);
            // Hide progress after a delay
            setTimeout(() => {
              setShowProgress(false);
              setSearchProgress(null);
            }, 2000);
          }
          return newCount;
        });
      }
    }, 600),
    [backgroundProcessing]
  );

  // Handle favorite/paper addition
  const handleFavourite = async (paperId: number, url: any) => {
    try {
      setIsLoading((prev: any) => ({
        ...prev,
        [paperId]: true,
      }));

      const response: any = await createPaperPdf({
        url,
        project_id: projectId,
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

  // Cleanup debounced functions on unmount
  useEffect(() => {
    return () => {
      debouncedTextSearch.cancel();
      // Reset counters on unmount
      setActiveTextApiCalls(0);
      // Reset authors expansion state
      setExpandedAuthors({});
      setAuthorsOverflow({});
    };
  }, [debouncedTextSearch]);

  // Reset counters when textarea is cleared
  useEffect(() => {
    if (!textareaContent.trim()) {
      setActiveTextApiCalls(0);
      setTextSearchLoading(false);
      setShowTextSearchResults(false);
      setShowProgress(false);
      setSearchProgress(null);
      setShowSummary(false);
      setProcessingSummary(null);
      setBackgroundProcessing(false);
      setBackgroundNotification(null);
      // Reset authors expansion state
      setExpandedAuthors({});
      setAuthorsOverflow({});
    } else {
      // Reset error state when user starts typing again
      if (processingSummary?.step === 'error') {
        setProcessingSummary(null);
        setShowSummary(false);
      }
      // Reset background processing state when user starts typing again
      if (backgroundProcessing) {
        setBackgroundProcessing(false);
        setBackgroundNotification(null);
      }
    }
  }, [textareaContent, processingSummary?.step, backgroundProcessing]);

  // Control dropdown visibility based on content and results
  useEffect(() => {
    if (textareaContent.trim()) {
      if (textSearchLoading || backgroundProcessing) {
        setShowTextSearchResults(true);
      } else {
        // Always show dropdown when there's content and not loading
        // This allows "No Data Found" message to be displayed
        setShowTextSearchResults(true);
      }
    } else {
      // Hide dropdown when no content
      setShowTextSearchResults(false);
    }
  }, [textSearchLoading, textSearchResults.length, textareaContent, backgroundProcessing]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Don't close if clicking on preview buttons inside the dropdowns
      if (target && (target as Element).closest('.preview-button')) {
        return;
      }
      
      if (
        textareaDropdownRef.current &&
        !textareaDropdownRef.current.contains(target)
      ) {
        setShowTextSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  return (
    <div ref={textareaDropdownRef} className={`relative textarea-container ${className}`}>
      <Textarea
        placeholder={placeholder}
        className="w-full min-h-[144px] max-h-[144px] h-[144px] overflow-y-scroll mb-3"
        value={textareaContent}
        onChange={(e) => {
          setTextareaContent(e.target.value);
          debouncedTextSearch(e.target.value);
        }}
        disabled={disabled}
        rows={6}
      />
       {showTextSearchResults && !(processingSummary?.step === 'error') && (
        <TooltipProvider>
          <div className="absolute top-full w-full left-[0px] z-10 mt-2 textarea-dropdown">
            <div className="bg-white dark:bg-[#2C3A3F] border border-gray-300 dark:border-[#2c3a3f] rounded-lg shadow-lg">
              {textSearchLoading && searchProgress?.step !== 'error' ? (
                <div className="w-full py-4 px-4 mb-[-8px]  min-h-[215px]">
                  {showProgress && searchProgress ? (
                    // Show progress information instead of simple loader
                    <div className="space-y-3">
                      {/* Progress Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getStepIcon(searchProgress.step)}</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {searchProgress.message}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {searchProgress.percentage}%
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${searchProgress.percentage}%` }}
                        ></div>
                      </div>
                      
                      {/* Step indicator */}
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        {getStepDisplayName(searchProgress.step)}
                      </div>
                      
                      {/* Detailed Progress Information - Compact for import-docs */}
                      {searchProgress.details && (
                        <div className={`space-y-2 text-xs ${layout === 'import-docs' ? 'max-h-32 overflow-y-auto' : ''}`}>
                          {/* Extracted Information */}
                          {searchProgress.details.extractedInfo && (
                            <div className="border-t pt-2">
                              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                📄 Detected Items
                              </div>
                              <div className={`grid gap-1 text-gray-600 dark:text-gray-400 ${
                                layout === 'import-docs' ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'
                              }`}>
                                <div>Total: {searchProgress.details.extractedInfo.totalReferences}</div>
                                <div>With DOI: {searchProgress.details.extractedInfo.referencesWithDOI}</div>
                                <div>With Title: {searchProgress.details.extractedInfo.referencesWithTitle}</div>
                                <div>With Authors: {searchProgress.details.extractedInfo.referencesWithAuthors}</div>
                              </div>
                            </div>
                          )}

                          {/* Search Methods */}
                          {searchProgress.details.searchMethods && (
                            <div className="border-t pt-2">
                              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                🔍 Search Methods
                              </div>
                              <div className={`grid gap-1 text-gray-600 dark:text-gray-400 ${
                                layout === 'import-docs' ? 'grid-cols-3' : 'grid-cols-3'
                              }`}>
                                <div>DOI: {searchProgress.details.searchMethods.doiSearches}</div>
                                <div>Title: {searchProgress.details.searchMethods.titleSearches}</div>
                                <div>Author: {searchProgress.details.searchMethods.authorSearches}</div>
                              </div>
                            </div>
                          )}

                          {/* Processing Stats */}
                          {searchProgress.details.processingStats && (
                            <div className="border-t pt-2">
                              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                ⚙️ Processing
                              </div>
                              <div className={`grid gap-1 text-gray-600 dark:text-gray-400 ${
                                layout === 'import-docs' ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'
                              }`}>
                                <div>Checking: {searchProgress.details.processingStats.currentReference}/{searchProgress.details.processingStats.totalReferences}</div>
                                <div>Verified: {searchProgress.details.processingStats.successfulSearches}</div>
                                <div>Not Found: {searchProgress.details.processingStats.failedSearches}</div>
                                {searchProgress.details.processingStats.totalReferences > 1 && (
                                  <div>Progress: {Math.round((searchProgress.details.processingStats.currentReference / searchProgress.details.processingStats.totalReferences) * 100)}%</div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Search Results */}
                          {searchProgress.details.searchResults && (
                            <div className="border-t pt-2">
                              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                📚 Search Results
                              </div>
                              <div className={`grid gap-1 text-gray-600 dark:text-gray-400 ${
                                layout === 'import-docs' ? 'grid-cols-2' : 'grid-cols-4'
                              }`}>
                                <div>Semantic Scholar: {searchProgress.details.searchResults.semanticScholarResults}</div>
                                <div>Google Scholar: {searchProgress.details.searchResults.googleScholarResults}</div>
                                <div>DOI Results: {searchProgress.details.searchResults.doiResults || 0}</div>
                                <div>Valid PDFs: {searchProgress.details.searchResults.validPDFs}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Fallback to simple loader if no progress data
                    <div className="w-full flex items-center justify-center text-[#9b9d9f] py-8 text-[14px] h-44">
                      Loading
                      <Loader
                        variant="threeDot"
                        size="lg"
                        className="ms-1 pt-[10px]"
                      />
                    </div>
                  )}
                </div>
              ) : backgroundProcessing ? (
                // Background processing display
                <div className="w-full py-4 px-4">
                  <div className="space-y-3">
                    {/* Background Processing Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚙️</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Processing in Background
                        </span>
                      </div>
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        Active
                      </span>
                    </div>
                    
                    {/* Background Processing Message */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      We detected multiple references in your text. These are being processed in the background to ensure the best results.
                    </div>
                    
                    {/* Professional Notification Message */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="font-medium text-blue-800 dark:text-blue-300 mb-1 text-xs">
                        📧 Notification
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        You will be notified via email and in-app when the processing is complete.
                      </div>
                    </div>
                    
                    {/* Estimated Time */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="font-medium text-gray-800 dark:text-gray-200 mb-1 text-xs">
                        ⏱️ Estimated Time
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Processing typically takes 2-5 minutes depending on the number of references.
                      </div>
                    </div>
                    
                    {/* You can continue working */}
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="font-medium text-green-800 dark:text-green-300 mb-1 text-xs">
                        💡 Tip
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        You can continue using other features while we process your references.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                                      {/* Processing Summary */}
                    {showSummary && processingSummary && textSearchResults?.length > 0 && (
                      <div className="border-b border-gray-200 dark:border-gray-600 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              📊 Processing Summary
                            </h3>
                          </div>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            ✓ Complete
                          </span>
                        </div>
                        
                        {/* Key Metrics */}
                        <div className={`grid gap-3 text-xs mb-4 ${
                          layout === 'import-docs' ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'
                        }`}>
                          {processingSummary.details?.extractedInfo && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                              <div className="font-medium text-blue-800 dark:text-blue-300">Items Detected</div>
                              <div className="text-blue-600 dark:text-blue-400">{processingSummary.details.extractedInfo.totalReferences}</div>
                            </div>
                          )}
                          
                          {textSearchResults?.length > 0 && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                              <div className="font-medium text-green-800 dark:text-green-300">Verified Papers</div>
                              <div className="text-green-600 dark:text-green-400">{calculateSourceCounts(textSearchResults).validPDFs}</div>
                            </div>
                          )}
                          
                          {processingSummary.details?.processingStats && (
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                              <div className="font-medium text-purple-800 dark:text-purple-300">Available PDFs</div>
                              <div className="text-purple-600 dark:text-purple-400">{processingSummary.details.processingStats.successfulSearches}</div>
                            </div>
                          )}
                          
                          {processingSummary.details?.searchMethods && (
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                              <div className="font-medium text-orange-800 dark:text-orange-300">Search Methods</div>
                              <div className="text-orange-600 dark:text-orange-400">
                                {processingSummary.details.searchMethods.doiSearches + 
                                 processingSummary.details.searchMethods.titleSearches + 
                                 processingSummary.details.searchMethods.authorSearches}
                              </div>
                            </div>
                          )}
                        </div>

                    {/* Detailed Extraction Info */}
                    {processingSummary.details?.extractedInfo && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="font-medium text-gray-800 dark:text-gray-200 mb-2 text-xs">
                          🔍 Extraction Details
                        </div>
                        <div className={`grid gap-2 text-xs ${
                          layout === 'import-docs' ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'
                        }`}>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">With DOI:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{processingSummary.details.extractedInfo.referencesWithDOI}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">With Title:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{processingSummary.details.extractedInfo.referencesWithTitle}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">With Authors:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{processingSummary.details.extractedInfo.referencesWithAuthors}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Total Items:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{processingSummary.details.extractedInfo.totalReferences}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Search Methods Breakdown - replaced with generic summary */}
                    {processingSummary.details?.searchMethods && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="font-medium text-gray-800 dark:text-gray-200 mb-2 text-xs">
                          🔎 Search Methods Used
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Multiple search strategies were used to find references.
                        </div>
                      </div>
                    )}

                    {/* Search Results Breakdown - replaced with generic summary */}
                    {textSearchResults?.length > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="font-medium text-gray-800 dark:text-gray-200 mb-2 text-xs">
                          📚 Results Summary
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Results were found from multiple sources.
                        </div>
                      </div>
                    )}

                  

                    {/* AI Model Information */}
                    <div className="mb-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <div className="font-medium text-indigo-800 dark:text-indigo-300 mb-1 text-xs">
                        🤖 AI Processing
                      </div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400">
                        Text analysis and reference extraction completed using advanced AI models
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                      {processingSummary.message}
                    </div>
                  </div>
                )}

                {/* Error or No Results Summary - Only show when there are results but we want to show error info */}
                {showSummary && processingSummary && (processingSummary.step === 'error' || processingSummary.step === 'no_results' || processingSummary.step === 'no_references') && textSearchResults?.length > 0 && (
                  <div className="border-b border-gray-200 dark:border-gray-600 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {getStepDisplayName(processingSummary.step)}
                        </h3>
                      </div>
                      <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                        {processingSummary.step === 'error' ? '❌ Error' : '⚠️ No Results'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {processingSummary.message}
                    </div>

                    {/* Show processing stats if available */}
                    {processingSummary.details?.processingStats && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="font-medium text-gray-800 dark:text-gray-200 mb-2 text-xs">
                          📊 Processing Summary
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total References:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{processingSummary.details.processingStats.totalReferences}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Successful Searches:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{processingSummary.details.processingStats.successfulSearches}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Failed Searches:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{processingSummary.details.processingStats.failedSearches}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Search Results */}
                <ul className="max-h-[208px] overflow-y-auto flex flex-col pb-4">
                  <TooltipProvider>
                    {textSearchResults?.length > 0 ? (
                      [...textSearchResults]
                        .sort((a:any, b:any) => {
                          const aIsPdf = a?.data?.type === "pdf" ? 1 : 0;
                          const bIsPdf = b?.data?.type === "pdf" ? 1 : 0;
                          return bIsPdf - aIsPdf;
                        })
                        .map((item:any, i:any) => {
                          return (
                                                    <li
                          className={`px-4 pt-4 mb-2 ${
                            layout === 'import-docs' 
                              ? 'flex flex-col space-y-2' 
                              : 'flex justify-between flex-row items-center gap-3'
                          }`}
                          key={i}
                        >
                              <div className={`${
                                layout === 'import-docs' 
                                  ? 'text-sm font-medium text-gray-900 dark:text-gray-100 flex-1 min-w-0' 
                                  : 'flex-1 min-w-0'
                              }`}>
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
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                          {item.searchMethod}
                                        </span>
                                      )}
                                      {item?.searchInput && (
                                        <span className="text-gray-600 dark:text-gray-300 truncate max-w-[200px]" title={item.searchInput}>
                                          &ldquo;{item.searchInput}&rdquo;
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className={`flex justify-center gap-2 ${
                                layout === 'import-docs' ? 'mt-0' : 'mt-2'
                              }`}>
                                <Button
                                  className="h-8 button-full preview-button"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.open(
                                      item?.openAccessPdf?.url || item?.message?.URL || item.URL,
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
                                      className="h-8 bg-blueTh min-w-40 text-black font-semibold flex items-center justify-center bg-[#E2EEFF] rounded-full hover:bg-[#E2EEFF]"
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
                                      {item?.type === "pdf" || item?.data?.type === "pdf" || item?.message?.type === "pdf" || item?.is_disable_url === false ? (
                                        isLoading[i] ? (
                                          <Loader variant="threeDot" size="sm" />
                                        ) : isAdded[i] ? (
                                          <FaCheck className="text-green-500 h-5 w-5" />
                                        ) : (
                                          item?.alreadyExists ? "Already Exists" : "Add to My Papers"
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
                        })
                    ) : (
                      <li className="p-4 w-full self-center text-center mt-4">
                        {processingSummary?.step === 'no_references' || processingSummary?.step === 'no_results' || processingSummary?.step === 'error' 
                          ? processingSummary.message 
                          : 'No Data Found'
                        }
                      </li>
                    )}
                  </TooltipProvider>
                </ul>
              </>
            )}
          </div>
        </div>
      </TooltipProvider>
    )}
    </div>
  );
};

export default TextSearch; 