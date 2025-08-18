"use client";
import { ExplorerItems } from "@/components/Explorer/ExplorerItems";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImportDocs } from "@/components/Importcomponent/ImportDocs";
import { FolderWithFiles } from "@/types/types";
import {
  LayoutGrid,
  LayoutList,
  Star,
  Tags,
  Trash2,
  Layers3,
  Layers2,
  Upload,
  ChevronDown,
  Newspaper,
  Settings,
  ChevronUp,
  FileSpreadsheet,
  FileDown,
  FileCode,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { CreateFolderButton } from "./CreateFolderButton";
import { ExplorerTable } from "./ExplorerTable";
import FileCharts from "@/app/(app)/pdfcharts/Filechart";
import Uploader from "../Uploader/Uploader";
import { ExportItemButton } from "./ExportItemButton";
import { DeleteItemButton } from "./DeleteItemButton";
import { DropdownMenuSubContent } from "@radix-ui/react-dropdown-menu";
import moment from "moment";
import { parse } from "json2csv";
import * as FileSaver from "file-saver";
import { useDispatch, useSelector } from "react-redux";
import { MdOutlineFileDownload } from "react-icons/md";
import { TableDialog } from "./TableDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import ExcelJS from "exceljs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";
import toast from "react-hot-toast";
import { favorites } from "@/apis/favorites/favorites";
import ToastInfo from "../coman/ToastInfo";
import { useRouter } from "next-nprogress-bar";
import { folderAiChatDialog } from "@/reducer/services/folderSlice";
import NetworkChart from "@/app/(app)/pdfcharts/NetworkChart";

import { IoIosWarning } from "react-icons/io";
import { Loader, Text } from "rizzui";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import DraggableColumnForGenReport from "./ColumnsDialogForGenReport";

interface ExplorerViewProps {
  data?: any;
  showFolders?: boolean;
  hideAddFolderButton?: boolean;
  fetchFolders?: () => void;
  slugId?: any;
  setPageNo?: any;
  pageNo?: number;
  handleSorting?: (value: string) => void;
  setSearchQuery?: (value: string) => void;
  searchQuery?: string;
  loading?: boolean;
  setLoading?: any;
  setFilters?: (value: any) => void;
  allFilters?: any;
  setLimit?: (limit: number) => void;
  setSearchLoading?: (item: boolean) => void;
  limit?: number;
  searchLoading?: boolean | undefined;
  filterSubmit?: string;
  setFilterSubmit?: (item: string) => void;
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  data: initialData,
  fetchFolders,
  showFolders,
  hideAddFolderButton,
  slugId,
  setPageNo,
  pageNo,
  handleSorting,
  setSearchQuery,
  searchQuery,
  loading,
  setLoading,
  setFilters,
  allFilters,
  limit,
  setLimit,
  searchLoading,
  setSearchLoading,
  filterSubmit,
  setFilterSubmit,
}) => {
  const route = useRouter();
  const dispatch = useDispatch();
  const tableColumnsOptions = useSelector(
    (state: any) => state?.ExporerOptionalFilterData?.filterOptions
  );
  const user = useSelector((state: any) => state.user?.user?.user);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<any>([]);
  const [data, setData] = useState<FolderWithFiles | undefined>(initialData);
  const [isImportComponent, setIsImportComponent] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [allTags, setAllTags] = useState<{ label: string; value: string }[]>(
    []
  );
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [generateReportOpen, setGenerateReportOpen] = useState(false);
  const [viewSettingsOpen, setViewSettingsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [columnData, setColumnData] = useState<any>([]);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [tableColumns, setTableColumns] = useState<any>(
    tableColumnsOptions?.map((item: any) => ({
      ...item,
      visible: item.visible || false,
    }))
  );
  const [selectedColumn, setSelectedColumn] = useState<any>(tableColumns);
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [selectedSearchColumn, setSelectedSearchColumn] =
    useState<any>(selectedColumn);
  const [settings, setSettings] = useState<any>({
    font_size: 12,
    width: 150,
  });
  const { socket } = useSocket();

  const handleToggle = () => {
    setIsImportComponent((prev) => !prev);
  };

  useEffect(() => {
    if (initialData?.files) {
      const updatedSelectedPapers = selectedPapers.filter(
        (selectedPaper: any) => {
          return !initialData.files.some(
            (existingFile: any) =>
              existingFile.fileName === selectedPaper.fileName
          );
        }
      );
      setSelectedPapers(updatedSelectedPapers);

      const updatedData: any = {
        ...initialData,
        files: [...initialData.files, ...updatedSelectedPapers],
      };
      setData(updatedData);
    }
  }, [initialData]);

  useEffect(() => {
    if (initialData?.files) {
      const updatedData: any = {
        ...initialData,
        files: [...initialData.files, ...selectedPapers],
      };
      setData(updatedData);
    } else {
      const updatedData: any = {
        ...initialData,
        files: [...selectedPapers],
      };
      setData(updatedData);
    }
  }, [selectedPapers]);

  useEffect(() => {
    const savedActiveTab = localStorage.getItem("activeTab");
    if (savedActiveTab) {
      setActiveTab(savedActiveTab);
    } else {
      setActiveTab("active");
    }
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && activeTab !== null) {
      localStorage.setItem("activeTab", activeTab);
    }
  }, [activeTab, isClient]);

  useEffect(() => {
    if (data?.files && data?.files?.length > 0) {
      const tagdata: any = [];
      const tags = data?.files?.map((item: any) => {
        const tag = item?.tags;

        if (tag && tag?.length > 0) {
          tagdata?.push(
            tag?.map((item: any) => ({
              label: item?.name,
              value: item?.name,
            }))
          );
        }

        return tagdata?.flat();
      });

      setAllTags(removeDuplicates(tags?.flat()));
    }
  }, [data]);
  useEffect(() => {
    // setColumnData(selectedColumn);
    setColumnData(selectedColumn.filter((item: any) => item.visible));
  }, [selectedColumn]);
  useEffect(() => {
    setSelectedSearchColumn(tableColumnsOptions);
    setTableColumns(tableColumnsOptions);
  }, [tableColumnsOptions]);

  useEffect(() => {
    if (socket === null) {
      return;
    }
    if (socket) {
      socket.on("duplicateFile", (res: any) => {
        setSelectedPapers((prev: any) =>
          prev.filter((item: any) => item.fileName !== res.fileName)
        );
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 p-4">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 pt-0.5">
                  <IoIosWarning className="text-yellow-500 text-md" />
                </div>
                <div className="flex-1">
                  <Text className="text-gray-900 dark:text-gray-100 text-sm whitespace-normal break-words break-all">
                    {res?.message}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        ));
      });

      return () => {
        socket.off("duplicateFile");
      };
    }
  }, [socket, selectedPapers]);
  function removeDuplicates(array: { label: string; value: string }[]) {
    const uniqueLabels = new Set();
    return array.filter((item: { label: string; value: string }) => {
      if (uniqueLabels.has(item.label)) {
        return false;
      }
      uniqueLabels.add(item.label);
      return true;
    });
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (activeTab === null) {
    return null;
  }

  const itemName = "Selected Files";
  const itemType = "file";
  const toggleModal = () => {
    setIsModalOpen((prev: any) => !prev);
  };

  const toggleDeleteModal = () => {
    setIsDeleteModalOpen((prev: any) => !prev);
  };
  const handleTags = (tag: string) => {
    const originalFilters = allFilters?.filter(
      (item: any) => item.name !== "Tags"
    );
    let FileNameSelectedFIlters = allFilters?.find(
      (item: any) => item.name === "Tags"
    );
    FileNameSelectedFIlters = {
      ...FileNameSelectedFIlters,
      selectedFilters: !allFilters
        ?.find((tagFilter: any) => tagFilter?.name === "Tags")
        .selectedFilters.includes(tag)
        ? [...FileNameSelectedFIlters.selectedFilters, tag]
        : FileNameSelectedFIlters.selectedFilters?.filter(
            (selected: any) => selected !== tag
          ),
    };
    setFilters?.([...originalFilters, FileNameSelectedFIlters]);
    setPageNo(-1);
  };
  function bytesToMB(bytes: any) {
    const MB = 1024 * 1024;
    return (bytes / MB).toFixed(2) || 0;
  }

  const formattedArray = async () => {
    if (!data) return;

    const formattedData: any[] = [];
    const visibleColumns = tableColumnsOptions.filter(
      (col: any) => col.visible
    );
    const getRowData = (item: any) => {
      const row: any = {};
      visibleColumns.forEach((col: any) => {
        switch (col.field) {
          case "file_name":
            row[col.name] = item.name || item.fileName;
            break;
          case "status":
            row[col.name] = item.status;
            break;
          case "tags":
            row[col.name] = item?.tags?.map((tag: any) => tag.name).join(", ");
            break;
          case "number_of_page":
            row[col.name] = item?.pages;
            break;
          case "size":
            row[col.name] = bytesToMB(item.size) + "MB";
            break;
          case "last_update":
            row[col.name] = moment(item.dateProcessed).format(
              "YYYY-MM-DD HH:mm:ss"
            );
            break;
          case "upload_user_email":
            row[col.name] = user?.email;
            break;
          case "ai_status":
            row[col.name] = item.ai_status;
            break;
          case "citations":
            row[col.name] = item.CitationCount;
            break;
          case "authors":
            row[col.name] = item.authors;
            break;
          case "publication":
            row[col.name] = item.publication_date;
            break;
          case "publication_year":
            row[col.name] = item?.pdf_metadata?.PublicationYear;
          case "publication_date":
            row[col.name] = item?.pdf_search_data?.PublicationDate;
            break;
          case "publication_detail":
            if (
              item?.pdf_category_data?.PublicationDetails?.JournalName ||
              item?.pdf_category_data?.PublicationDetails?.PublicationYear
            ) {
              let journalString = "";
              if (item?.pdf_category_data?.PublicationDetails?.JournalName) {
                journalString += `Journal: ${item?.pdf_category_data?.PublicationDetails?.JournalName}`;
              }
              if (
                item?.pdf_category_data?.PublicationDetails?.PublicationYear
              ) {
                if (journalString) {
                  journalString += `, `;
                }
                journalString += `Year: ${item?.pdf_category_data?.PublicationDetails?.PublicationYear}`;
              }
              row[col.name] = journalString;
            } else {
              row[col.name] = "";
            }
          case "summary":
            row[col.name] = item?.pdf_search_data?.Summary;
            break;
          case "keyword":
            row[col.name] = row[col.name] = item?.pdf_metadata?.Keywords?.map(
              (keyword: string, i: number) => keyword
            ).join(", ");
            break;
          case "research_methods":
            row[col.name] = item?.pdf_metadata?.ResearchMethods;
            break;
          case "weakness_strength":
            row[col.name] = row[col.name] =
              item?.pdf_search_data.OverallStrengthsAndWeaknesses?.map(
                (value: string, i: number) => value
              ).join(", ");
            break;
          case "future_directions":
            row[col.name] = row[col.name] =
              item?.pdf_search_data.FutureDirectionsforFurtherResearch?.map(
                (value: string, i: number) => value
              ).join(", ");
            break;
          case "limitations":
            row[col.name] = row[col.name] =
              item?.pdf_search_data.LimitationsSharedByTheAuthor?.map(
                (value: string, i: number) => value
              ).join(", ");
            break;
          case "research_approach":
            row[col.name] = row[col.name] = Array.isArray(
              item?.pdf_search_data?.ResearchApproach
            ) ? (
              item.pdf_search_data.ResearchApproach.length > 0 ? (
                item.pdf_search_data.ResearchApproach.map(
                  (value: any) => value
                ).join(", ")
              ) : null
            ) : typeof item?.pdf_search_data?.ResearchApproach === "string" ? (
              <li className="list-disc">
                {item?.pdf_search_data?.ResearchApproach}
              </li>
            ) : null;
            break;
          case "author_affiliation":
            row[col.name] =
              item.pdf_category_data?.PublicationDetails?.AuthorAffiliations?.map(
                (value: string, i: number) => value
              ).join(", ");
            break;
          default:
            row[col.name] = item[col.key];
        }
      });
      return row;
    };

    if (data?.files?.length) {
      data.files.forEach((file: any) => {
        formattedData.push(getRowData(file));
      });
    }

    if (formattedData.length === 0) {
      console.warn("No data to export.");
      return;
    }
    return formattedData;
  };

  const exportToExcel = async (customGeneratedData: any) => {
    const data = Array.isArray(customGeneratedData)
      ? customGeneratedData
      : (await formattedArray()) || [];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("TableData");

    const fontSize = Number(settings.font_size.toString().replace("px", ""));

    const headers = Object.keys(data[0]);
    worksheet.columns = headers.map((header) => ({
      header,
      key: header,
      width: customGeneratedData ? Math.round(settings.width / 6) : 15,
    }));

    worksheet.addRows(data);

    if (customGeneratedData) {
      worksheet.eachRow((row: any, rowNumber: number) => {
        row.height = fontSize * 1.5;

        row.eachCell((cell: any) => {
          cell.font = {
            name: "Arial",
            size: fontSize,
            bold: rowNumber === 1,
          };

          cell.alignment = {
            vertical: "middle",
            horizontal: "left",
            wrapText: true,
          };
        });
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = "table_data.xlsx";

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportToCSV = async (customGeneratedData: any) => {
    try {
      if (!data) {
        console.warn("No data available to export.");
        return;
      }

      const formattedData = Array.isArray(customGeneratedData)
        ? customGeneratedData
        : (await formattedArray()) || [];

      if (formattedData.length === 0) {
        console.warn("No data to export.");
        return;
      }

      const csv = parse(formattedData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      FileSaver.saveAs(blob, "demo.csv");
    } catch (err) {
      console.error("Error generating CSV", err);
    }
  };

  const exportToXML = async (customGeneratedData: any) => {
    const formattedData = Array.isArray(customGeneratedData)
      ? customGeneratedData
      : (await formattedArray()) || [];

    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<data>`;

    const xmlFooter = `</data>`;

    const xmlBody = formattedData
      ?.map((row: any) => {
        return `  <item>\n${Object.entries(row)
          .map(([key, value]) => `    <${key}>${value}</${key}>`)
          .join("\n")}\n  </item>`;
      })
      .join("\n");

    const output = `${xmlHeader}\n${xmlBody}\n${xmlFooter}`;
    const mimeType = "application/xml";
    const extension = "xml";

    const blob = new Blob([output], { type: `${mimeType};charset=utf-8;` });
    FileSaver.saveAs(blob, `demo.${extension}`);
  };

  const extractFieldsInOrder = (items: any, requiredFields: any) => {
    return items?.map((item: any) => {
      const orderedEntries = requiredFields.map((field: any) => {
        let value = "N/A";

        switch (field) {
          case "author_affiliation":
            value =
              item?.pdf_category_data?.PublicationDetails?.AuthorAffiliations?.join(
                ", "
              ) || "N/A";
            break;
          case "file_name":
            value = item.fileName || "N/A";
            break;
          case "status":
            value = item.status || "N/A";
            break;
          case "tags":
            value = item?.tags?.map((tag: any) => tag.name).join(", ") || "N/A";
            break;
          case "number_of_page":
            value = item.pages || "N/A";
            break;
          case "ai_status":
            value = item.ai_status || "N/A";
            break;
          case "size":
            value = ((item.size || 0) / (1024 * 1024)).toFixed(2) + " MB";
            break;
          case "last_update":
            value = item.dateProcessed
              ? new Date(item.dateProcessed).toLocaleString()
              : "N/A";
            break;
          case "upload_user_email":
            value = "N/A";
            break;
          case "citations":
            value = item.CitationCount || "N/A";
            break;
          case "authors":
            value = item.authors || "N/A";
            break;
          case "publication_year":
            value =
              item.publication_year ||
              item?.pdf_metadata?.PublicationYear ||
              "N/A";
            break;
          case "publication_date":
            value =
              item.publication_date ||
              item?.pdf_metadata?.PublicationDate ||
              "N/A";
            break;
          case "publication_detail":
            const journal = item?.pdf_metadata?.JournalName;
            const year = item?.pdf_metadata?.PublicationYear;
            value =
              journal && year
                ? `Journal: ${journal}, Year: ${year}`
                : journal
                ? `Journal: ${journal}`
                : year
                ? `Year: ${year}`
                : "N/A";
            break;
          case "summary":
            value = item?.pdf_search_data?.Summary || "N/A";
            break;
          case "keyword":
            value = item?.pdf_metadata?.Keywords?.join(", ") || "N/A";
            break;
          case "research_methods":
            value = item?.pdf_metadata?.ResearchMethods || "N/A";
            break;
          case "weakness_strength":
            value =
              item?.pdf_search_data?.OverallStrengthsAndWeaknesses?.join(
                ", "
              ) || "N/A";
            break;
          case "future_directions":
            value =
              item?.pdf_search_data?.FutureDirectionsforFurtherResearch?.join(
                ", "
              ) || "N/A";
            break;
          case "limitations":
            value =
              item?.pdf_search_data?.LimitationsSharedByTheAuthor?.join(", ") ||
              "N/A";
            break;
          case "research_approach":
            value = item?.pdf_metadata?.ResearchApproach || "N/A";
            break;
          default:
            value = "N/A";
        }

        return [
          field
            .split("_")
            .map((word: string) =>
              word?.length > 0
                ? word?.charAt(0)?.toUpperCase() + word?.slice(1)?.toLowerCase()
                : ""
            )
            .join(" "),
          value,
        ];
      });

      return Object.fromEntries(orderedEntries);
    });
  };

  const renderPreview = () => {
    const column = columnData
      ?.filter((item: any) => item.visible)
      ?.map((item: any) => item.field);
    const extractedData = extractFieldsInOrder(data?.files, column);
    const cellStyle = {
      fontSize: `${settings.font_size}px`,
      width: `${settings.width}px`,
      minWidth: `${settings.width}px`,
      maxWidth: `${settings.width}px`,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    };

    switch (selectedFormat) {
      case "csv":
        return (
          <div className="p-4 rounded-lg max-h-[600px]  overflow-y-auto">
            <Table>
              <TableHeader className="bg-tableHeaderBackground border border-tableBorder">
                <TableRow>
                  {column?.map((header: string) => (
                    <TableHead
                      key={header}
                      className="border border-tableBorder"
                      style={cellStyle}
                    >
                      {header
                        .split("_")
                        .map((word) =>
                          word.length > 0
                            ? word?.charAt(0)?.toUpperCase() +
                              word?.slice(1)?.toLowerCase()
                            : ""
                        )
                        .join(" ")}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {extractedData?.map((row: any, index: number) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value: any, cellIndex: number) => (
                      <TableCell
                        key={cellIndex}
                        className="border border-tableBorder"
                        style={cellStyle}
                      >
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case "excel":
        return (
          <div className="p-4 rounded-lg max-h-[600px] overflow-y-auto">
            <Table className="border-2 border-tableBorder">
              <TableHeader>
                <TableRow className="bg-tableHeaderBackground">
                  {column?.map((header: string) => (
                    <TableHead
                      key={header}
                      className="border border-tableBorder"
                      style={cellStyle}
                    >
                      {header
                        .split("_")
                        .map((word) =>
                          word?.length > 0
                            ? word?.charAt(0)?.toUpperCase() +
                              word?.slice(1)?.toLowerCase()
                            : ""
                        )
                        .join(" ")}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {extractedData?.map((row: any, index: number) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value: any, cellIndex: number) => (
                      <TableCell
                        key={cellIndex}
                        className="border border-tableBorder"
                        style={cellStyle}
                      >
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case "xml":
        return (
          <div className="p-4 rounded-lg max-h-[600px] overflow-auto">
            <pre
              style={{ fontSize: `${settings.font_size}px` }}
              className="text-sm break-words break-all  text-wrap"
            >
              {`<?xml version="1.0" encoding="UTF-8"?>
<data>
${extractedData
  ?.map(
    (item: any) => `  <item>
${Object.entries(item)
  .map(([key, value]) => `    <${key}>${value}</${key}>`)
  .join("\n")}
  </item>`
  )
  .join("\n")}
</data>`}
            </pre>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSettings = (value: number, type: string) => {
    setSettings({ ...settings, [type]: value });
  };

  const handleMultipleItemFavorite = async () => {
    const filesToBeDeleted = data?.files
      ?.filter((file: any) => selectedItems.includes(file.id.toString()))
      ?.map((file: any) => ({
        itemId: String(file.id),
        itemType: "file",
        author_name:
          file?.pdf_search_data?.Authors || file?.pdf_metadata?.Authors || null,
      }));
    const foldersToBeDeleted = data?.subFolder
      ?.filter((folder: any) => selectedItems.includes(folder.id.toString()))
      ?.map((folder: any) => ({
        itemId: String(folder.id),
        itemType: "folder",
      }));

    try {
      setIsFavoriteLoading(true);
      const items = [
        ...(Array.isArray(filesToBeDeleted) ? filesToBeDeleted : []),
        ...(Array.isArray(foldersToBeDeleted) ? foldersToBeDeleted : []),
      ];

      const result: any = await favorites({ items: items });

      if (result?.data?.isSuccess) {
        toast.success(result?.data?.message);
      } else {
        toast.error(
          result?.response?.data?.message ||
            result?.message ||
            "An error occurred."
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // Function to check if any selected items are folders
  const hasSelectedFolders = () => {
    if (!selectedItems || selectedItems.length === 0) return false;

    // Get all folder IDs as strings
    const folderIds = (data?.subFolder || []).map((folder: any) => folder.id.toString());

    // Check if every selected item is a folder
    const allFolders = selectedItems.every((id: string) => folderIds.includes(id));

    // At least one item must be selected and all must be folders
    return allFolders && selectedItems.length > 0;
  };

  const handleChat = () => {
    if (selectedItems?.length > 1) {
      ToastInfo("Please select only one");
    } else {
      const filesToBeDeleted = data?.files
        ?.filter((file: any) => selectedItems.includes(file.id.toString()))
        ?.map((file: any) => ({
          itemId: String(file.id),
          itemType: "file",
        }));

      const foldersToBeDeleted = data?.subFolder
        ?.filter((folder: any) => selectedItems.includes(folder.id.toString()))
        ?.map((folder: any) => ({
          itemId: String(folder.id),
          itemType: "folder",
        }));

      if (filesToBeDeleted && filesToBeDeleted?.length > 0) {
        route.push(`info/${filesToBeDeleted?.[0].itemId}?tab=chat`);
      } else {
        dispatch(
          folderAiChatDialog({ show: true, id: foldersToBeDeleted?.[0].itemId })
        );
      }
    }
  };

  return (
    <>
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="flex items-center bg-headerBackground px-[24px] pb-[18px]">
            <div className="mr-auto flex items-center gap-2">
              <DropdownMenu onOpenChange={setIsOpen}>
                <DropdownMenuTrigger className="gap-3 cursor-pointer font-size-normal font-normal text-lightGray outline-none">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-[150px] flex justify-between items-center border-[#0E70FF]  rounded-[26px]  "
                  >
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap font-size-normal">
                      Actions
                    </span>
                    {isOpen ? (
                      <ChevronUp width={18} height={18} />
                    ) : (
                      <ChevronDown width={18} height={18} />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-2 bg-inputBackground border border-tableBorder ">
                  <DropdownMenuItem
                    onClick={handleToggle}
                    className="cursor-pointer"
                  >
                    <span className="flex gap-3 items-center justify-between">
                      <Upload
                        width={18}
                        height={18}
                        className=" rotate-180  dark:text-[#CCCCCC] text-[#666666]"
                      />
                      <span className="dark:text-[#CCCCCC] text-[#333333] text-[13px] font-normal ">
                        Import paper
                      </span>
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex gap-3 items-center cursor-pointer "
                    onClick={() => {
                      setGenerateReportOpen(true);
                      setTableColumns(
                        tableColumnsOptions?.map((item: any) => ({
                          ...item,
                          visible: item.visible || false,
                        }))
                      );
                    }}
                  >
                    <Newspaper
                      width={18}
                      height={18}
                      className="dark:text-[#CCCCCC] text-[#666666]"
                    />
                    <span className="dark:text-[#CCCCCC] text-[#333333] text-[13px] font-normal ">
                      Generate Report
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex gap-3 items-center justify-between cursor-pointer">
                      <Tags
                        width={18}
                        height={18}
                        className="dark:text-[#CCCCCC] text-[#666666]"
                      />
                      <span className="dark:text-[#CCCCCC] text-[#333333] text-[13px] font-normal ">
                        Tags
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="px-3 py-2  ml-2 bg-inputBackground border border-tableBorder">
                      <>
                        {allTags.length ? (
                          <>
                            {allTags?.map(
                              (
                                tag: { value: string; label: string },
                                index: number
                              ) => (
                                <DropdownMenuCheckboxItem
                                  onClick={(e: any) => handleTags(tag.label)}
                                  checked={allFilters
                                    ?.find(
                                      (tagFilter: any) =>
                                        tagFilter?.name === "Tags"
                                    )
                                    .selectedFilters.includes(tag.label)}
                                  key={`${tag?.value}-${index}`}
                                >
                                  {tag.label}
                                </DropdownMenuCheckboxItem>
                              )
                            )}
                          </>
                        ) : (
                          <span className="dark:text-[#CCCCCC] text-[#333333] text-[13px] font-normal">
                            No Tags
                          </span>
                        )}
                      </>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex gap-3 items-center justify-between cursor-pointer">
                      <MdOutlineFileDownload className="h-[20px] w-[20px] rotate-180 cursor-pointer dark:text-[#CCCCCC] text-[#666666]" />
                      <span className="dark:text-[#CCCCCC] text-[#333333] text-[13px] font-normal ">
                        Export Paper
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="px-3 py-2 ml-2 bg-inputBackground border border-tableBorder">
                      <DropdownMenuItem
                        onClick={exportToExcel}
                        className="dark:text-[#CCCCCC] text-[#333333] text-[13px] font-normal cursor-pointer"
                      >
                        Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={exportToCSV}
                        className="dark:text-[#CCCCCC] text-[#333333] text-[13px] font-normal cursor-pointer"
                      >
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={exportToXML}
                        className="dark:text-[#CCCCCC] text-[#333333] text-[13px] font-normal cursor-pointer"
                      >
                        XML
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem
                    className="flex gap-3 items-center cursor-pointer dark:text-[#CCCCCC] text-[#666666]"
                    onClick={() => setViewSettingsOpen(!viewSettingsOpen)}
                  >
                    <Settings
                      width={18}
                      height={18}
                      className="dark:text-[#CCCCCC] text-[#666666]"
                    />
                    <span className="dark:text-[#CCCCCC] text-[#333333] text-[13px] font-normal ">
                      View Settings
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {selectedItems?.length > 0 ? (
                <div className="flex items-center pag-2 rounded-lg bg-inputBackground ">
                  <div className="pl-2 pr-4 text-lightGray  text-sm ">
                    Selected: {selectedItems.length} item(s)
                  </div>
                  <div className="flex items-center">
                    <div className="border-l border-[#E5E5E5] h-[27px]" />
                    {isFavoriteLoading ? (
                      <Loader
                        variant="threeDot"
                        size="md"
                        className="h-4 w-4  ml-2"
                      />
                    ) : (
                      <Button
                        size="sm"
                        className="h-8 gap-1"
                        variant="link"
                        onClick={() => handleMultipleItemFavorite()}
                      >
                        <Star className="h-4 w-4 dark:text-[#CCCCCC] text-[#666666]" />
                      </Button>
                    )}

                    <Button size="sm" className="h-8 gap-1" variant="link">
                      <Trash2
                        className="h-4 w-4 dark:text-[#CCCCCC] text-[#666666]"
                        onClick={toggleDeleteModal}
                      />

                      {isDeleteModalOpen && (
                        <DeleteItemButton
                          itemId={selectedItems}
                          selectedItems={selectedItems?.length}
                          setSelectedItems={setSelectedItems}
                          isOpen={isDeleteModalOpen}
                          itemName={itemName}
                          fetchFolders={fetchFolders}
                          itemType={itemType}
                          onOpenChange={setIsDeleteModalOpen}
                          data={data}
                          isMultiTypeDelete={true}
                        />
                      )}
                    </Button>
                    {!hasSelectedFolders() && (
                      <MdOutlineFileDownload
                        className="h-[20px] w-[20px] mr-1 rotate-180 cursor-pointer dark:text-[#CCCCCC] text-[#666666]"
                        onClick={toggleModal}
                      />
                    )}
                    {isModalOpen && (
                      <ExportItemButton
                        itemId={selectedItems}
                        isOpen={isModalOpen}
                        onOpenChange={setIsModalOpen}
                        data={data}
                      />
                    )}
                    <div className="border-l border-[#E5E5E5] h-[27px]" />
                  </div>
                  <div className=" flex justify-center items-center">
                    <Button
                      size="sm"
                      className="gap-1"
                      variant="link"
                      onClick={() => handleChat()}
                    >
                      <ChatIcon />
                    </Button>
                  </div>
                </div>
              ) : (
                <></>
              )}

              <Button
                variant="outline"
                size="sm"
                className="h-8 btn rounded-[26px]  "
              >
                <Uploader
                  isSubfolder={true}
                  fetchFolders={fetchFolders}
                  button={true}
                  setSelectedPapers={setSelectedPapers}
                />
              </Button>

              {!hideAddFolderButton && (data?.subFolder && data?.subFolder?.length > 0 || slugId) && (
                <CreateFolderButton
                  fetchFolders={fetchFolders}
                  slugId={slugId}
                />
              )}

              {isImportComponent && (
                <ImportDocs
                  isOpen={isImportComponent}
                  fetchFolders={fetchFolders}
                  onOpenChange={setIsImportComponent}
                />
              )}
            </div>

            <TableDialog
              isOpen={viewSettingsOpen}
              onOpenChange={() => setViewSettingsOpen(false)}
              isViewFontSizeOnly={true}
            />

            <Dialog
              open={generateReportOpen}
              onOpenChange={(open) => {
                setGenerateReportOpen(open);
                if (!open) {
                  setCurrentStep(1);
                  setSettings({
                    font_size: 10,
                    width: 150,
                  });
                  setSelectedFormat("csv");
                }
              }}
            >
              <DialogContent
                className="w-full"
                onOpenAutoFocus={(e) => {
                  e.preventDefault();
                }}
              >
                <DialogTitle className="text-[18px] font-medium">
                  Generate Report
                </DialogTitle>

                <div className={`${currentStep === 1 ? "block" : "hidden"}`}>
                  <div>
                    <DraggableColumnForGenReport
                      selectedColumn={selectedColumn}
                      setSelectedColumn={setSelectedColumn}
                      selectedSearchColumn={selectedSearchColumn}
                      setSelectedSearchColumn={setSelectedSearchColumn}
                      isReportGenerate={true}
                    />
                  </div>
                </div>

                <div className={`${currentStep === 2 ? "block" : "hidden"}`}>
                  <div className="flex gap-2 mb-5 items-start flex-wrap md:flex-nowrap">
                    <div className="w-full">
                      <div className="space-y-1">
                        <label className="text-[12px]" htmlFor="font_size">
                          Font size
                        </label>
                        <Input
                          type="number"
                          value={settings?.font_size}
                          onChange={(e: any) =>
                            handleSettings(e.target.value, "font_size")
                          }
                          className="focus-visible:ring-none focus-visible:ring-0 border border-tableBorder"
                          placeholder="Font size"
                        />
                      </div>
                      <div className="h-5">
                        {" "}
                        {/* Fixed height container for error message */}
                        {(+settings?.font_size < 10 ||
                          +settings?.font_size > 20) && (
                          <p className="text-red-500 text-[12px]">
                            {+settings?.font_size < 10 &&
                              "Font size must be at least 10"}
                            {+settings?.font_size > 20 &&
                              "Font size must not exceed 20"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="w-full">
                      <div className="space-y-1">
                        <label className="text-[12px]" htmlFor="width">
                          Width
                        </label>
                        <Input
                          type="number"
                          value={settings?.width}
                          onChange={(e: any) =>
                            handleSettings(e.target.value, "width")
                          }
                          className="focus-visible:ring-none focus-visible:ring-0"
                          placeholder="Width"
                        />
                      </div>
                      <div className="h-5">
                        {" "}
                        {+settings?.width < 150 && (
                          <p className="text-red-500 text-[12px]">
                            Width must be at least 150
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`${
                    currentStep === 3 ? "block" : "hidden"
                  } w-[100%] min-w-[90%]`}
                >
                  <div className="bg-transparent">
                    <div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <input
                              type="radio"
                              id="csv"
                              name="format"
                              value="csv"
                              checked={selectedFormat === "csv"}
                              onChange={(e) =>
                                setSelectedFormat(e.target.value)
                              }
                              className="w-4 h-4  text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                          </div>
                          <label
                            htmlFor="csv"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <FileSpreadsheet className="h-[18px] w-[18px]" />
                            <span className="text-[15px] font-normal">CSV</span>
                          </label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <input
                              type="radio"
                              id="excel"
                              name="format"
                              value="excel"
                              checked={selectedFormat === "excel"}
                              onChange={(e) =>
                                setSelectedFormat(e.target.value)
                              }
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                          </div>
                          <label
                            htmlFor="excel"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <FileDown className="h-[18px] w-[18px]" />
                            <span className="text-[15px] font-normal">
                              Excel
                            </span>
                          </label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <input
                              type="radio"
                              id="xml"
                              name="format"
                              value="xml"
                              checked={selectedFormat === "xml"}
                              onChange={(e) =>
                                setSelectedFormat(e.target.value)
                              }
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                          </div>
                          <label
                            htmlFor="xml"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <FileCode className="h-[18px] w-[18px]" />
                            <span className="text-[15px] font-normal">XML</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`flex ${
                    currentStep > 1 ? "justify-between" : "justify-end"
                  } gap-3 mt-2`}
                >
                  {currentStep > 1 && (
                    <Button
                      className="btn text-[13px] rounded-[26px] text-white flex items-center gap-2"
                      variant="outline"
                      onClick={() => {
                        setCurrentStep(currentStep - 1);
                      }}
                    >
                      Back
                    </Button>
                  )}
                  <div className="flex gap-3">
                    {currentStep === 3 && (
                      <Button
                        variant="default"
                        onClick={() => {
                          setIsPreviewDialogOpen(true);
                        }}
                        className=" text-[13px] rounded-[26px] text-white dark:text-[#333333] "
                      >
                        Preview
                      </Button>
                    )}
                    <Button
                      className="btn text-[13px] rounded-[26px] text-white flex items-center gap-2"
                      variant="outline"
                      disabled={
                        currentStep === 1
                          ? !columnData?.some(
                              (item: any) => item?.visible === true
                            )
                          : currentStep === 2
                          ? +settings?.font_size < 10 ||
                            +settings?.font_size > 20 ||
                            +settings?.width < 150
                          : false
                      }
                      onClick={() => {
                        if (currentStep < 3) {
                          setCurrentStep(currentStep + 1);
                        } else {
                          const column = columnData
                            ?.filter((item: any) => item.visible)
                            ?.map((item: any) => item.field);
                          const extractedData = extractFieldsInOrder(
                            data?.files,
                            column
                          );

                          if (selectedFormat === "csv") {
                            exportToCSV(extractedData);
                          } else if (selectedFormat === "excel") {
                            exportToExcel(extractedData);
                          } else if (selectedFormat === "xml") {
                            exportToXML(extractedData);
                          }
                        }
                      }}
                    >
                      {currentStep !== 3 ? "Next" : "Export"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isPreviewDialogOpen}
              onOpenChange={(open) => {
                setIsPreviewDialogOpen(open);
              }}
            >
              <DialogContent className="max-w-[90%] max-h-[90%]">
                <DialogHeader>
                  <div className="flex justify-between items-center">
                    <DialogTitle>
                      Preview {selectedFormat.toUpperCase()} Format
                    </DialogTitle>
                  </div>
                </DialogHeader>
                {renderPreview()}
                <div className="flex justify-end mt-6">
                  <Button onClick={() => setIsPreviewDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <TabsList className=" border border-[#E7E7E7] rounded-[32px] p-2 py-">
              {/* <TabsTrigger
                value="nodeCharts"
                className="rounded-full p-1 data-[state=active]:text-[#FFFFFF]  data-[state=active]:border-2 data-[state=active]:border-[#FDAB2F]
    data-[state=active]:shadow-[0px_2px_4px_0px_#00000040]
    data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#F59B14] data-[state=active]:to-[#E68C07]"
              >
                <Layers3 width={18} height={18} />
              </TabsTrigger> */}
              <TabsTrigger
                value="FileCharts"
                className="rounded-full p-1 data-[state=active]:text-[#FFFFFF] data-[state=active]:border-2 data-[state=active]:border-[#FDAB2F]
                data-[state=active]:shadow-[0px_2px_4px_0px_#00000040]
                data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#F59B14] data-[state=active]:to-[#E68C07]"
              >
                <Layers2 width={18} height={18} />
              </TabsTrigger>

              <TabsTrigger
                value="active"
                className="rounded-full p-1 data-[state=active]:text-[#FFFFFF] data-[state=active]:border-2 data-[state=active]:border-[#FDAB2F]
                data-[state=active]:shadow-[0px_2px_4px_0px_#00000040]
                data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#F59B14] data-[state=active]:to-[#E68C07]"
              >
                <LayoutList width={18} height={18} />
              </TabsTrigger>
              <TabsTrigger
                value="items"
                className="rounded-full p-1 data-[state=active]:text-[#FFFFFF] data-[state=active]:border-2 data-[state=active]:border-[#FDAB2F]
    data-[state=active]:shadow-[0px_2px_4px_0px_#00000040]
    data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#F59B14] data-[state=active]:to-[#E68C07]"
              >
                <LayoutGrid width={18} height={18} />
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="mt-[-10px] px-[24px] pt-[24px]">
            <>
              {/* <TabsContent value="nodeCharts">
                <NetworkChart />
              </TabsContent> */}
              <TabsContent value="FileCharts">
                <FileCharts />
              </TabsContent>
              <TabsContent value="active">
                <ExplorerTable
                  setSearchLoading={setSearchLoading ?? ((item: boolean) => {})}
                  searchLoading={searchLoading ?? false}
                  data={data}
                  fetchFolders={fetchFolders}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                  setPageNo={setPageNo}
                  pageNo={pageNo}
                  handleSorting={handleSorting}
                  setSearchQuery={setSearchQuery}
                  searchQuery={searchQuery}
                  loading={loading}
                  setLoading={setLoading}
                  setFilters={setFilters}
                  allFilters={allFilters}
                  setLimit={setLimit}
                  limit={limit}
                  slugId={slugId}
                  filterSubmit={filterSubmit}
                  setFilterSubmit={setFilterSubmit ?? ((item: string) => {})}
                  selectedPapers={selectedPapers}
                  setSelectedPapers={setSelectedPapers}
                />
              </TabsContent>
              <TabsContent value="items">
                <ExplorerItems
                  data={data}
                  loading={loading}
                  showFolders={showFolders}
                  fetchFolders={fetchFolders}
                />
              </TabsContent>
            </>
          </div>
        </Tabs>
      </div>
    </>
  );
};
const ChatIcon = () => (
  <svg
    width="24"
    height="20"
    viewBox="0 0 25 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12.7571 4.73244C13.3549 4.38663 13.7571 3.74028 13.7571 3C13.7571 1.89543 12.8617 1 11.7571 1C10.6525 1 9.75708 1.89543 9.75708 3C9.75708 3.74028 10.1593 4.38663 10.7571 4.73244V6H8.75774C5.43362 6 2.75708 8.68349 2.75708 11.9937V14.0063C2.75708 17.3052 5.44367 20 8.75774 20H15.2571L21.7571 22.9998V11.9937C21.7571 8.69478 19.0705 6 15.7564 6H12.7571V4.73244ZM19.7571 19.6224V11.9937C19.7571 9.79539 17.962 8 15.7564 8H8.75774C6.54166 8 4.75708 9.78458 4.75708 11.9937V14.0063C4.75708 16.2046 6.5522 18 8.75774 18H16.2571L19.7571 19.6224ZM13.7571 12H15.7571V14H13.7571V12ZM8.75708 12H10.7571V14H8.75708V12Z"
      className="fill-[#666666] dark:fill-[#cccccc]"
    />
  </svg>
);
