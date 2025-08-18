import { usePathname } from "next/navigation";
import React, { useState, DragEvent, ChangeEvent, FormEvent } from "react";
import { upload } from "@/reducer/services/upload";
import toast from "react-hot-toast";
import { AppDispatch } from "@/reducer/store";
import { useDispatch, useSelector } from "react-redux";
import { UploadFile } from "@/apis/upload";
import { Loader } from "rizzui";
import FileListingDialog from "../Uploader/FileListingDialog";

interface UploadPDFProps {
  setSelectedPapers: (item: any) => void;
}
interface FilePreview {
  name: string;
  url: string;
  isPrivate: boolean;
}

const UploadPDF: React.FC<UploadPDFProps> = ({ setSelectedPapers }) => {
  const pathname = usePathname();
  const dispatch: AppDispatch = useDispatch();
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const currentProject = useSelector((state: any) => state?.project);

  const getLastItemFromUrl = (url: string) => {
    const parts = url.replace(/\/$/, "").split("/");
    return parseInt(parts[parts.length - 1]);
  };

  const uploadFileFn = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append("files", file);

        formData.append(
          `private[${index}]`,
          filePreviews[index]?.isPrivate.toString()
        );
      });
      formData.append("pathSegments", pathname?.replace("/explorer", ""));
      const folderId = getLastItemFromUrl(pathname);

      const parent_id = pathname.startsWith("/explorer")
        ? typeof folderId === "number"
          ? folderId
          : ""
        : "";
      const project_id: any =
        currentProject?.project?.id && currentProject?.project?.id !== null
          ? currentProject?.project?.id
          : localStorage.getItem("currentProject");
      const result = await UploadFile(formData, project_id, parent_id);
      dispatch(upload(true));
      if (result?.success) {
        toast.success(result?.message);
      }
    } catch (error: any) {
      console.error("Error uploading files:", error);
      toast.error(error?.response?.data?.message || "Error uploading files");
    } finally {
      dispatch(upload(true));
      setLoading(false);
    }
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
      setSelectedPapers?.((prevSelectedPapers: any) => [
        ...prevSelectedPapers,
        ...validFiles?.map((file, i) => ({
          ai_status: "Pending Upload",
          fileName: file.name,
          size: file.size,
          private: filePreviews?.[i]?.isPrivate,
        })),
      ]);
      if (validFiles.length > 0) {
        uploadFileFn();
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );

    if (droppedFiles.length > 0) {
      setIsOpen(true);
      setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
      setFilePreviews((prev) => [
        ...prev,
        ...droppedFiles.map((file) => ({
          name: file.name,
          url: URL.createObjectURL(file),
          isPrivate: false,
        })),
      ]);
    }
  };

  const onChangeFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
      ? Array.from(e.target.files).filter(
          (file) => file.type === "application/pdf"
        )
      : [];

    if (selectedFiles.length) {
      setIsOpen(true);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
      setFilePreviews((prev) => [
        ...prev,
        ...selectedFiles.map((file) => ({
          name: file.name,
          url: URL.createObjectURL(file),
          isPrivate: false,
        })),
      ]);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <div
        className={`relative mt-2 flex h-48 cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-white dark:bg-[#3A474B] dark:border-[#4D575A] shadow-sm transition-all hover:bg-gray-50 ${
          dragActive ? "border-2 border-black" : ""
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
          id="table-file-upload"
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={onChangeFiles}
          multiple
        />
        <label
          htmlFor="table-file-upload"
          className="flex flex-col items-center justify-center w-full h-full px-14"
        >
          <div className="min-w-[300px] flex justify-center items-center">
            {loading ? (
              <Loader variant="threeDot" size="lg" className="text-center" />
            ) : (
              <div className="flex justify-center flex-col items-center">
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
              </div>
            )}
          </div>
        </label>
      </div>
      <FileListingDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        files={files}
        setFiles={setFiles}
        filePreviews={filePreviews}
        setFilePreviews={setFilePreviews}
        handleFiles={handleFiles}
      />
    </form>
  );
};

export default UploadPDF;
