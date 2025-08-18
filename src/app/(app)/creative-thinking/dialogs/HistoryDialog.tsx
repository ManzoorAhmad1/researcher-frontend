import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { IoMdCopy } from "react-icons/io";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Button } from "rizzui";
import toast from "react-hot-toast";
import { HistoryDialogProps } from "../utils/types";
import Image from "next/image";

const HistoryDialog: React.FC<HistoryDialogProps> = ({
  keywordType,
  historyDialog,
  setHistoryDialog,
  scamperDatas,
}) => {
  const copyBtn =
    keywordType === "Research Question" ? "Copy Questions" : "Copy Topics";

  const getTextToCopy = () => {
    return scamperDatas
      ?.map((scamperData) => {
        return `${scamperData.title}\n${scamperData.ans}\n\n`;
      })
      .join("");
  };

  const sortedData = [...scamperDatas].sort((a, b) => {
    return (b.interested === true ? 1 : 0) - (a.interested === true ? 1 : 0);
  });

  const handleCopy = () => {
    toast.success("Copy to clipboard!");
  };

  return (
    <Dialog open={historyDialog} onOpenChange={() => setHistoryDialog(false)}>
      <DialogContent className="w-[80vw] max-w-[800px] h-[95vh] overflow-y-auto flex flex-col justify-between">
        <div className="relative flex-1 overflow-auto">
          <div className="mt-4">
            {sortedData?.length > 0 &&
              sortedData?.map((scamperData) => (
                <div
                  className={`mt-4 border-l-4 ps-3 rounded-md ${
                    scamperData?.interested
                      ? "border-[green]"
                      : "border-transparent italic"
                  }`}
                  key={scamperData?.id}
                >
                  <div className="font-bold text-md">
                    {scamperData?.interested && "*"}
                    <span className="ms-1">{scamperData?.title}</span>
                  </div>
                  <div>{scamperData?.ans}</div>
                </div>
              ))}
          </div>
        </div>

        <div className="text-end flex items-center justify-end">
          <CopyToClipboard text={getTextToCopy()}>
            <button
              onClick={() => handleCopy()}
              type="button"
              className="button-full flex items-center gap-2 rounded-[26px]"
            >
              <IoMdCopy className="text-[20px]" />
              {copyBtn}
            </button>
          </CopyToClipboard>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryDialog;
