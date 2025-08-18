import React, { useEffect, useState } from "react";
import { X, CloudUpload } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { refreshData } from "@/redux/services/folderSlice";
import { Button, Loader } from "rizzui";
import csv from "csv-parser";
import { Readable } from "stream";
import { importPaperPdf } from "@/apis/explore";
import { fetchAccessData, fetchFolderData, findById } from "@/apis/user";
import { usePathname } from "next/navigation";
import { OptimizedImage } from "../ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";
import TextSearch from "../TextSearch/TextSearch";

interface ImportDocs {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  fetchFolders?: () => void;
}

export const ImportDocs: React.FC<ImportDocs> = ({
  isOpen,
  onOpenChange,
  fetchFolders,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const [filePreviews, setFilePreviews] = useState<
    { name: string; progress: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [zoteroLoading, setZoteroLoading] = useState(false);
  const [mendeleyLoading, setMendeleyLoading] = useState(false);

  const [apiKey, setApiKey] = useState("");
  const [showDesign, setShowDesign] = useState(false);
  const [filesConfirm, setFilesConfirm] = useState(false);
  const [showError, setShowError] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  const [showCloud, setShowCloud] = useState(true);
  const [showMendeleyButton, setShowMendeleyButton] = useState(true);
  const [showZoteroButton, setShowZoteroButton] = useState(true);
  const [isPasteReference, setIsPasteReference] = useState(false);

  const [userId, setUserId] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [multiImport, setMultiImport] = useState(false);
  const pathname = usePathname();

  const [collections, setCollections] = useState<
    { key: string; name: string }[]
  >([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [loadingCollection, setLoadingCollection] = useState<any>({});
  const [accessToken, setAccessToken] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [zoteroPreviews, setZoteroPreviews] = useState<
    { url: string; name: string }[]
  >([]);
  const [zoteroUrls, setZoteroUrls] = useState([]);
  const [fileLength, setFileLength] = useState<number>(0);
  const [selectedCollectionFiles, setSelectedCollectionFiles] = useState<any>(
    {}
  );
  const [selectedCollectionPapers, setSelectedCollectionPapers] = useState<{
    [key: string]: string[];
  }>({});
  const [platForm, setPlatForm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const dispatch = useDispatch();

  const userData = useSelector((state: any) => state?.user?.user?.user);
  const currentWorkspace = useSelector((state: any) => state?.workspace);
  const currentProject = useSelector((state: any) => state?.project);

  const workspaceId = currentWorkspace?.workspace?.id;
  const projectId = currentProject?.project?.id;

  const getLastItemFromUrl = (url: string) => {
    const parts = url.replace(/\/$/, "").split("/");
    return parseInt(parts[parts.length - 1]);
  };

  const folderId = getLastItemFromUrl(pathname);

  const handleZoteroImport = async () => {
    setPlatForm("Zotero");
    setConnectionError(false);
    setZoteroLoading(true);

    try {
      const response = await findById(userData?.id);
      const zoteroApiKey = response?.data?.data?.zotero_api_key;

      if (!zoteroApiKey) {
        setConnectionError(true);
        setZoteroLoading(false);
        return;
      }

      setApiKey(zoteroApiKey);

      setIsExpanded(true);

      await handleZoteroApiKeyLink(zoteroApiKey);

      setShowCloud(false);
      setShowZoteroButton(false);
      setShowMendeleyButton(false);
    } catch (error) {
      console.error("Error importing from Zotero:", error);
      setConnectionError(true);
    } finally {
      setZoteroLoading(false);
    }
  };
  const fetchZoteroUserId = async (apiKey: string) => {
    try {
      const response = await fetch("https://api.zotero.org/keys/current", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data.userID;
    } catch (error) {
      console.error("Error fetching Zotero user ID:", error);
      return null;
    }
  };

  const handleMendeleyImport = async () => {
    setPlatForm("Mendeley");
    setConnectionError(false);
    setMendeleyLoading(true);

    try {
      const response = await findById(userData?.id);

      const mendeleyAccessToken = response?.data?.data?.mendeley_access_token;

      if (!mendeleyAccessToken) {
        setConnectionError(true);
        setMendeleyLoading(false);
        return;
      }

      setAccessToken(mendeleyAccessToken);

      setIsExpanded(true);

      await fetchAccessToken(mendeleyAccessToken);

      setShowCloud(false);
      setShowZoteroButton(false);
      setShowMendeleyButton(false);
    } catch (error) {
      console.error("Error importing from Mendeley:", error);
      setConnectionError(true);
    } finally {
      setMendeleyLoading(false);
    }
  };
  const fetchZoteroCollections = async (userId: any, apiKey: string) => {
    try {
      const response: Response = await fetch(
        `https://api.zotero.org/users/${userId}/collections/`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      const extractedData = data.map((item: any) => ({
        key: item.data.key,
        name: item.data.name,
      }));

      setCollections(extractedData);

      return extractedData;
    } catch (error) {
      console.error("Error fetching Zotero collections:", error);
      return null;
    }
  };
  const fetchZoteroLibrary = async (userId: string, apiKey: string) => {
    try {
      const response = await fetch(
        `https://api.zotero.org/users/${userId}/items`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      if (!response.ok) {
        console.error("Failed to fetch Zotero library");
        return [];
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching Zotero library:", error);
      return [];
    }
  };
  function getPDFUrls(items: any[]): string[] {
    return items
      .filter((item: any) => item.data.contentType === "application/pdf")
      .map((item: any) => item.links.enclosure.href);
  }
  function getPDFName(items: any[]): { url: string; name: string }[] {
    return items
      .filter((item: any) => item.data.contentType === "application/pdf")
      .map((item: any) => ({
        url: item.links.enclosure.href,
        name: item.data.title || item.links.enclosure.title || "Unnamed PDF",
      }));
  }
  const handleZoteroApiKeyLink = async (zoteroApiKey: any) => {
    const userId = await fetchZoteroUserId(zoteroApiKey);
    setUserId(userId);

    await fetchZoteroCollections(userId, zoteroApiKey);

    if (!userId) {
      setLoading(false);
      setShowDesign(false);
      return;
    }
    const library = await fetchZoteroLibrary(userId, zoteroApiKey);

    const filteredLibraryUrls: any = getPDFUrls(library);

    const previewName = getPDFName(library);

    setZoteroUrls(filteredLibraryUrls);
    setZoteroPreviews(previewName);
    setShowDesign(true);
    setLoading(false);
  };

  const getCollectionItems = async (collectionKey: any) => {
    try {
      const response = await fetch(
        `https://api.zotero.org/users/${userId}/collections/${collectionKey}/items`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const filteredLibraryUrls: any = getPDFUrls(data);

      const previewName = getPDFName(data);
      return previewName || [];
    } catch (error) {
      console.error("Error fetching Zotero user ID:", error);
      return [];
    }
  };
  const handleCollectionClick = async (
    platForm: string,
    index: number,
    collectionKey: string
  ) => {
    const isCurrentlySelected = selectedCollections.includes(collectionKey);

    setSelectedCollections((prev: string[]) => {
      const newSelected = isCurrentlySelected
        ? prev.filter((key) => key !== collectionKey)
        : [...prev, collectionKey];

      if (!newSelected.includes(collectionKey)) {
        setSelectedCollectionPapers((prevPapers) => {
          const newSelectedPapers = { ...prevPapers };
          delete newSelectedPapers[collectionKey];
          return newSelectedPapers;
        });
        setSelectedCollectionFiles((prevFiles: any) => {
          const newFiles = { ...prevFiles };
          delete newFiles[collectionKey];
          return newFiles;
        });
      }

      return newSelected;
    });

    if (!isCurrentlySelected) {
      setLoadingCollection((prev: any) => ({ ...prev, [collectionKey]: true }));

      try {
        let papers: any[] = [];
        if (platForm === "Zotero") {
          papers = await getCollectionItems(collectionKey);
        } else {
          const response = await fetchFolderData(accessToken, collectionKey);
          papers = response?.data?.files || [];
        }

        setSelectedCollectionFiles((prev: any) => ({
          ...prev,
          [collectionKey]: papers,
        }));
      } catch (error) {
        console.error(
          `Error fetching papers for collection ${collectionKey}:`,
          error
        );
      } finally {
        setLoadingCollection((prev: any) => ({
          ...prev,
          [collectionKey]: false,
        }));
      }
    }
  };

  const handleCollectionPaperSelection = (
    collectionKey: string,
    paperUrl: string
  ) => {
    setSelectedCollectionPapers((prev) => {
      const currentSelected = prev[collectionKey] || [];
      if (currentSelected.includes(paperUrl)) {
        return {
          ...prev,
          [collectionKey]: currentSelected.filter((url) => url !== paperUrl),
        };
      } else {
        return {
          ...prev,
          [collectionKey]: [...currentSelected, paperUrl],
        };
      }
    });
  };

  const handleSelectAllPapers = (collectionKey: string, papers: any[]) => {
    const allPaperUrls = papers.map((paper) => paper.url);
    setSelectedCollectionPapers((prev) => ({
      ...prev,
      [collectionKey]: allPaperUrls,
    }));
  };

  const handleDeselectAllPapers = (collectionKey: string) => {
    setSelectedCollectionPapers((prev) => {
      const newSelected = { ...prev };
      delete newSelected[collectionKey];
      return newSelected;
    });
  };

  const importThirdPartyFiles = async () => {
    setLoading(true);

    const collectionItems = Object.entries(selectedCollectionPapers).flatMap(
      ([collectionKey, selectedUrls]) => {
        const collectionFiles = selectedCollectionFiles[collectionKey] || [];
        return collectionFiles
          .filter((file: any) => selectedUrls.includes(file.url))
          .map((file: any) => ({
            url: file.url,
            name: file.name || "Unnamed document",
          }));
      }
    );

    const selectedItems = selectedFiles.map((index) => ({
      url: zoteroUrls[index],
      name: zoteroPreviews[index]?.name || "Unnamed document",
    }));

    const allItemsToImport = [...selectedItems, ...collectionItems];

    if (allItemsToImport.length === 0) {
      toast.error("Please select at least one paper to import!");
      setLoading(false);
      return;
    }

    const parent_id = pathname.startsWith("/explorer")
      ? typeof folderId === "number"
        ? folderId
        : ""
      : "";

    try {
      await importPaperPdf({
        access_token: accessToken,
        parent_id: parent_id,
        urls: allItemsToImport,
        workspace_id: workspaceId,
        project_id: projectId,
        apiKey,
        platForm,
      });

      toast.success("PDFs imported successfully and processing begins!");
      setShowDesign(false);
    } catch (error) {
      console.error("Error importing files:", error);
    } finally {
      setLoading(false);
      onOpenChange(false);
      if (fetchFolders) fetchFolders();
      dispatch(refreshData());
      setSelectedFiles([]);
      setSelectedCollectionPapers({});
    }
  };

  const toggleSelection = (index: number) => {
    setSelectedFiles((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  useEffect(() => {
    if (searchQuery) {
      setIsLoadingSearch(true);
      const loadAllCollectionPapers = async () => {
        const loadPromises = collections.map(async (collection) => {
          if (!selectedCollectionFiles[collection.key]) {
            setLoadingCollection((prev: any) => ({
              ...prev,
              [collection.key]: true,
            }));
            try {
              const papers =
                platForm === "Zotero"
                  ? await getCollectionItems(collection.key)
                  : (await fetchFolderData(accessToken, collection.key))?.data
                      ?.files;

              setSelectedCollectionFiles((prev: any) => ({
                ...prev,
                [collection.key]: papers || [],
              }));
            } catch (error) {
              console.error("Error loading collection papers:", error);
            } finally {
              setLoadingCollection((prev: any) => ({
                ...prev,
                [collection.key]: false,
              }));
            }
          }
        });

        await Promise.all(loadPromises);
        setIsLoadingSearch(false);
      };

      loadAllCollectionPapers();
    }
  }, [searchQuery, collections, platForm, accessToken]);

  const filteredCollections = collections.filter((collection: any) => {
    if (!searchQuery) return true;
    const collectionFiles = selectedCollectionFiles[collection.key] || [];
    return collectionFiles.some((file: any) =>
      file?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase() || "")
    );
  });

  const filteredPreviews = zoteroPreviews?.filter((file: any) =>
    file?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase() || "")
  );

  const supportedExtensions = ["bib", "csv", "ris", "txt"];

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files || []);

    const filteredFiles = selectedFiles?.filter((file: any) => {
      const extension = file?.name?.split(".")?.pop()?.toLowerCase() || "";

      return (
        supportedExtensions.includes(extension) &&
        !files?.some((existingFile: any) => existingFile?.name === file?.name)
      );
    });

    let urls: any = [];
    for (const file of selectedFiles) {
      const content = await file.text();

      const extension = file?.name?.split(".")?.pop()?.toLowerCase();

      if (extension === "bib") {
        const urlBibTex = extractFileLinkFromBibTex(content);
        urls = [...urls, ...urlBibTex];
      } else if (extension === "ris") {
        const urlRis = extractURLFromRIS(content);
        urls = [...urls, ...urlRis];
      } else if (extension === "txt") {
        const urlPubMed = pubmedFileLinks(content);
        urls = [...urls, ...urlPubMed];
      } else if (extension === "csv") {
        const csvUrls: any = await extractFileLinksFromCSV(content);
        urls = [...urls, ...csvUrls];
      } else {
        console.log("File extension is not supported for PDF creation.");
      }
    }

    const fileLength = urls?.length;
    setFileLength(fileLength);

    const hasCombineFile = filteredFiles?.some((file: any) =>
      file?.name?.toLowerCase()?.startsWith("combine")
    );

    if (hasCombineFile) {
      setMultiImport(true);
    }

    setFiles((prevFiles) => [...prevFiles, ...filteredFiles]);

    const newPreviews = filteredFiles.map((file) => ({
      name: file.name,
      progress: 0,
    }));
    setFilePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);

    event.target.value = "";
  };

  const truncateFileName = (fileName: string) => {
    if (!fileName.includes(" ")) {
      return fileName.length > 20 ? `${fileName.slice(0, 20)}...` : fileName;
    } else {
      const words = fileName.split(" ");
      return words.length > 4 ? `${words.slice(0, 4).join(" ")}...` : fileName;
    }
  };

  async function extractFileLinksFromCSV(csvContent: any): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const fileLinks: string[] = [];
      const readable = Readable.from([csvContent]);

      readable
        .pipe(csv())
        .on("data", (row) => {
          if (
            row["file_link"] &&
            typeof row["file_link"] === "string" &&
            row["file_link"].startsWith("http")
          ) {
            fileLinks.push(row["file_link"]);
          } else {
          }
        })
        .on("end", () => {
          resolve(fileLinks);
        })
        .on("error", (error) => {
          console.error("Error Parsing CSV:", error);
          reject(error);
        });
    });
  }

  function extractFileLinkFromBibTex(content: string): string[] {
    const fileLinkRegex = /file_link\s*=\s*\{([^}]+)\}/g;
    const matches: RegExpExecArray[] = [];
    let match: RegExpExecArray | null;
    while ((match = fileLinkRegex.exec(content)) !== null) {
      matches.push(match);
    }
    return matches.map((match) => match[1].trim());
  }

  function pubmedFileLinks(content: string): string[] {
    const flLinkRegex = /FL\s*-\s*(https?:\/\/[^\s]+)/g;
    const matches = [];
    let match;

    while ((match = flLinkRegex.exec(content)) !== null) {
      matches.push(match[1].trim());
    }

    return matches;
  }

  function extractURLFromRIS(risData: any): string[] {
    const urlRegex = /UR\s*-\s*(https?:\/\/[^\s]+)/g;
    const matches = [];
    let match;

    while ((match = urlRegex.exec(risData)) !== null) {
      matches.push(match[1]);
    }

    return matches;
  }

  const importFiles = async () => {
    setLoading(true);
    for (const file of files) {
      const content = await file.text();

      const extension = file?.name?.split(".")?.pop()?.toLowerCase();

      if (extension === "bib") {
        const urlBibTex = extractFileLinkFromBibTex(content);

        try {
          const urlsWithNames = urlBibTex.map((url) => ({
            url: url,
            name: file.name,
          }));

          await importPaperPdf({
            urls: urlsWithNames,
            project_id: currentProject?.project?.id,
          });
        } catch (error) {
          console.error("Error creating PDF for .bib file", error);
        }
      } else if (extension === "ris") {
        const urlRis = extractURLFromRIS(content);
        try {
          const urlsWithNames = urlRis.map((url) => ({
            url: url,
            name: file.name,
          }));
          await importPaperPdf({
            urls: urlsWithNames,
            project_id: currentProject?.project?.id,
          });
        } catch (error) {
          console.error("Error creating PDF for .ris file", error);
        }
      } else if (extension === "txt") {
        const urlPubMed = pubmedFileLinks(content);

        try {
          const urlsWithNames = urlPubMed.map((url) => ({
            url: url,
            name: file.name,
          }));
          await importPaperPdf({
            urls: urlsWithNames,
            project_id: currentProject?.project?.id,
          });
        } catch (error) {
          console.error("Error creating PDF for .txt file", error);
        }
      } else if (extension === "csv") {
        const urls: any = await extractFileLinksFromCSV(content);
        try {
          const urlsWithNames = urls.map((url: string) => ({
            url: url,
            name: file.name,
          }));

          await importPaperPdf({
            urls: urlsWithNames,
            project_id: currentProject?.project?.id,
          });
        } catch (error) {
          console.error("Error creating PDF for .txt file", error);
        }
      } else {
        console.log("File extension is not supported for PDF creation.");
      }
    }
    setLoading(false);
    if (fetchFolders) fetchFolders();
    dispatch(refreshData());
    onOpenChange(false);
  };

  const transformMendeleyData = (files: any[]) => {
    return files.map((file, index) => ({
      url: file?.url,
      name: file?.name || `Untitled document ${index + 1}.pdf`,
    }));
  };

  const getUrlsFromFileDetails = (fileDetails: any) => {
    return fileDetails.map((file: any) => file.url);
  };
  const fetchAccessToken = async (token: string) => {
    try {
      const code = null;
      const response: any = await fetchAccessData(code, token);
      const papers = response?.data?.files || [];
      const folders = response?.data?.folders || [];
      const accessToken = response?.data?.accessToken;

      setAccessToken(accessToken);

      const extractedData = folders.map((item: any) => ({
        key: item.id,
        name: item.name,
      }));

      setCollections(extractedData);

      const formattedPapers = transformMendeleyData(papers);
      const urls = getUrlsFromFileDetails(formattedPapers);
      setZoteroUrls(urls);
      setZoteroPreviews(formattedPapers);
      setShowDesign(true);
    } catch (error) {}
  };

  const removeFile = async (index: number) => {
    const removedFile = files[index];
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    const newPreviews = [...filePreviews];
    newPreviews.splice(index, 1);
    setFilePreviews(newPreviews);

    setShowError(false);
    setShowErrors(false);

    const hasCombineFile = newPreviews?.some((file: any) =>
      file?.name?.toLowerCase()?.includes("combine")
    );

    if (!hasCombineFile) {
      setMultiImport(false);
    }

    let urlsToRemoveCount = 0;

    const extension = removedFile?.name?.split(".")?.pop()?.toLowerCase();

    const content = await removedFile.text();

    if (extension === "bib") {
      const urlBibTex = extractFileLinkFromBibTex(content);
      urlsToRemoveCount = urlBibTex.length;
    } else if (extension === "ris") {
      const urlRis = extractURLFromRIS(content);
      urlsToRemoveCount = urlRis.length;
    } else if (extension === "txt") {
      const urlPubMed = pubmedFileLinks(content);
      urlsToRemoveCount = urlPubMed.length;
    } else if (extension === "csv") {
      const csvUrls: any = await extractFileLinksFromCSV(content);
      urlsToRemoveCount = csvUrls.length;
    }

    setFileLength((prevLength: number) => prevLength - urlsToRemoveCount);
  };

  const handleButtonClick = () => {
    if (platForm) {
      importThirdPartyFiles();
    } else {
      if (fileLength === 0) {
        setShowErrors(true);
        onOpenChange(true);
        return;
      }
      if (!multiImport) {
        importFiles();
        return;
      }

      if (!filesConfirm) {
        setShowError(true);
      } else {
        setShowError(false);
        importFiles();
      }
    }
  };

  const handleCheckboxChange = (e: any) => {
    setFilesConfirm(e.target.checked);
    if (e.target.checked) {
      setShowError(false);
    }
  };

  return (
    <>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => onOpenChange(true)}
          ></div>
          <div
            className={`bg-profileDropDown dark:bg-gray-800 p-4 shadow-lg h-full fixed top-0 right-0 z-50 overflow-y-auto flex flex-col justify-start gap-y-3 transition-all duration-300 ease-in-out ${
              isExpanded ? "w-[80%]" : "w-[388px]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-600 py-2">
              <span className="text-sm font-size-large font-semibold text-lightGray dark:text-gray-200 capitalize">
                IMPORT
              </span>
              <X
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
                color="#9A9A9A"
                width={20}
                height={20}
              />
            </div>
           { isPasteReference && <div className="mt-4 relative textarea-container">
              <TextSearch
                placeholder="Enter your paper references here to search for papers"
                className="w-full h-full"
                projectId={currentProject?.project?.id}
                layout="import-docs"
                onPaperAdd={(paperId, url) => {
                  if (fetchFolders) fetchFolders();
                }}
              />
            </div>}
           {!isPasteReference && 
           <div className=" rounded-[26px] flex justify-center items-center w-full max-w-[200px] mx-auto text-sm text-[#4b4b4b] dark:text-[#fff] px-4 py-2   bg-[#d8e8ff] dark:bg-[#183450] cursor-pointer hover:bg-[#d0eafd]"
           onClick={() => {
            setIsPasteReference(true);
          }}
           >
              Paste Reference
            </div>
            }

            <hr className="w-full mt-1  mx-auto border-t border-gray-300 dark:border-gray-600 my-1" />

            <>
              <div>
                <p className="font-semibold font-size-small text-lightGray dark:text-gray-200">
                  SELECT FILE / FOLDER
                </p>
                {showError && (
                  <p className="font-semibold py-2 rounded-sm font-size-small mt-2 text-lightGray dark:text-gray-200 bg-red-300 dark:bg-red-900 flex justify-center items-center">
                    Please Confirm Your Imports
                  </p>
                )}
                {showErrors && (
                  <p className="font-semibold py-2 rounded-sm font-size-small mt-2 text-lightGray dark:text-gray-200 bg-red-300 dark:bg-red-900 flex justify-center items-center">
                    please import a valid file with file Location and Title{" "}
                  </p>
                )}

                {connectionError && (
                  <p className="font-semibold text-lightGray dark:text-gray-200 w-full bg-red-300 dark:bg-red-900 rounded-sm text-sm mt-2">
                    {`Unable to make a connection to ${platForm},click this link `}
                    <span
                      className="text-blue-600 dark:text-blue-400 hover:cursor-pointer"
                      onClick={() => router.push("/account/integrations")}
                    >
                      Integrations
                    </span>
                    {` to check the connection.`}
                  </p>
                )}
              </div>
              {showCloud && (
                <div className="border-gray-300 dark:border-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center h-[286px] w-full px-3 border border-blue-600 dark:border-blue-400 rounded-lg mb-3 bg-[#D8E8FF66] dark:bg-gray-700 relative cursor-pointer"
                  >
                    <div className="mb-4 text-4xl text-gray-500 dark:text-gray-300">
                      <div className="flex items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500 p-2">
                        <CloudUpload className="h-5 w-5 p-0 text-white" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center space-y-2 text-center">
                      <span className="flex justify-center items-center whitespace-nowrap gap-x-2">
                        <p className="text-blue-600 dark:text-blue-400 font-size-mediumup font-medium">
                          Click to upload
                        </p>
                        <p className="dark:text-gray-200"> or drag and drop </p>
                      </span>

                      <div className="text-lightGray dark:text-gray-300 font-size-normal font-normal">
                        CSV, RIS, BibTex, PubMed
                      </div>
                      <div className="text-lightGray dark:text-gray-300 font-size-normal font-normal">
                        (max. 500MB)
                      </div>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".csv, .ris, .bib, .txt"
                      multiple
                      className="sr-only"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {showCloud && (
                  <div className="flex flex-col gap-4">
                    <span
                      className="text-blue-500  dark:text-blue-400 text-sm cursor-pointer hover:text-blue-600 dark:hover:text-blue-300"
                      onClick={() => {
                        setConnectionError(false);
                      }}
                    >
                      Import from third-party service
                    </span>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {showZoteroButton && (
                        <button
                          className="w-full h-10 px-3 py-2 rounded-full font-medium text-sm flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                          onClick={handleZoteroImport}
                        >
                          {zoteroLoading ? (
                            <Loader />
                          ) : (
                            <>
                              <OptimizedImage
                                src={
                                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//zotreoShort.svg`
                                }
                                alt="Zotero Image"
                                width={35}
                                height={35}
                                className="flex-shrink-0 mt-1" 
                              />
                              <span className="dark:text-gray-200 truncate">
                                Zotero
                              </span>
                            </>
                          )}
                        </button>
                      )}
                      {showMendeleyButton && (
                        <button
                          className="w-full h-10 px-3 py-2 rounded-full font-medium text-sm flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                          onClick={handleMendeleyImport}
                        >
                          {mendeleyLoading ? (
                            <Loader />
                          ) : (
                            <>
                              <OptimizedImage
                                src={
                                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//mendeley-text.svg`
                                }
                                alt="Mendeley Image"
                                width={30}
                                height={30}
                                className="flex-shrink-0"
                              />
                              <span className="dark:text-gray-200 truncate">
                                Mendeley
                              </span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              

              <div>
                {showDesign && (
                  <>
                    <div className="relative flex items-center mb-4">
                      <span className="absolute left-3 text-gray-500 dark:text-gray-400">
                        <OptimizedImage
                          src={
                            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//search.svg`
                          }
                          alt="search icon"
                          width={ImageSizes.icon.xs.width}
                          height={ImageSizes.icon.xs.height}
                        />
                      </span>
                      <input
                        id="content"
                        placeholder="Search your papers"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-inputBackground dark:bg-gray-700 border outline-none tableBorder dark:border-gray-600 text-foreground dark:text-gray-200 text-sm rounded-full block w-full pl-10 p-2.5"
                        required
                      />
                    </div>
                    <div className="flex flex-col w-full px-2 overflow-y-auto h-full bg- mt-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isLoadingSearch ? (
                          <div className="col-span-2 flex justify-center items-center py-8">
                            <div className="text-lightGray dark:text-gray-300">
                              Loading papers...
                            </div>
                          </div>
                        ) : (
                          <>
                            {filteredCollections.length > 0 && (
                              <div className="col-span-1">
                                <h3 className="text-sm font-semibold text-lightGray dark:text-gray-200 mb-3">
                                  Collections
                                </h3>
                                {filteredCollections.map(
                                  (collection: any, index: any) => {
                                    const isSelected =
                                      selectedCollections.includes(
                                        collection.key
                                      );
                                    const collectionKey = collection?.key;
                                    const collectionFiles =
                                      selectedCollectionFiles[collectionKey] ||
                                      [];
                                    const isLoading =
                                      loadingCollection[collectionKey];

                                    return (
                                      <div key={index} className="mb-4">
                                        <div
                                          onClick={() =>
                                            handleCollectionClick(
                                              platForm,
                                              index,
                                              collectionKey
                                            )
                                          }
                                          className={`flex items-center space-x-2 rounded-lg py-3 px-3 cursor-pointer transition-colors ${
                                            isSelected
                                              ? "bg-blue-100 dark:bg-blue-900 border border-blue-500 dark:border-blue-400"
                                              : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                          }`}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() =>
                                              handleCollectionClick(
                                                platForm,
                                                index,
                                                collectionKey
                                              )
                                            }
                                            className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                          <OptimizedImage
                                            src={
                                              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//folder.svg`
                                            }
                                            alt="Folder Icon"
                                            className="h-6 w-6"
                                            width={ImageSizes.icon.md.width}
                                            height={ImageSizes.icon.md.height}
                                          />
                                          <p className="font-normal font-size-medium text-lightGray dark:text-gray-200">
                                            {collection?.name}
                                          </p>
                                        </div>

                                        {isSelected && isLoading && (
                                          <div className="mt-2 ml-8">
                                            <p className="text-lightGray dark:text-gray-300">
                                              Loading papers...
                                            </p>
                                          </div>
                                        )}

                                        {isSelected &&
                                          !isLoading &&
                                          collectionFiles.length > 0 && (
                                            <div className="mt-2 ml-8 space-y-2">
                                              <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-lightGray dark:text-gray-300">
                                                  {collectionFiles.length}{" "}
                                                  papers
                                                </span>
                                                <button
                                                  onClick={() => {
                                                    const isAllSelected =
                                                      (
                                                        selectedCollectionPapers[
                                                          collectionKey
                                                        ] || []
                                                      ).length ===
                                                      collectionFiles.length;
                                                    if (isAllSelected) {
                                                      handleDeselectAllPapers(
                                                        collectionKey
                                                      );
                                                    } else {
                                                      handleSelectAllPapers(
                                                        collectionKey,
                                                        collectionFiles
                                                      );
                                                    }
                                                  }}
                                                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                                                >
                                                  {(
                                                    selectedCollectionPapers[
                                                      collectionKey
                                                    ] || []
                                                  ).length ===
                                                  collectionFiles.length
                                                    ? "Deselect All"
                                                    : "Select All"}
                                                </button>
                                              </div>
                                              {collectionFiles
                                                .filter(
                                                  (paper: any) =>
                                                    !searchQuery ||
                                                    paper?.name
                                                      ?.toLowerCase()
                                                      ?.includes(
                                                        searchQuery?.toLowerCase() ||
                                                          ""
                                                      )
                                                )
                                                .map(
                                                  (
                                                    paper: any,
                                                    fileIndex: number
                                                  ) => {
                                                    const isPaperSelected = (
                                                      selectedCollectionPapers[
                                                        collectionKey
                                                      ] || []
                                                    ).includes(paper.url);
                                                    return (
                                                      <div
                                                        key={fileIndex}
                                                        className={`flex items-center space-x-2 p-2 border-l-2 border-blue-500 dark:border-blue-400 bg-gray-50 dark:bg-gray-700 rounded-r cursor-pointer transition-colors ${
                                                          isPaperSelected
                                                            ? "bg-blue-50 dark:bg-blue-900"
                                                            : ""
                                                        }`}
                                                        onClick={() =>
                                                          handleCollectionPaperSelection(
                                                            collectionKey,
                                                            paper.url
                                                          )
                                                        }
                                                      >
                                                        <input
                                                          type="checkbox"
                                                          checked={
                                                            isPaperSelected
                                                          }
                                                          onChange={() =>
                                                            handleCollectionPaperSelection(
                                                              collectionKey,
                                                              paper.url
                                                            )
                                                          }
                                                          className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400"
                                                          onClick={(e) =>
                                                            e.stopPropagation()
                                                          }
                                                        />
                                                        <OptimizedImage
                                                          src={
                                                            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//pdf.svg`
                                                          }
                                                          alt="Paper Icon"
                                                          width={
                                                            ImageSizes.icon.sm
                                                              .width
                                                          }
                                                          height={
                                                            ImageSizes.icon.sm
                                                              .height
                                                          }
                                                          className="h-5 w-5"
                                                        />
                                                        <p className="font-normal text-lightGray dark:text-gray-200 text-sm break-all">
                                                          {paper.name ||
                                                            "Untitled Paper"}
                                                        </p>
                                                      </div>
                                                    );
                                                  }
                                                )}
                                            </div>
                                          )}
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}

                            {filteredPreviews.length > 0 && (
                              <div className="col-span-1">
                                <h3 className="text-sm font-semibold text-lightGray dark:text-gray-200 mb-3">
                                  Individual Papers
                                </h3>
                                <div className="space-y-2">
                                  {filteredPreviews.map((file, index) => {
                                    const isSelected =
                                      selectedFiles.includes(index);
                                    const fileName = file?.name
                                      ? file?.name
                                          .split(" ")
                                          .slice(0, 10)
                                          .join(" ") +
                                        (file?.name.split(" ").length > 6
                                          ? "..."
                                          : "")
                                      : "file.pdf";

                                    return (
                                      <div
                                        key={index}
                                        className={`flex items-center space-x-2 rounded-lg py-3 px-3 cursor-pointer transition-colors ${
                                          isSelected
                                            ? "bg-blue-100 dark:bg-blue-900 border border-blue-500 dark:border-blue-400"
                                            : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }`}
                                        onClick={() => toggleSelection(index)}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() =>
                                            toggleSelection(index)
                                          }
                                          className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        <OptimizedImage
                                          src={
                                            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//pdf.svg`
                                          }
                                          alt=""
                                          width={ImageSizes.icon.sm.width}
                                          height={ImageSizes.icon.sm.height}
                                          className="h-5 w-5"
                                        />
                                        <p className="font-normal font-size-medium text-lightGray break-all dark:text-gray-200">
                                          {fileName}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {filteredCollections.length === 0 &&
                              filteredPreviews.length === 0 && (
                                <div className="col-span-2 flex flex-col items-center justify-center py-8">
                                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                                    <svg
                                      className="w-12 h-12"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  </div>
                                  <p className="text-lg font-medium text-lightGray dark:text-gray-200 mb-1">
                                    No Results Found
                                  </p>
                                  <p className="text-sm text-lightGray dark:text-gray-300 text-center max-w-md">
                                    We couldn&apos;t find any papers matching
                                    your search. Try adjusting your search terms
                                    or browse through the collections.
                                  </p>
                                </div>
                              )}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
                {filePreviews.length > 0 && (
                  <div>
                    {filePreviews.map((file, index) => (
                      <div
                        key={index}
                        className="flex flex-col space-y-2 p-2 mt-2 bg-gray-100 rounded"
                      >
                        <div className="flex items-center justify-between space-x-2">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-700 ">
                              {truncateFileName(file.name)}
                            </p>
                          </div>
                          <Button
                            onClick={() => removeFile(index)}
                            variant="outline"
                            size="sm"
                            className="bg-white border font-medium font-size-normal border-blue-600 px-3 py-1 text-blue-600 rounded-full"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {multiImport && (
                  <p className="font-semibold py-2 mt-4 border border-gray-300 rounded-sm font-size-small gap-x-2 pl-3 text-lightGray flex justify-start items-center ">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      onChange={handleCheckboxChange}
                      checked={filesConfirm}
                    />
                    <span className="text-lightGray text-md  font-semibold whitespace-nowrap">
                      Are you sure to import{" "}
                      <span className="text-blue-600 text-sm">
                        {fileLength}
                      </span>{" "}
                      number of Papers
                    </span>
                  </p>
                )}
              </div>
            </>
            

            <div className="flex justify-end items-center gap-2 mt-6">
              <button
                onClick={() => onOpenChange(false)}
                className="bg-white dark:bg-gray-700 border font-medium font-size-normal border-blue-600 dark:border-blue-400 px-3 py-1 text-blue-600 dark:text-blue-400 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleButtonClick}
                disabled={
                  loading || (!apiKey && !accessToken && files.length === 0)
                }
                className="bg-blue-600 dark:bg-blue-500 font-medium text-white rounded-full px-3 py-1 border-2 border-blue-500 dark:border-blue-400 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-700"
              >
                {loading ? <Loader /> : "Import"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
