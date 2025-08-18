"use client";

import React, {
  ChangeEvent,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronDown, CloudUpload } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { Worker } from "@react-pdf-viewer/core";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { upload } from "@/reducer/services/upload";
import { UploadFile } from "@/apis/upload";
import { Loader, Text } from "rizzui";
import { GoSearch } from "react-icons/go";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../ui/review-stage-select ";
import { AUTO_IMPORT_PDF_TYPE } from "@/constant";
import { IoIosWarning, IoMdCloseCircleOutline } from "react-icons/io";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../ui/tooltip";
import { autoImportSearchPdf } from "@/apis/files";
import { createPaperPdf } from "@/apis/explore";
import { FaCheck } from "react-icons/fa";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import TextSearch from "../TextSearch/TextSearch";

interface FilePreview {
  name: string;
  url: string;
  isPrivate: boolean;
}
interface UploaderProps {
  button?: boolean;
  isSubfolder?: boolean;
  fetchFolders?: any;
  setSelectedPapers?: any;
}

type UserType = User | null;

// Move isPdf function outside component to prevent recreation
function isPdf(link: any) {
  if (link && Array.isArray(link)) {
    const filteredLinks = link.filter(
      (item) =>
        !(
          item["content-type"] === "application/pdf" &&
          item.URL?.includes("download")
        )
    );

    const pdfLink = filteredLinks.find(
      (item) => item["content-type"] === "application/pdf"
    );

    if (pdfLink) {
      return { type: "pdf", openAccess: pdfLink.URL };
    }

    return { type: "webpage" };
  }
  return { type: "webpage" };
}

// Simple manual debounce function for testing
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

