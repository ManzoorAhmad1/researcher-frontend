import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Worker } from "@react-pdf-viewer/core";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";

interface FileListingDialogProps {
  setFilePreviews: React.Dispatch<React.SetStateAction<any[]>>;
  filePreviews: any[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  handleFiles: any;
}

const FileListingDialog: React.FC<FileListingDialogProps> = ({
  isOpen,
  setIsOpen,
  files,
  setFiles,
  filePreviews,
  setFilePreviews,
  handleFiles,
}) => {
  const [selectAllPrivate, setSelectAllPrivate] = useState(false);

  const togglePrivate = (index: number, checked: boolean) => {
    setFilePreviews((prevPreviews) =>
      prevPreviews.map((preview, i) =>
        i === index ? { ...preview, isPrivate: checked } : preview
      )
    );
  };

  const toggleAllPrivate = (checked: boolean) => {
    setSelectAllPrivate(checked);
    setFilePreviews((prevPreviews) =>
      prevPreviews.map((preview) => ({
        ...preview,
        isPrivate: checked,
      }))
    );
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setFilePreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );
  };

  useEffect(() => {
    if (filePreviews?.length === 0) {
      setIsOpen(false);
    }
  }, [filePreviews?.length]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-4xl">
        <DialogTitle>Upload file</DialogTitle>

        {files.length > 0 && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Selected Files:</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-private"
                  checked={selectAllPrivate}
                  onCheckedChange={(checked) =>
                    toggleAllPrivate(checked as boolean)
                  }
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
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`private-${index}`}
                        checked={filePreviews[index]?.isPrivate || false}
                        onCheckedChange={(checked) =>
                          togglePrivate(index, checked as boolean)
                        }
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

            {filePreviews.length > 0 && (
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="mt-4 button-outline rounded-[26px]"
                  onClick={() =>
                    document.getElementById("table-file-upload")?.click()
                  }
                >
                  Add more
                </button>
                <button
                  type="submit"
                  className="mt-4 butt button-full rounded-[26px]"
                  onClick={() => handleFiles(files)}
                >
                  Upload Files
                </button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FileListingDialog;
