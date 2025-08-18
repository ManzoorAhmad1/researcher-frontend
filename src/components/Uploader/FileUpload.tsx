"use client";

import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa6";
import { UploadFile } from "@/apis/upload";
import { useDispatch, useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { upload } from "@/reducer/services/upload";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import { AiOutlineLoading } from "react-icons/ai";
import { useDropzone } from "react-dropzone";
import { OptimizedImage } from "../ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

const FileUpload: any = ({ expand }: any) => {
  const route = useRouter();
  const [files, setFiles] = useState<any[]>([]);
  const [progressBar, setProgressBar] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const totalFiles = 5;
  const dispatch = useDispatch();
  const currentProject = useSelector((state: any) => state?.project);
  const pathname = usePathname();
  const { socket } = useSocket();
  const userData = useSelector((state: any) => state?.user?.user?.user ?? {});

  useEffect(() => {
    if (socket) {
      socket.on("uploadProgressBar", (data) => {
        if (data?.userId?.toString() === userData?.id?.toString()) {
          setProgressBar((prev) => {
            const updatedProgress = [...prev];
            const fileIndex = updatedProgress.findIndex(
              (file) => file.fileName === data.fileName
            );
            if (fileIndex !== -1) {
              updatedProgress[fileIndex] = data;
            } else {
              updatedProgress.push(data);
            }
            return updatedProgress;
          });
        }
      });

      return () => {
        socket.off("uploadProgressBar");
      };
    }
  }, [socket, userData]);

  const handleDelete = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setProgressBar((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFiles = (selectedFiles: File[]) => {
    const validFiles: File[] = selectedFiles.filter((file) => {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return false;
      } else if (file.size / 1024 / 1024 > 50) {
        toast.error("File size too big (max 50MB)");
        return false;
      }
      return true;
    });

    const newFiles = validFiles.map((file) => ({
      name: file.name,
      file,
      progress: 0,
      isPrivate: false,
    }));

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    uploadFiles(newFiles);
  };

  const uploadFiles = async (newFiles: any[]) => {
    try {
      toast.success(
        "Uploading your papers. We will notify you once it has been uploaded successfully."
      );
      setIsLoading(true);
      const formData = new FormData();
      newFiles.forEach((fileObj,index) => {
        formData.append("files", fileObj.file);
        formData.append(
          `private[${index}]`,
          "false"
        );  
      });
      const folderId = getLastItemFromUrl(pathname);
      const parent_id = pathname.startsWith("/explorer") ? folderId : "";
      formData.append("pathSegments", pathname?.replace("/explorer", ""));
      const project_id: any =
        currentProject?.project?.id && currentProject?.project?.id !== null
          ? currentProject?.project?.id
          : localStorage.getItem("currentProject");
      const result = await UploadFile(formData, project_id, parent_id);
      if (result?.success === false) {
        toast.error(result?.message);
        setFiles([]);
        setProgressBar([]);
      }
      setIsLoading(false);
      dispatch(upload(true));
      if (result?.success) {
        toast.success(result?.message);
      }
      setProgressBar((prevProgress) =>
        prevProgress.map((progress) => ({
          ...progress,
          percentCompleted: 100,
        }))
      );

      setFiles([]);
      setProgressBar([]);
    } catch (error: any) {
      setIsLoading(false);
      setFiles([]);
      setProgressBar([]);
      toast.error(error?.response?.data?.message);
      console.error("Error uploading files:", error);
    }
  };

  const getLastItemFromUrl = (url: string) => {
    const parts = url.replace(/\/$/, "").split("/");
    return parseInt(parts[parts.length - 1]);
  };

  const truncateFileName = (name: string) =>
    name.length > 20 ? `${name.slice(0, 17)}...` : name;

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: any) => handleFiles(acceptedFiles),
    accept: { "application/pdf": [] },
  });

  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const totalProgressPercentage =
    files.length > 0
      ? Math.floor(
          progressBar.reduce(
            (acc, file) => acc + (file.percentCompleted || 0),
            0
          ) / files.length
        )
      : 0;
  const offset =
    circumference - (circumference * totalProgressPercentage) / 100;

  return (
    <div className="mb-4">
      <div
        {...getRootProps()}
        className={`${expand && "w-[200px]"} mx-auto ${
          files.length > 0 && expand
            ? "h-[67px]"
            : expand
            ? "h-[140px]"
            : "h-auto"
        } flex flex-col items-center justify-center ${
          expand &&
          "border border-dashed rounded-lg border-primaryBorderColor bg-bgPrimaryGray"
        }`}
      >
        <input {...getInputProps()} />
        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer relative">
          <div className="w-7 h-7 bg-[#F59B14] rounded-full flex items-center justify-center">
            {!expand && isLoading ? (
              <AiOutlineLoading className="animate-spin text-white" size={20} />
            ) : (
              <FaPlus className="text-white" />
            )}
          </div>
          {files.length === 0 && expand && (
            <p className="font-size-md font-normal text-darkGray">
              Upload Files
            </p>
          )}
          {expand && (
            <p className="font-size-small font-normal text-secondaryGray">
              drag and drop file here
            </p>
          )}
        </label>
      </div>

      {files.length > 0 && expand && (
        <>
          <div className="w-[200px] mx-auto flex justify-between items-center my-2">
            <span className="font-size-small text-lightGray font-normal">
              Uploading {files.length} files
            </span>
            <span className="flex items-center gap-1 font-size-small text-lightGray">
              {totalProgressPercentage}%
              <svg width="32" height="32" className="relative">
                <circle
                  cx="16"
                  cy="16"
                  r={10}
                  stroke="#e5e5e5"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="16"
                  cy="16"
                  r={10}
                  strokeWidth="4"
                  stroke="#2D9CBF"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{
                    transition: "stroke-dashoffset 0.5s ease-in-out",
                    transform: "rotate(-90deg)",
                    transformOrigin: "50% 50%",
                  }}
                />
              </svg>
            </span>
          </div>
          <hr className="h-[1px] bg-gray-200 w-[200px] mx-auto" />
          <div className="overflow-y-auto overflow-x-hidden max-h-[240px]  mx-auto pl-2">
            {files.map((file, index) => {
              const fileProgress = progressBar.find(
                (p) => p.fileName === file.name
              ) || { percentCompleted: 0 };
              return (
                <div
                  key={index}
                  className="w-[200px] flex items-center mx-auto my-4 "
                >
                  <div className="flex flex-col items-center justify-between">
                    <div className="w-full flex items-center justify-between mr-3">
                      <div className="flex items-center gap-2">
                        <OptimizedImage
                          src={
                            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//emptyFile.svg`
                          }
                          alt="File icon"
                          width={ImageSizes.icon.sm.width}
                          height={ImageSizes.icon.sm.height}
                        />
                        <span className="text-lightGray font-size-small font-normal w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {truncateFileName(file.name)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-size-small text-lightGray">
                          {fileProgress.percentCompleted}%
                        </span>
                      </div>
                    </div>
                    <div className="w-[168px] relative mt-2 h-1.5 rounded-md bg-gray-200">
                      <div
                        className="absolute left-0 top-0 h-full rounded-md bg-primaryBlue"
                        style={{
                          width: `${fileProgress.percentCompleted}%`,
                          transition: "width 0.5s ease-in-out",
                        }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(index)}
                    className="ml-2 w-6 h-6"
                  >
                    <OptimizedImage
                      src={
                        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//cancelUploadFile.svg`
                      }
                      alt="Cancel"
                      width={ImageSizes.icon.sm.width}
                      height={ImageSizes.icon.sm.height}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default FileUpload;