const Uploader: React.FC<UploaderProps> = ({
  isSubfolder,
  fetchFolders,
  button,
  setSelectedPapers,
 
}) => {
  const route = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const workerURL = process.env.NEXT_PUBLIC_PDF_WORKER_URL || "";
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [user, setUser] = useState<UserType>(null);
  const [showProgressBar, setShowProgressBar] = useState<number>(0);
  const currentProject = useSelector((state: any) => state?.project);
  const [isPDFType, setIsPDFType] = useState<string>("DOI");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestionsLoading, setSuggestionsLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [isAdded, setIsAdded] = useState<{ [key: string]: boolean }>({});
  const [isOpen, setIsOpen] = useState(false);
  const [selectAllPrivate, setSelectAllPrivate] = useState(false);
  const [activeApiCalls, setActiveApiCalls] = useState(0);
  const [isPasteReference, setIsPasteReference] = useState(false);

  // Authors expansion states
  const [expandedAuthors, setExpandedAuthors] = useState<{ [key: string]: boolean }>({});
  const [authorsOverflow, setAuthorsOverflow] = useState<{ [key: string]: boolean }>({});
  const authorsRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Update debouncedSearch to only pass { text, value } for the search field
  const debouncedSearch = useCallback(
    createDebounce(async (value: string, type: string) => {
      if (value.trim() === "") {
        setShowSuggestions(false);
        return;
      }
      setActiveApiCalls(prev => prev + 1);
      setSuggestionsLoading(true);
      setShowSuggestions(true);
      const body = { type, value };
      try {
        const apiRes = await autoImportSearchPdf(body);
        if (apiRes?.success) {
          if (type === "DOI") {
            const data = apiRes?.data?.message?.resource?.primary.URL?.includes(
              ".pdf"
            )
              ? {
                  type: "pdf",
                  openAccess: apiRes?.data?.message?.resource?.primary.URL,
                }
              : { type: "webpage" };
            setSuggestions([{ ...apiRes?.data?.message, data }]);
          } else {
            const data = apiRes?.data?.map((item: any) => {
              const itemData = isPdf(item.openAccessPdf?.url || "");
              return { ...item, data: itemData };
            });
            setSuggestions(data);
          }
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        setSuggestions([]);
      } finally {
        setActiveApiCalls(prev => {
          const newCount = prev - 1;
          if (newCount === 0) {
            setSuggestionsLoading(false);
          }
          return newCount;
        });
      }
    }, 600),
    []
  );

  // Cleanup debouncedSearch on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
      setActiveApiCalls(0);
      // Reset authors expansion state
      setExpandedAuthors({});
      setAuthorsOverflow({});
    };
  }, [debouncedSearch]);

  // Reset counters when search is cleared
  useEffect(() => {
    if (!searchQuery.trim()) {
      setActiveApiCalls(0);
      setSuggestionsLoading(false);
    }
  }, [searchQuery]);

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

  // Check overflow when suggestions change
  useEffect(() => {
    if (suggestions.length > 0) {
      suggestions.forEach((_, index) => {
        // Use multiple timeouts to ensure DOM is fully rendered
        setTimeout(() => checkAuthorsOverflow(index.toString()), 100);
        setTimeout(() => checkAuthorsOverflow(index.toString()), 300);
        setTimeout(() => checkAuthorsOverflow(index.toString()), 500);
      });
    }
  }, [suggestions, checkAuthorsOverflow]);

  // Add window resize listener for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (suggestions.length > 0) {
        suggestions.forEach((_, index) => {
          checkAuthorsOverflow(index.toString());
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [suggestions, checkAuthorsOverflow]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (target && (target as Element).closest('.preview-button')) {
        return;
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const saveDisabled = files.length === 0;
    setSaving(saveDisabled);
  }, [files]);

  const getLastItemFromUrl = (url: string) => {
    const parts = url.replace(/\/$/, "").split("/");
    return parseInt(parts[parts.length - 1]);
  };

  const handleFiles = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      const validFiles: File[] = [];
      const previews: FilePreview[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        if (file.type !== "application/pdf") {
          toast.error("Only PDF files are allowed");
        } else if (file.size / 1024 / 1024 > 50) {
          toast.error("File size too big (max 50MB)");
        } else {
          validFiles.push(file);
          previews.push({
            name: file.name,
            url: URL.createObjectURL(file),
            isPrivate: false,
          });
        }
      }

      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
      setFilePreviews((prevPreviews) => [...prevPreviews, ...previews]);
    }
  };

  const onChangeFiles = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.currentTarget.files);
  }, []);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    handleFiles(event.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setFilePreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );
  };

  const toggleprivate = (index: number) => {
    setFilePreviews((prevPreviews) =>
      prevPreviews.map((preview, i) =>
        i === index ? { ...preview, isPrivate: !preview.isPrivate } : preview
      )
    );
  };

  const closeModel = () => {
    setFiles([]);
    setFilePreviews([]);
    setSaving(false);
    setDragActive(false);
    setIsPasteReference(false);
    // setTextareaContent(""); // This state is now managed by TextSearch
    setIsOpen((prev) => !prev);
  };

  const delay = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));

  const incrementProgress = async (target: any) => {
    const current = await new Promise((resolve) => {
      setShowProgressBar((prev) => {
        resolve(prev);
        return prev;
      });
    });

    for (let i: any = current; i <= target; i += 5) {
      setShowProgressBar(i);
      await delay(100);
    }
  };

  const uploadFileFn = async () => {
    setSelectedPapers?.((prevSelectedPapers: any) => [
      ...prevSelectedPapers,
      ...files?.map((file, i) => ({
        ai_status: "Pending Upload",
        fileName: file.name,
        size: file.size,
        private: filePreviews?.[i]?.isPrivate,
      })),
    ]);
    closeModel();
    try {
      setSaving(true);

      await incrementProgress(20);

      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append("files", file);
        formData.append(
          `private[${index}]`,
          filePreviews[index].isPrivate.toString()
        );
      });

      formData.append("pathSegments", pathname?.replace("/explorer", ""));
      const folderId = getLastItemFromUrl(pathname);

      await incrementProgress(40);

      const parent_id = pathname.startsWith("/explorer")
        ? typeof folderId === "number"
          ? folderId
          : ""
        : "";

      await incrementProgress(60);

      const project_id: any =
        currentProject?.project?.id && currentProject?.project?.id !== null
          ? currentProject?.project?.id
          : localStorage.getItem("currentProject");

      const result = await UploadFile(formData, project_id, parent_id);

      await incrementProgress(100);

      if (result?.success) {
        toast.success(result?.message);
        dispatch(upload(true));
        route.push("/explorer");
      }
    } catch (error: any) {
      console.error("Error uploading files:", error);
      if (error?.status === 403) {
        toast.custom((t) => (
          <div
            className={`${t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <IoIosWarning className="text-yellow-500 text-md" />
                </div>
                <div className="ml-3 flex-1">
                  <Text>
                    {error?.response?.data?.message || "Error uploading files"}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        ));
      } else {
        toast.error(error?.response?.data?.message || "Error uploading files");
      }
    } finally {
      setSaving(false);
      setShowProgressBar(0);
      dispatch(upload(true));
    }
  };

  const getUserDetails = async () => {
    const userData: string | null =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : "";
    setUser(user);
    setIsPDFType("DOI");
    setSearchQuery("");
    setIsAdded({});
    // Reset authors expansion state
    setExpandedAuthors({});
    setAuthorsOverflow({});
  };

  const handleFavourite = async (paperId: number, url: any) => {
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
        fetchFolders(true);
        toast.success(response?.data?.message);
        setIsOpen(false);
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

  const toggleAllprivate = () => {
    setSelectAllPrivate(!selectAllPrivate);
    setFilePreviews((prevPreviews) =>
      prevPreviews.map((preview) => ({
        ...preview,
        isPrivate: !selectAllPrivate,
      }))
    );
  };

  // const onChangeNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!e.target.files) return;

  //   const newFiles = Array.from(e.target.files) as File[];

  //   setFiles((prevFiles) => [...prevFiles, ...newFiles]);

  //   const newPreviews = newFiles.map((file) => ({
  //     name: file.name,
  //     url: URL.createObjectURL(file),
  //     isPrivate: false,
  //   }));

  //   setFilePreviews((prev) => [...prev, ...newPreviews]);
  // };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        closeModel();
      }}
    >
      <Worker workerUrl={workerURL}>
        <DialogTrigger id="pdf-upload" asChild>
          {button ? (
            <button
              className="flex items-center gap-3 rounded-lg px-2 py-2 transition-all text-white hover:text-white/70"
              onClick={getUserDetails}
            >
              <CloudUpload
                className={`${!isSubfolder ? "h-4 w-4 p-0" : "h-[18px] w-[18px]"
                } `}
                color={"white"}
              />{" "}
              <p className={`${isSubfolder && "font-size-normal"}`}>
                {!isSubfolder ? " Upload file" : "Add Paper"}
              </p>
            </button>
          ) : (
            <div
              className="upload-file cursor-pointer"
              onClick={getUserDetails}
            >
              <div className="rounded-full h-7 w-7 grid place-items-center text-white text-[13px] bg-[#F59B14] text-xl">
                +
              </div>
              <span className="text-[#666666] text-[16px] name-1 dark:text-[#CCCCCC]">
                Upload Files
              </span>
              <span className="text-[#999999] text-[13px] dark:text-[#999999]">
                drag and drop file here
              </span>
            </div>
          )}
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-4xl">
          <DialogTitle>Upload file</DialogTitle>
          <DialogDescription>Select and upload a PDF file.</DialogDescription>

          {/* Search Section */}
          <div
            ref={dropdownRef}
            className="w-full relative justify-between mx-auto border border-gray-300 bg-white dark:bg-[#3A474B] dark:border-[#4D575A] py-4 rounded-lg px-8"
          >
            <form
              id="auto-complete-form"
              className="flex divide-x dark:divide-[#CCCCCC33]"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className="text-[13px] flex items-center flex-1">
                <GoSearch size={18} className="me-2" />
                <input
                  placeholder={`Search for ${isPDFType}`}
                  className="outline-none w-full dark:bg-[#3A474B] bg-transparent"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    debouncedSearch(e.target.value, isPDFType);
                  }}
                />
                {showSuggestions && (
                  <div className="absolute top-[4.5rem] w-full left-[0px] z-10">
                    <div className="bg-white dark:bg-[#2C3A3F] border border-gray-300 dark:border-[#2c3a3f] rounded-lg shadow-lg">
                      {suggestionsLoading ? (
                        <div className="w-full flex items-center justify-center text-[#9b9d9f] py-1 text-[14px] h-[210px]">
                          Loading
                          <Loader
                            variant="threeDot"
                            size="lg"
                            className="ms-1 pt-[10px]"
                          />
                        </div>
                      ) : (
                        <ul className="max-h-[208px] overflow-y-auto flex flex-col pb-4">
                          <TooltipProvider>
                            {suggestions?.length > 0 ? (
                              [...suggestions]
                                .sort((a, b) => {
                                  const aIsPdf = a?.data?.type === "pdf" ? 1 : 0;
                                  const bIsPdf = b?.data?.type === "pdf" ? 1 : 0;
                                  return bIsPdf - aIsPdf;
                                })
                                .map((item, i) => {
                                  return (
                                    <li
                                      className="flex justify-between px-4 pt-4 mb-2 flex-row items-center gap-3"
                                      key={i}
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 leading-tight mb-1">
                                          {isPDFType === "DOI" ? item?.title : item?.title}
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
                                                  className="absolute !right-[-20px] top-0 text-xs text-blue-600 hover:underline z-20 transition-opacity duration-300 opacity-90 hover:opacity-100 bg-white dark:bg-[#2C3A3F] px-1 rounded"
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
                                      </div>
                                   <div className="flex justify-center gap-2 mt-2">
                                        <Button
                                          className="h-8 button-full preview-button"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            window.open(
                                              item?.openAccessPdf?.url || item.URL,
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
                                                handleFavourite(i, item?.openAccessPdf?.url || item.URL);
                                              }}
                                            >
                                              {item?.data?.type === "pdf" || item?.is_disable_url === false ? (
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
                                No Data Found
                              </li>
                            )}
                          </TooltipProvider>
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>

              
              <div className="flex items-center gap-4 ps-6 justify-evenly">
                <div>
                  <Select
                    value={isPDFType}
                    onValueChange={(status: string) => {
                      setIsPDFType(status);
                    }}
                  >
                    <SelectTrigger>
                      <div className="flex items-center gap-6 border px-[10px] py-[6px] rounded-[7px] border-[#CCCCCC] w-[120px]">
                        <div className="flex items-center gap-[6px] w-[60px]">
                          <div className={`w-[7px] h-[7px] rounded-full`} />
                          <p className="text-xs font-normal">
                            {isPDFType.charAt(0).toUpperCase() +
                              isPDFType.slice(1)}
                          </p>
                        </div>
                        <ChevronDown size={"14px"} color="#999999" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-inputBackground text-darkGray">
                      {AUTO_IMPORT_PDF_TYPE.map((item, index) => {
                        return (
                          <SelectItem key={index} value={item?.label}>
                            {item?.label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          </div>

              {  isPasteReference &&      <div className="mt-4 relative textarea-container">
              <TextSearch
                placeholder="Enter your paper references here to search for papers"
                className="w-full h-full"
                projectId={currentProject?.project?.id}
                onPaperAdd={(paperId, url) => {
                  fetchFolders?.(true);
                }}
              />
            </div>}
           { !isPasteReference && <>
           <hr className="w-full mt-1  mx-auto border-t border-gray-300 dark:border-gray-600 my-1" />
           
           <div className="  rounded-[26px] flex justify-center items-center w-full max-w-[200px] mx-auto text-sm text-[#4b4b4b] dark:text-[#fff] px-4 py-2   bg-[#d8e8ff] dark:bg-[#183450] cursor-pointer hover:bg-[#d0eafd]"
            onClick={() => {
              setIsPasteReference(true);
            }}
            >
                Paste Reference
            </div>
           <hr className="w-full mx-auto border-t border-gray-300 dark:border-gray-600 mb-2" />
           </>
          }
          {/* File Upload Section */}
          <form
            className="grid gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              uploadFileFn();
            }}
          >
            {/* File Previews Section */}
            {filePreviews.length > 0 ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Selected Files:</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all-private"
                      checked={selectAllPrivate}
                      onCheckedChange={toggleAllprivate}
                    />
                    <label
                      htmlFor="select-all-private"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Make all private
                    </label>
                  </div>
                </div>
                <div className="space-y-3 max-h-[calc(98vh-430px)] overflow-y-auto">
                  {filePreviews.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-2 py-2 border rounded-lg dark:border-[#4D575A]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-[#2C3A3F] rounded">
                          <svg
                            className="h-5 w-5 text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium line-clamp-1">
                            {file.name}
                          </p>
                          {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(files[index].size / 1024 / 1024).toFixed(2)} MB
                          </p> */}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`private-${index}`}
                            checked={file.isPrivate}
                            onCheckedChange={() => toggleprivate(index)}
                          />
                          <label
                            htmlFor={`private-${index}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Private
                          </label>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            removeFile(index);
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className={`relative mt-2 flex h-48 cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-white dark:bg-[#3A474B] dark:border-[#4D575A] shadow-sm transition-all hover:bg-gray-50 ${dragActive ? "border-2 border-black" : ""
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(false);
                }}
                onDrop={handleDrop}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={onChangeFiles}
                  multiple
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-full"
                >
                  <svg
                    className="h-7 w-7 text-gray-500 dark:text-[#cccccc] transition-all duration-75 group-hover:scale-110 group-active:scale-95"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                    <path d="M12 12v9"></path>
                    <path d="m16 16-4-4-4 4"></path>
                  </svg>
                  <p className="mt-2 text-center text-sm text-gray-500 dark:text-[#cccccc]">
                    Drag and drop or click to upload.
                  </p>
                  <p className="mt-2 text-center text-sm text-gray-500 dark:text-[#cccccc]">
                    Max file size: 50MB
                  </p>
                </label>
              </div>
            )}
            <input
              id="file-upload2"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={onChangeFiles}
              multiple
            />
            {filePreviews.length > 0 && (
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="mt-4 button-outline rounded-[26px]"
                  onClick={() =>
                    document.getElementById("file-upload2")?.click()
                  }
                >
                  Add more
                </button>
                <button
                  type="submit"
                  disabled={saving || files.length === 0}
                  className="mt-4 butt button-full rounded-[26px]"
                >
                  Upload Files
                </button>
              </div>
            )}
          </form>
          
        </DialogContent>
      </Worker>
    </Dialog>
  );
};

export default Uploader;
